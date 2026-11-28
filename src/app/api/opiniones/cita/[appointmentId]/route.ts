import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { INVITE_EXPIRES_MS } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

/** Datos para el formulario de opinión: a quién se evalúa y si ya existe una opinión. */
export async function GET(_req: Request, { params }: { params: { appointmentId: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const a = await prisma.appointment.findUnique({
        where: { id: params.appointmentId },
        select: {
            id: true,
            patientId: true,
            status: true,
            scheduledAt: true,
            professional: { select: { slug: true, user: { select: { name: true } } } },
            review: {
                select: { id: true, rating: true, punctuality: true, clarity: true, booking: true, recommends: true, comment: true, status: true, editableUntil: true },
            },
        },
    })
    if (!a || a.patientId !== session.user.id) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })

    const expired = Date.now() - a.scheduledAt.getTime() > INVITE_EXPIRES_MS
    return NextResponse.json({
        appointmentId: a.id,
        professionalName: a.professional.user.name,
        professionalSlug: a.professional.slug,
        scheduledAt: a.scheduledAt,
        eligible: a.status === 'COMPLETED' && !a.review && !expired,
        reason: a.status !== 'COMPLETED' ? 'not_completed' : expired && !a.review ? 'expired' : null,
        review: a.review,
    })
}
