import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMultiProviderPaymentSession } from '@/lib/paymentService'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const blocked = getWaitlistBlockedResponse()
    if (blocked) return blocked

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: params.id },
            include: {
                payment: true,
                professional: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            },
        })

        if (!appointment) {
            return NextResponse.json(
                { error: 'Cita no encontrada' },
                { status: 404 }
            )
        }

        if (appointment.patientId !== session.user.id) {
            return NextResponse.json(
                { error: 'No tienes acceso a esta cita' },
                { status: 403 }
            )
        }

        if (appointment.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Esta cita ya fue procesada' },
                { status: 400 }
            )
        }

        if (!appointment.payment) {
            return NextResponse.json(
                { error: 'Registro de pago no encontrado' },
                { status: 404 }
            )
        }

        // Read optional provider from request body
        let provider: any = 'FLOW'
        try {
            const body = await request.json()
            if (body?.provider) {
                provider = body.provider
            }
        } catch {
            // body is optional, defaults to FLOW
        }

        // Get base URL for callbacks
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'

        const result = await createMultiProviderPaymentSession({
            appointmentId: appointment.id,
            provider,
            baseUrl,
            patientEmail: session.user.email!,
            patientName: session.user.name || 'Paciente',
            professionalName: appointment.professional.user.name || 'Profesional',
            amount: appointment.payment.amount,
            subscriptionTier: appointment.professional.subscriptionTier,
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Error al iniciar la sesión de pago' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            paymentUrl: result.paymentUrl,
            provider: result.provider,
            externalOrderId: result.externalOrderId,
        })
    } catch (error) {
        console.error('Payment error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error al procesar el pago' },
            { status: 500 }
        )
    }
}
