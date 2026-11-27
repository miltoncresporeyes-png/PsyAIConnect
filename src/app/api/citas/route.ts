import { SESSION_COMMISSION_RATE } from '@/lib/plans'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import { redactMeetingLinks } from '@/lib/meetingLink'
import {
    MAX_UPCOMING_FOR_NEW_PATIENT,
    NO_SHOW_BLOCK_THRESHOLD,
    notifyProfessionalNewRequest,
} from '@/lib/appointmentPolicy'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const appointmentSchema = z.object({
    professionalId: z.string(),
    scheduledAt: z.string().datetime(),
    modality: z.enum(['ONLINE', 'IN_PERSON']),
    consultationReason: z.string().optional(),
    guestEmail: z.string().email().optional(),
    policyAccepted: z.literal(true, {
        errorMap: () => ({ message: 'Debes aceptar la política de cancelación para reservar' }),
    }),
})

export async function POST(request: Request) {
    const blocked = getWaitlistBlockedResponse()
    if (blocked) return blocked

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Debes iniciar sesión para reservar' },
                { status: 401 }
            )
        }

        const clientIp = getClientIp(request)
        const bookingLimit = checkRateLimit(`appointments:create:${session.user.id}:${clientIp}`, {
            limit: 15,
            windowMs: 15 * 60 * 1000,
        })

        if (!bookingLimit.allowed) {
            return NextResponse.json(
                { error: 'Demasiados intentos de reserva. Intenta nuevamente mas tarde.' },
                { status: 429, headers: createRateLimitHeaders(bookingLimit) }
            )
        }

        const body = await request.json()
        const data = appointmentSchema.parse(body)

        // Resolve patient: authenticated user or guest (email-based)
        let patientId: string | null = session?.user?.id ?? null

        if (!patientId) {
            if (!data.guestEmail) {
                return NextResponse.json(
                    { error: 'Ingresa tu correo electrónico para reservar como invitado' },
                    { status: 400 }
                )
            }

            let guestUser = await prisma.user.findUnique({
                where: { email: data.guestEmail.toLowerCase() },
            })

            if (!guestUser) {
                guestUser = await prisma.user.create({
                    data: {
                        email: data.guestEmail.toLowerCase(),
                        role: 'PATIENT',
                        emailVerified: null,
                        profileCompleted: false,
                    },
                })
            }

            patientId = guestUser.id
        }

        // Reputación del paciente: bloqueo por inasistencias reiteradas
        const patientRecord = await prisma.user.findUnique({
            where: { id: patientId! },
            select: { noShowCount: true },
        })
        if ((patientRecord?.noShowCount ?? 0) >= NO_SHOW_BLOCK_THRESHOLD) {
            return NextResponse.json(
                {
                    error:
                        'Tu cuenta tiene reservas bloqueadas por inasistencias reiteradas. Escríbenos a contacto@psydoctor.cl para revisarlo.',
                },
                { status: 403 }
            )
        }

        // Paciente nuevo (sin sesiones completadas): una sola cita futura activa a la vez
        const [completedCount, upcomingActive] = await Promise.all([
            prisma.appointment.count({ where: { patientId: patientId!, status: 'COMPLETED' } }),
            prisma.appointment.count({
                where: {
                    patientId: patientId!,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    scheduledAt: { gte: new Date() },
                },
            }),
        ])
        if (completedCount === 0 && upcomingActive >= MAX_UPCOMING_FOR_NEW_PATIENT) {
            return NextResponse.json(
                {
                    error:
                        'Ya tienes una cita pendiente. Podrás reservar otra cuando se realice o la canceles.',
                },
                { status: 400 }
            )
        }

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
                patientId: patientId!,
                professionalId: data.professionalId,
                scheduledAt,
                duration: professional.sessionDuration,
                modality: data.modality,
                consultationReason: data.consultationReason,
                status: 'PENDING',
                policyAcceptedAt: new Date(),
            },
        })

        // Avisar al profesional que tiene una solicitud por aceptar
        void notifyProfessionalNewRequest(appointment.id).catch((err) =>
            console.error('Notify professional error:', err)
        )

        // Create payment record (pending)
        const commission = Math.round(professional.sessionPrice * SESSION_COMMISSION_RATE)

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
            message: 'Reserva solicitada. El profesional debe aceptarla para confirmarla.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        if ((error as any)?.code === 'P2002') { return NextResponse.json({ error: 'El horario seleccionado acaba de ser reservado por otro usuario. Por favor selecciona otro horario.' }, { status: 409 }) }
        console.error('Appointment create error:', error)
        return NextResponse.json(
            { error: 'Error al crear la reserva' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role') || 'patient'

        // Una cita puntual (sala de videollamada): la devuelve solo a sus participantes
        const appointmentId = searchParams.get('id')
        if (appointmentId) {
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    professional: { include: { user: { select: { name: true, image: true } } } },
                    patient: { select: { name: true, email: true, image: true } },
                    payment: true,
                },
            })
            const isParticipant =
                appointment &&
                (appointment.patientId === session.user.id || appointment.professional.userId === session.user.id)
            if (!appointment || !isParticipant) {
                return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
            }
            const viewerIsProfessional = appointment.professional.userId === session.user.id
            return NextResponse.json([redactMeetingLinks(appointment, viewerIsProfessional)])
        }

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
                        select: { name: true, email: true, image: true, noShowCount: true },
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

        // En el listado del paciente nunca se incluye el enlace privado del profesional
        const result =
            role === 'professional' ? appointments : appointments.map((a) => redactMeetingLinks(a, false))
        return NextResponse.json(result)
    } catch (error) {
        console.error('Appointments fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener citas' },
            { status: 500 }
        )
    }
}
