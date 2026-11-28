import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moderateComment, updateReviewSchema } from '@/lib/reviews'
import { recomputeProfessionalReputation } from '@/lib/reputationSync'

export const dynamic = 'force-dynamic'

async function loadOwn(id: string, userId: string) {
    const review = await prisma.review.findUnique({
        where: { id },
        select: { id: true, patientId: true, professionalId: true, editableUntil: true, status: true },
    })
    return review && review.patientId === userId ? review : null
}

/** Edita la opinión dentro de las 48 h siguientes a enviarla. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const review = await loadOwn(params.id, session.user.id)
    if (!review) return NextResponse.json({ error: 'Opinión no encontrada' }, { status: 404 })
    if (review.status === 'REMOVED') return NextResponse.json({ error: 'Esta opinión fue retirada' }, { status: 400 })
    if (review.editableUntil.getTime() < Date.now()) {
        return NextResponse.json({ error: 'Ya pasó el plazo de 48 horas para editar tu opinión' }, { status: 400 })
    }

    const parsed = updateReviewSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Revisa los datos de tu opinión' }, { status: 400 })
    const d = parsed.data
    const comment = d.comment?.trim() || null
    const moderation = moderateComment(comment)

    await prisma.review.update({
        where: { id: review.id },
        data: {
            rating: d.rating,
            punctuality: d.punctuality ?? null,
            clarity: d.clarity ?? null,
            booking: d.booking ?? null,
            recommends: d.recommends ?? null,
            comment,
            status: moderation.status,
            flagReason: moderation.status === 'PENDING_REVIEW' ? moderation.reason : null,
        },
    })
    await recomputeProfessionalReputation(review.professionalId)
    return NextResponse.json({ success: true, status: moderation.status })
}

/** El paciente puede eliminar su opinión cuando quiera (derecho de supresión). */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const review = await loadOwn(params.id, session.user.id)
    if (!review) return NextResponse.json({ error: 'Opinión no encontrada' }, { status: 404 })

    await prisma.review.delete({ where: { id: review.id } })
    await recomputeProfessionalReputation(review.professionalId)
    return NextResponse.json({ success: true })
}
