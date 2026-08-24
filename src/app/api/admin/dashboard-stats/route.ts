import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acceso denegado' },
                { status: 403 }
            )
        }

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const [
            totalUsers,
            pendingProfessionals,
            monthlyPayments,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.professional.count({ where: { verificationStatus: 'PENDING' } }),
            prisma.payment.findMany({
                where: {
                    status: 'COMPLETED',
                    paidAt: {
                        gte: startOfMonth,
                    },
                },
            }),
        ])

        const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

        return NextResponse.json({
            totalUsers,
            pendingProfessionals,
            monthlyRevenue,
        })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}
