import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const updateAppointmentSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    cancellationReason: z.string().trim().min(1).max(500).optional(),
})

// Transiciones permitidas según quién realiza la acción.
// La confirmación (→ CONFIRMED) no se hace por esta vía: ocurre en el flujo de pago.
const ALLOWED_TRANSITIONS: Record<'patient' | 'professional', Record<string, string[]>> = {
    patient: {
        PENDING: ['CANCELLED'],
        CONFIRMED: ['CANCELLED'],
    },
    professional: {
        PENDING: ['CANCELLED', 'NO_SHOW'],
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
                    select: { name: true, email: true, image: true },
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

        return NextResponse.json(appointment)
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

        // Update appointment
        const updatedAppointment = await prisma.appointment.update({
            where: { id: params.id },
            data: {
                status,
                ...(status === 'CANCELLED' && {
                    cancelledAt: new Date(),
                    cancelledBy: session.user.id,
                    cancellationReason,
                }),
            },
        })

        return NextResponse.json(updatedAppointment)
    } catch (error) {
        console.error('Appointment update error:', error)
        return NextResponse.json(
            { error: 'Error al actualizar cita' },
            { status: 500 }
        )
    }
}
