import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const guard = await requireAdmin()
        if ('error' in guard) return guard.error

        const [pendingProfessionals, pendingFounders, newTickets, pendingReviews] = await Promise.all([
            prisma.professional.count({
                where: { verificationStatus: 'PENDING' },
            }),
            prisma.founderApplication.count({
                where: { estado: 'pendiente' },
            }),
            prisma.supportTicket.count({ where: { status: 'NEW' } }),
            // Opiniones por revisar + publicadas con reportes abiertos del profesional
            prisma.review.count({ where: { OR: [{ status: 'PENDING_REVIEW' }, { status: 'PUBLISHED', reports: { some: { status: 'OPEN' } } }] } }),
        ])

        return NextResponse.json({
            pendingProfessionals,
            pendingFounders,
            newTickets,
            pendingReviews,
        })
    } catch (error) {
        console.error('Pending count error:', error)
        return NextResponse.json(
            { error: 'Error al obtener conteo' },
            { status: 500 }
        )
    }
}
