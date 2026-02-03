import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const appointmentSchema = z.object({
    professionalId: z.string(),
    scheduledAt: z.string().datetime(),
    modality: z.enum(['ONLINE', 'IN_PERSON']),
    consultationReason: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Debes iniciar sesión para reservar' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const data = appointmentSchema.parse(body)

        // Get professional
        const professional = await prisma.professional.findUnique({
            where: { id: data.professionalId },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        // Check if slot is available
        const scheduledAt = new Date(data.scheduledAt)
        const scheduledEnd = new Date(scheduledAt.getTime() + professional.sessionDuration * 60000)

        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                professionalId: data.professionalId,
                scheduledAt: {
                    gte: new Date(scheduledAt.getTime() - professional.sessionDuration * 60000),
                    lte: scheduledEnd,
                },
                status: {
                    in: ['PENDING', 'CONFIRMED'],
                },
            },
        })

        if (existingAppointment) {
            return NextResponse.json(
                { error: 'Este horario ya no está disponible' },
                { status: 400 }
            )
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId: session.user.id,
                professionalId: data.professionalId,
                scheduledAt,
                duration: professional.sessionDuration,
                modality: data.modality,
                consultationReason: data.consultationReason,
                status: 'PENDING',
            },
        })

        // Create payment record (pending)
        const commissionRate = professional.subscriptionTier === 'PREMIUM' ? 0.05 :
            professional.subscriptionTier === 'PRO' ? 0.08 : 0.12
        const commission = Math.round(professional.sessionPrice * commissionRate)

        await prisma.payment.create({
            data: {
                appointmentId: appointment.id,
                amount: professional.sessionPrice,
                commission,
                netAmount: professional.sessionPrice - commission,
                status: 'PENDING',
            },
        })

        return NextResponse.json({
            success: true,
            appointmentId: appointment.id,
            message: 'Reserva creada. Procede al pago para confirmar.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Appointment create error:', error)
        return NextResponse.json(
            { error: 'Error al crear la reserva' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role') || 'patient'

        let appointments

        if (role === 'professional') {
            // Get professional's appointments
            const professional = await prisma.professional.findUnique({
                where: { userId: session.user.id },
            })

            if (!professional) {
                return NextResponse.json(
                    { error: 'Perfil profesional no encontrado' },
                    { status: 404 }
                )
            }

            appointments = await prisma.appointment.findMany({
                where: { professionalId: professional.id },
                include: {
                    patient: {
                        select: { name: true, email: true, image: true },
                    },
                    payment: true,
                },
                orderBy: { scheduledAt: 'desc' },
            })
        } else {
            // Get patient's appointments
            appointments = await prisma.appointment.findMany({
                where: { patientId: session.user.id },
                include: {
                    professional: {
                        include: {
                            user: {
                                select: { name: true, image: true },
                            },
                        },
                    },
                    payment: true,
                    invoice: true,
                },
                orderBy: { scheduledAt: 'desc' },
            })
        }

        return NextResponse.json(appointments)
    } catch (error) {
        console.error('Appointments fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener citas' },
            { status: 500 }
        )
    }
}
