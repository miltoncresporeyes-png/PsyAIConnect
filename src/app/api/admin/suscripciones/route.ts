import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { PLANS, getEffectiveTier } from '@/lib/plans'

export const dynamic = 'force-dynamic'

/** Suscripciones: planes vigentes, vencimientos, ordenes de pago y programa de fundadores. */
export async function GET() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    try {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const [professionals, orders, paidAll, paidMonth, orderGroups, founders] = await Promise.all([
            prisma.professional.findMany({
                where: { subscriptionTier: { not: 'STARTER' } },
                select: {
                    id: true,
                    subscriptionTier: true,
                    subscriptionEnds: true,
                    subscriptionCancelledAt: true,
                    user: { select: { name: true, email: true } },
                },
                orderBy: { subscriptionEnds: 'asc' },
            }),
            prisma.subscriptionOrder.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    kind: true,
                    fromTier: true,
                    toTier: true,
                    months: true,
                    amount: true,
                    credit: true,
                    status: true,
                    createdAt: true,
                    paidAt: true,
                    professional: { select: { user: { select: { name: true, email: true } } } },
                },
            }),
            prisma.subscriptionOrder.aggregate({ where: { status: 'PAID' }, _sum: { amount: true }, _count: { _all: true } }),
            prisma.subscriptionOrder.aggregate({
                where: { status: 'PAID', paidAt: { gte: monthStart } },
                _sum: { amount: true },
                _count: { _all: true },
            }),
            prisma.subscriptionOrder.groupBy({ by: ['status'], _count: { _all: true } }),
            prisma.founderApplication.findMany({
                where: { estado: 'aprobado' },
                orderBy: { numeroCupo: 'asc' },
                select: {
                    id: true,
                    nombreCompleto: true,
                    email: true,
                    profesion: true,
                    numeroCupo: true,
                    fechaInicioBeneficio: true,
                    fechaFinBeneficio: true,
                },
                take: 100,
            }),
        ])

        const day = 24 * 60 * 60 * 1000
        const active = professionals
            .map((p) => {
                const tier = getEffectiveTier({ subscriptionTier: p.subscriptionTier, subscriptionEnds: p.subscriptionEnds })
                const daysLeft = p.subscriptionEnds ? Math.ceil((p.subscriptionEnds.getTime() - now.getTime()) / day) : null
                return {
                    id: p.id,
                    name: p.user.name,
                    email: p.user.email,
                    tier,
                    storedTier: p.subscriptionTier,
                    endsAt: p.subscriptionEnds,
                    daysLeft,
                    cancelled: p.subscriptionCancelledAt != null,
                    expired: tier === 'STARTER',
                }
            })
            .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity))

        const vigentes = active.filter((p) => !p.expired)
        const mrrEstimate = vigentes.reduce((acc, p) => acc + (p.tier !== 'STARTER' ? PLANS[p.tier].monthlyPrice : 0), 0)
        const ordersByStatus: Record<string, number> = {}
        for (const g of orderGroups) ordersByStatus[g.status] = g._count._all

        return NextResponse.json({
            summary: {
                activePaid: vigentes.length,
                expired: active.filter((p) => p.expired).length,
                cancelledRenewal: vigentes.filter((p) => p.cancelled).length,
                expiring30d: vigentes.filter((p) => (p.daysLeft ?? 999) <= 30).length,
                mrrEstimate,
                paidThisMonth: paidMonth._sum.amount ?? 0,
                paidOrdersThisMonth: paidMonth._count._all,
                paidAllTime: paidAll._sum.amount ?? 0,
                paidOrdersAllTime: paidAll._count._all,
                ordersByStatus,
            },
            subscriptions: active,
            orders: orders.map((o) => ({
                id: o.id,
                kind: o.kind,
                fromTier: o.fromTier,
                toTier: o.toTier,
                months: o.months,
                amount: o.amount,
                credit: o.credit,
                status: o.status,
                createdAt: o.createdAt,
                paidAt: o.paidAt,
                name: o.professional.user.name,
                email: o.professional.user.email,
            })),
            founders: founders.map((f) => ({
                ...f,
                daysLeft: f.fechaFinBeneficio ? Math.ceil((f.fechaFinBeneficio.getTime() - now.getTime()) / day) : null,
            })),
        })
    } catch (error) {
        console.error('[admin/suscripciones] error:', error)
        return NextResponse.json({ error: 'Error al obtener las suscripciones' }, { status: 500 })
    }
}
