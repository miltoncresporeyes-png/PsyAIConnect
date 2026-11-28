import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import { getDisabledPaymentMethodIds } from '@/lib/paymentMethodSettings'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
    NO_SHOW_WAIT_MINUTES,
    canMarkNoShow,
    needsReconfirmation,
    notifyPatientDecision,
} from '@/lib/appointmentPolicy'
import { redactMeetingLinks } from '@/lib/meetingLink'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const updateAppointmentSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    cancellationReason: z.string().trim().min(1).max(500).optional(),
})

// Transiciones permitidas según quién realiza la acción.
// La confirmación (→ CONFIRMED) la hace el profesional al aceptar la solicitud
// (PsyDoctor no intermedia el pago en esta etapa). El paciente nunca puede confirmar.
const ALLOWED_TRANSITIONS: Record<'patient' | 'professional', Record<string, string[]>> = {
    patient: {
        PENDING: ['CANCELLED'],
        CONFIRMED: ['CANCELLED'],
    },
    professional: {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['CANCELLED', 'COMPLETED', 'NO_SHOW'],
    },
}

export async function GET(
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
                professional: {
                    include: {
                        user: {
                            select: { name: true, image: true, email: true },
                        },
                    },
                },
                patient: {
                    select: { name: true, email: true, image: true, noShowCount: true },
                },
                payment: true,
            },
        })

        if (!appointment) {
            return NextResponse.json(
                { error: 'Cita no encontrada' },
                { status: 404 }
            )
        }

        // Verify user is either patient or professional
        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (appointment.patientId !== session.user.id &&
            professional?.id !== appointment.professionalId) {
            return NextResponse.json(
                { error: 'No tienes acceso a esta cita' },
                { status: 403 }
            )
        }

        // El enlace de videollamada del profesional es privado: el paciente lo obtiene en /unirse
        const viewerIsProfessional = professional?.id === appointment.professionalId
        const disabledMethods = await getDisabledPaymentMethodIds()
        const visible = {
            ...appointment,
            professional: {
                ...appointment.professional,
                acceptedPaymentMethods: (appointment.professional.acceptedPaymentMethods ?? []).filter((m: string) => !disabledMethods.has(m)),
            },
        }
        return NextResponse.json(redactMeetingLinks(visible, viewerIsProfessional))
    } catch (error) {
        console.error('Appointment fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener cita' },
            { status: 500 }
        )
    }
}

export async function PATCH(
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

        const body = await request.json().catch(() => null)
        const parsed = updateAppointmentSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: parsed.error.errors },
                { status: 400 }
            )
        }

        const { status, cancellationReason } = parsed.data

        const appointment = await prisma.appointment.findUnique({
            where: { id: params.id },
        })

        if (!appointment) {
            return NextResponse.json(
                { error: 'Cita no encontrada' },
                { status: 404 }
            )
        }

        // Verify user is either patient or professional
        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        const isPatient = appointment.patientId === session.user.id
        const isProfessional = professional?.id === appointment.professionalId

        if (!isPatient && !isProfessional) {
            return NextResponse.json(
                { error: 'No tienes acceso a esta cita' },
                { status: 403 }
            )
        }

        // Aplicar transiciones permitidas para este rol
        const actor: 'patient' | 'professional' = isProfessional ? 'professional' : 'patient'
        const allowedTargets = ALLOWED_TRANSITIONS[actor][appointment.status] ?? []

        if (!allowedTargets.includes(status)) {
            return NextResponse.json(
                { error: 'Transición de estado no permitida' },
                { status: 403 }
            )
        }

        if (status === 'CANCELLED' && !cancellationReason) {
            return NextResponse.json(
                { error: 'El motivo de cancelación es requerido' },
                { status: 400 }
            )
        }

        const now = new Date()

        // Finalizar la sesion: solo una vez iniciada la hora de la cita
        if (status === 'COMPLETED' && now.getTime() < appointment.scheduledAt.getTime()) {
            return NextResponse.json({ error: 'La sesión aún no comienza' }, { status: 400 })
        }

        // Inasistencia: solo pasado el tiempo de espera, y queda evidencia de asistencia
        if (status === 'NO_SHOW') {
            if (!canMarkNoShow(appointment.scheduledAt, now)) {
                return NextResponse.json(
                    {
                        error: `Debes esperar ${NO_SHOW_WAIT_MINUTES} minutos desde la hora de inicio para registrar una inasistencia`,
                    },
                    { status: 400 }
                )
            }
            if (appointment.patientJoinedAt) {
                return NextResponse.json(
                    { error: 'El paciente sí ingresó a la sala de espera, no se puede registrar como inasistencia' },
                    { status: 400 }
                )
            }
            const [noShowAppointment] = await prisma.$transaction([
                prisma.appointment.update({
                    where: { id: params.id },
                    data: {
                        status: 'NO_SHOW',
                        noShowMarkedAt: now,
                        noShowEvidence: {
                            markedBy: session.user.id,
                            markedAt: now.toISOString(),
                            scheduledAt: appointment.scheduledAt.toISOString(),
                            pacienteOnline: appointment.pacienteOnline,
                            patientJoinedAt: null, // no ingreso a la sala (de lo contrario no se llega aqui)
                            professionalJoinedAt: appointment.professionalJoinedAt?.toISOString() ?? null,
                            reconfirmedAt: appointment.patientReconfirmedAt?.toISOString() ?? null,
                        },
                    },
                }),
                prisma.user.update({
                    where: { id: appointment.patientId },
                    data: { noShowCount: { increment: 1 } },
                }),
            ])
            return NextResponse.json(noShowAppointment)
        }

        // Update appointment
        const updatedAppointment = await prisma.appointment.update({
            where: { id: params.id },
            data: {
                status,
                ...(status === 'CONFIRMED' && {
                    professionalConfirmedAt: now,
                    // Con menos de 24h de anticipacion no hay ventana para reconfirmar
                    ...(!needsReconfirmation(appointment.scheduledAt, now) && { patientReconfirmedAt: now }),
                }),
                ...(status === 'COMPLETED' && {
                    attendanceStatus: 'FINALIZADA' as const,
                    sessionEndedAt: now,
                }),
                ...(status === 'CANCELLED' && {
                    cancelledAt: now,
                    cancelledBy: session.user.id,
                    cancellationReason,
                }),
            },
        })

        // Avisar al paciente cuando el profesional decide
        if (actor === 'professional' && (status === 'CONFIRMED' || status === 'CANCELLED')) {
            void notifyPatientDecision(
                params.id,
                status === 'CONFIRMED',
                status === 'CANCELLED' ? cancellationReason : undefined
            ).catch((err) => console.error('Notify patient error:', err))
        }

        return NextResponse.json(updatedAppointment)
    } catch (error) {
        console.error('Appointment update error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar cita' },
            { status: 500 }
        )
    }
}
