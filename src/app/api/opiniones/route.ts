import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { REVIEW_EDIT_WINDOW_MS, INVITE_EXPIRES_MS, createReviewSchema, moderateComment } from '@/lib/reviews'
import { recomputeProfessionalReputation } from '@/lib/reputationSync'

export const dynamic = 'force-dynamic'

/** Crea la opinión del paciente sobre una cita completada (una por cita). */
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const parsed = createReviewSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Revisa los datos de tu opinión' }, { status: 400 })
    const data = parsed.data

    const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        select: { id: true, patientId: true, professionalId: true, status: true, scheduledAt: true, review: { select: { id: true } } },
    })
    if (!appointment || appointment.patientId !== session.user.id) {
        return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }
    if (appointment.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Solo puedes opinar sobre sesiones completadas' }, { status: 400 })
    }
    if (appointment.review) {
        return NextResponse.json({ error: 'Ya enviaste tu opinión sobre esta sesión' }, { status: 409 })
    }
    if (Date.now() - appointment.scheduledAt.getTime() > INVITE_EXPIRES_MS) {
        return NextResponse.json({ error: 'El plazo para opinar sobre esta sesión terminó' }, { status: 400 })
    }

    const comment = data.comment?.trim() || null
    const moderation = moderateComment(comment)

    try {
        const review = await prisma.review.create({
            data: {
                appointmentId: appointment.id,
                patientId: session.user.id,
                professionalId: appointment.professionalId,
                rating: data.rating,
                punctuality: data.punctuality ?? null,
                clarity: data.clarity ?? null,
                booking: data.booking ?? null,
                recommends: data.recommends ?? null,
                comment,
                status: moderation.status,
                flagReason: moderation.status === 'PENDING_REVIEW' ? moderation.reason : null,
                editableUntil: new Date(Date.now() + REVIEW_EDIT_WINDOW_MS),
            },
            select: { id: true, status: true },
        })
        if (review.status === 'PUBLISHED') await recomputeProfessionalReputation(appointment.professionalId)
        return NextResponse.json({ success: true, id: review.id, status: review.status })
    } catch (error) {
        if ((error as { code?: string })?.code === 'P2002') {
            return NextResponse.json({ error: 'Ya enviaste tu opinión sobre esta sesión' }, { status: 409 })
        }
        console.error('[opiniones] POST error:', error)
        return NextResponse.json({ error: 'No se pudo guardar tu opinión' }, { status: 500 })
    }
}
