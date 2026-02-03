import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentOrder } from '@/lib/flow'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // Get base URL for callbacks
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

        // Create Flow payment order
        const paymentOrder = await createPaymentOrder({
            commerceOrder: appointment.id,
            subject: `Sesión con ${appointment.professional.user.name}`,
            amount: appointment.payment.amount,
            email: session.user.email!,
            urlConfirmation: `${baseUrl}/api/pagos/webhook`,
            urlReturn: `${baseUrl}/cita/${params.id}/exito`,
            optional: JSON.stringify({
                appointmentId: appointment.id,
                patientId: session.user.id,
            }),
        })

        // Update payment record with Flow order info
        await prisma.payment.update({
            where: { appointmentId: params.id },
            data: {
                flowToken: paymentOrder.token,
                flowOrderId: paymentOrder.flowOrder.toString(),
            },
        })

        return NextResponse.json({
            success: true,
            paymentUrl: paymentOrder.url,
            flowOrder: paymentOrder.flowOrder,
        })
    } catch (error) {
        console.error('Payment error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error al procesar el pago' },
            { status: 500 }
        )
    }
}
