import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isWithinJoinWindow } from '@/lib/meetingLink'
import { createMeetSpace, GoogleMeetError } from '@/lib/googleMeet'

export const dynamic = 'force-dynamic'

function isMeetLink(url: string | null): url is string {
    try {
        return url != null && new URL(url).hostname === 'meet.google.com'
    } catch {
        return false
    }
}

/**
 * Entrega la sala de Meet de ESTA cita a quien participa de ella, solo dentro de la ventana de
 * atencion, y registra la asistencia (evidencia de que la persona intento conectarse).
 * La sala se crea la primera vez que alguien ingresa: cada cita tiene su propio enlace.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: { professional: { select: { userId: true } } },
    })
    if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })

    const isPatient = appointment.patientId === session.user.id
    const isProfessional = appointment.professional.userId === session.user.id
    if (!isPatient && !isProfessional) {
        return NextResponse.json({ error: 'No tienes acceso a esta cita' }, { status: 403 })
    }
    if (appointment.status !== 'CONFIRMED') {
        return NextResponse.json({ error: 'La cita no está confirmada' }, { status: 400 })
    }
    if (appointment.modality !== 'ONLINE') {
        return NextResponse.json({ error: 'Esta cita es presencial' }, { status: 400 })
    }

    const now = new Date()
    if (!isWithinJoinWindow(appointment.scheduledAt, appointment.duration, now)) {
        return NextResponse.json(
            { error: 'La sala se habilita 15 minutos antes de la hora de la cita.' },
            { status: 400 }
        )
    }

    let link = isMeetLink(appointment.videoLink) ? appointment.videoLink : null
    if (!link) {
        try {
            const space = await createMeetSpace()
            // Si dos personas entran a la vez, gana la primera escritura y las demas reutilizan su sala
            const claimed = await prisma.appointment.updateMany({
                where: { id: appointment.id, OR: [{ videoLink: null }, { meetSpaceName: null }] },
                data: { videoLink: space.meetingUri, meetSpaceName: space.name },
            })
            if (claimed.count > 0) {
                link = space.meetingUri
            } else {
                const fresh = await prisma.appointment.findUnique({
                    where: { id: appointment.id },
                    select: { videoLink: true },
                })
                link = isMeetLink(fresh?.videoLink ?? null) ? (fresh?.videoLink ?? null) : space.meetingUri
            }
        } catch (err) {
            console.error('[unirse] no se pudo crear la sala de Meet:', err)
            const notReady = err instanceof GoogleMeetError && (err.code === 'NOT_CONFIGURED' || err.code === 'NOT_CONNECTED')
            return NextResponse.json(
                {
                    error: notReady
                        ? 'La videollamada aún no está habilitada en la plataforma. Escríbenos a contacto@psydoctor.cl.'
                        : 'No pudimos crear la sala de videollamada. Inténtalo de nuevo en unos segundos.',
                },
                { status: notReady ? 503 : 502 }
            )
        }
    }

    await prisma.appointment.update({
        where: { id: appointment.id },
        data: isPatient
            ? { pacienteOnline: true, patientJoinedAt: appointment.patientJoinedAt ?? now }
            : {
                  profesionalOnline: true,
                  professionalJoinedAt: appointment.professionalJoinedAt ?? now,
                  attendanceStatus: 'EN_SESION',
                  sessionStartedAt: appointment.sessionStartedAt ?? now,
              },
    })

    return NextResponse.json({ url: link })
}
