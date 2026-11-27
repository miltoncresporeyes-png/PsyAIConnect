import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { appointmentToEvent, buildIcs } from '@/lib/calendarLinks'

export const dynamic = 'force-dynamic'

/** Descarga la cita como archivo .ics (Google Calendar, Apple, Outlook). Solo para sus participantes. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: {
            patient: { select: { name: true } },
            professional: { select: { userId: true, officeAddress: true, user: { select: { name: true } } } },
        },
    })
    if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })

    const isPatient = appointment.patientId === session.user.id
    const isProfessional = appointment.professional.userId === session.user.id
    if (!isPatient && !isProfessional) {
        return NextResponse.json({ error: 'No tienes acceso a esta cita' }, { status: 403 })
    }
    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
        return NextResponse.json({ error: 'La cita no está vigente' }, { status: 400 })
    }

    const event = appointmentToEvent({
        appointmentId: appointment.id,
        scheduledAt: appointment.scheduledAt,
        durationMin: appointment.duration,
        modality: appointment.modality,
        otherPartyName: isPatient ? appointment.professional.user.name : appointment.patient.name,
        baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        officeAddress: appointment.professional.officeAddress,
    })

    return new NextResponse(buildIcs(event), {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="sesion-psydoctor.ics"',
            'Cache-Control': 'no-store',
        },
    })
}
