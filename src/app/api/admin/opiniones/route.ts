import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { Prisma, ReviewStatus } from '@/generated/client'
import { requireAdmin } from '@/lib/adminGuard'
import { logAdminAction } from '@/lib/adminLogs'
import { REMOVE_REASONS } from '@/lib/reviews'
import { recomputeProfessionalReputation } from '@/lib/reputationSync'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 20

/** Cola de moderación de opiniones (por defecto, las pendientes de revisión). */
export async function GET(request: Request) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const params = new URL(request.url).searchParams
    const status = params.get('status')
    const page = Math.max(1, Number(params.get('page')) || 1)
    const where: Prisma.ReviewWhereInput =
        status === 'REPORTED'
            ? { status: 'PUBLISHED', reports: { some: { status: 'OPEN' } } }
            : {
                  status: (status === 'PUBLISHED' || status === 'PENDING_REVIEW' || status === 'REMOVED' ? status : 'PENDING_REVIEW') as ReviewStatus,
              }

    try {
        const [items, total, counts, avg, reported] = await Promise.all([
            prisma.review.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    status: true,
                    flagReason: true,
                    removedReason: true,
                    reply: true,
                    createdAt: true,
                    reports: { where: { status: 'OPEN' }, select: { id: true, reason: true, createdAt: true } },
                    patient: { select: { name: true, email: true } },
                    professional: { select: { id: true, slug: true, user: { select: { name: true } } } },
                },
            }),
            prisma.review.count({ where }),
            prisma.review.groupBy({ by: ['status'], _count: { _all: true } }),
            prisma.review.aggregate({ where: { status: 'PUBLISHED' }, _avg: { rating: true } }),
            prisma.review.count({ where: { status: 'PUBLISHED', reports: { some: { status: 'OPEN' } } } }),
        ])
        const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0
        return NextResponse.json({
            items,
            total,
            page,
            totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            summary: { pending: count('PENDING_REVIEW'), reported, published: count('PUBLISHED'), removed: count('REMOVED'), average: avg._avg.rating },
            removeReasons: REMOVE_REASONS,
        })
    } catch (error) {
        console.error('[admin/opiniones] GET error:', error)
        return NextResponse.json({ error: 'No se pudieron cargar las opiniones' }, { status: 500 })
    }
}

const patchSchema = z.discriminatedUnion('action', [
    z.object({ id: z.string(), action: z.literal('approve') }),
    z.object({ id: z.string(), action: z.literal('restore') }),
    z.object({ id: z.string(), action: z.literal('dismiss-report') }),
    z.object({ id: z.string(), action: z.literal('remove'), reason: z.string().trim().min(3).max(200) }),
])

export async function PATCH(request: Request) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const parsed = patchSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Acción no válida (el retiro exige un motivo)' }, { status: 400 })
    const body = parsed.data

    const review = await prisma.review.findUnique({
        where: { id: body.id },
        select: { id: true, professionalId: true, status: true, professional: { select: { user: { select: { name: true, email: true } } } } },
    })
    if (!review) return NextResponse.json({ error: 'Opinión no encontrada' }, { status: 404 })

    // Descartar el reporte: la opinión se mantiene publicada
    if (body.action === 'dismiss-report') {
        await prisma.reviewReport.updateMany({ where: { reviewId: review.id, status: 'OPEN' }, data: { status: 'DISMISSED', resolvedBy: guard.adminId, resolvedAt: new Date() } })
        await logAdminAction({
            adminId: guard.adminId,
            adminName: guard.adminName ?? undefined,
            action: 'DISMISS_REVIEW_REPORT',
            targetType: 'PROFESSIONAL',
            targetId: review.professionalId,
            targetName: review.professional.user.name ?? undefined,
            details: { reviewId: review.id },
        })
        return NextResponse.json({ success: true })
    }

    const data =
        body.action === 'remove'
            ? { status: 'REMOVED' as const, removedReason: body.reason, removedBy: guard.adminId }
            : { status: 'PUBLISHED' as const, removedReason: null, removedBy: null, flagReason: null }

    try {
        await prisma.review.update({ where: { id: review.id }, data })
        // Retirar o publicar resuelve los reportes abiertos de esa opinión
        await prisma.reviewReport.updateMany({ where: { reviewId: review.id, status: 'OPEN' }, data: { status: 'RESOLVED', resolvedBy: guard.adminId, resolvedAt: new Date() } })
        await recomputeProfessionalReputation(review.professionalId)
        await logAdminAction({
            adminId: guard.adminId,
            adminName: guard.adminName ?? undefined,
            action: body.action === 'remove' ? 'REMOVE_REVIEW' : body.action === 'approve' ? 'APPROVE_REVIEW' : 'RESTORE_REVIEW',
            targetType: 'PROFESSIONAL',
            targetId: review.professionalId,
            targetName: review.professional.user.name ?? undefined,
            targetEmail: review.professional.user.email,
            details: { reviewId: review.id, ...(body.action === 'remove' ? { reason: body.reason } : {}) },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[admin/opiniones] PATCH error:', error)
        return NextResponse.json({ error: 'No se pudo guardar el cambio' }, { status: 500 })
    }
}
