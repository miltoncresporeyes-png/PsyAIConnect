import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AUTO_RELEASE_HOURS } from '@/lib/appointmentPolicy'

export const dynamic = 'force-dynamic'

/** El paciente reconfirma su asistencia a una cita ya aceptada por el profesional. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: params.id } })
    if (!appointment || appointment.patientId !== session.user.id) {
        return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }
    if (appointment.status !== 'CONFIRMED') {
        return NextResponse.json({ error: 'Solo puedes reconfirmar citas confirmadas' }, { status: 400 })
    }
    if (appointment.scheduledAt.getTime() <= Date.now()) {
        return NextResponse.json({ error: 'La cita ya comenzó o pasó' }, { status: 400 })
    }
    if (appointment.patientReconfirmedAt) {
        return NextResponse.json(appointment)
    }

    const updated = await prisma.appointment.update({
        where: { id: params.id },
        data: { patientReconfirmedAt: new Date() },
    })
    return NextResponse.json({ ...updated, autoReleaseHours: AUTO_RELEASE_HOURS })
}
