import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

export async function GET(
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
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { status, cancellationReason } = await request.json()

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

        if (appointment.patientId !== session.user.id &&
            professional?.id !== appointment.professionalId) {
            return NextResponse.json(
                { error: 'No tienes acceso a esta cita' },
                { status: 403 }
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
