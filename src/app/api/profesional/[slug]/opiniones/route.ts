import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { REVIEW_AUTHOR_LABEL } from '@/lib/reviews'
import { shouldShowScore } from '@/lib/reputation'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 10

/** Opiniones públicas y resumen de un profesional. Nunca expone al paciente. */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const professional = await prisma.professional.findUnique({
        where: { slug: params.slug },
        select: { id: true, ratingScore: true, ratingCount: true, reputationTier: true, attendanceRate: true, isFounder: true },
    })
    if (!professional) return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 })

    const page = Math.max(1, Number(new URL(request.url).searchParams.get('page')) || 1)
    const where = { professionalId: professional.id, status: 'PUBLISHED' as const }

    const [items, total, grouped, averages, recommends] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            select: { id: true, rating: true, comment: true, reply: true, repliedAt: true, createdAt: true },
        }),
        prisma.review.count({ where }),
        prisma.review.groupBy({ by: ['rating'], where, _count: { _all: true } }),
        prisma.review.aggregate({ where, _avg: { punctuality: true, clarity: true, booking: true } }),
        prisma.review.groupBy({ by: ['recommends'], where: { ...where, recommends: { not: null } }, _count: { _all: true } }),
    ])

    const histogram = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: grouped.find((g) => g.rating === stars)?._count._all ?? 0 }))
    const yes = recommends.find((r) => r.recommends === true)?._count._all ?? 0
    const answered = recommends.reduce((s, r) => s + r._count._all, 0)

    return NextResponse.json({
        summary: {
            score: professional.ratingScore,
            count: total,
            showScore: shouldShowScore(professional.ratingCount),
            tier: professional.reputationTier,
            attendanceRate: professional.attendanceRate,
            isFounder: professional.isFounder,
            histogram,
            criteria: {
                punctuality: averages._avg.punctuality,
                clarity: averages._avg.clarity,
                booking: averages._avg.booking,
            },
            recommendsPercent: answered > 0 ? Math.round((yes / answered) * 100) : null,
        },
        items: items.map((r) => ({ ...r, author: REVIEW_AUTHOR_LABEL })),
        page,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    })
}
