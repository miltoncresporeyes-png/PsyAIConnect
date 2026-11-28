import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const reportSchema = z.object({ reason: z.string().trim().min(10).max(300) })

/**
 * El profesional reporta una opinión publicada sobre él que cree que rompe las reglas
 * (datos personales, contenido clínico, insultos, falsedad comprobable). La resuelve el admin;
 * reportar no oculta la opinión.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const professional = await prisma.professional.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    if (!professional) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const review = await prisma.review.findUnique({ where: { id: params.id }, select: { professionalId: true, status: true } })
    if (!review || review.professionalId !== professional.id || review.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Opinión no encontrada' }, { status: 404 })
    }

    const parsed = reportSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: 'Explica el motivo en 10 a 300 caracteres' }, { status: 400 })
    }

    try {
        await prisma.reviewReport.create({ data: { reviewId: params.id, reporterId: session.user.id, reason: parsed.data.reason } })
        return NextResponse.json({ success: true })
    } catch (error) {
        if ((error as { code?: string })?.code === 'P2002') {
            return NextResponse.json({ error: 'Ya reportaste esta opinión; la estamos revisando' }, { status: 409 })
        }
        console.error('[opiniones] reportar error:', error)
        return NextResponse.json({ error: 'No se pudo enviar el reporte' }, { status: 500 })
    }
}
