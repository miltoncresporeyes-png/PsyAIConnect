import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { REPUTATION_CONFIG, TIER_LABELS, type ReputationTier } from '@/lib/reputation'

export const dynamic = 'force-dynamic'

const NEXT: Record<ReputationTier, ReputationTier | null> = { NEW: 'TRUSTED', TRUSTED: 'OUTSTANDING', OUTSTANDING: 'EXCELLENCE', EXCELLENCE: null }

/** Panel "Mi reputación" del profesional: métricas, progreso al siguiente nivel y sus opiniones publicadas. */
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const professional = await prisma.professional.findUnique({
        where: { userId: session.user.id },
        select: { id: true, ratingScore: true, ratingCount: true, reputationTier: true, attendanceRate: true, responseHours: true, isFounder: true },
    })
    if (!professional) return NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 })

    const reviews = await prisma.review.findMany({
        where: { professionalId: professional.id, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
            id: true,
            rating: true,
            comment: true,
            reply: true,
            repliedAt: true,
            createdAt: true,
            reports: { where: { reporterId: session.user.id }, select: { status: true } },
        },
    })

    const tier = (professional.reputationTier in TIER_LABELS ? professional.reputationTier : 'NEW') as ReputationTier
    const nextTier = NEXT[tier]
    const next = nextTier ? REPUTATION_CONFIG.tiers[nextTier as Exclude<ReputationTier, 'NEW'>] : null

    return NextResponse.json({
        score: professional.ratingScore,
        count: professional.ratingCount,
        tier,
        tierLabel: TIER_LABELS[tier],
        attendanceRate: professional.attendanceRate,
        responseHours: professional.responseHours,
        isFounder: professional.isFounder,
        next: nextTier && next ? { tier: nextTier, label: TIER_LABELS[nextTier], ...next } : null,
        reviews: reviews.map(({ reports, ...r }) => ({ ...r, reportStatus: reports[0]?.status ?? null })),
    })
}
