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
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

        const [payments, monthlyPayments, appointments] = await Promise.all([
            prisma.payment.findMany({
                where: { status: 'COMPLETED' },
                select: { amount: true, paidAt: true },
            }),
            prisma.payment.findMany({
                where: {
                    status: 'COMPLETED',
                    paidAt: { gte: startOfMonth },
                },
                select: { amount: true },
            }),
            prisma.appointment.findMany({
                where: { status: 'COMPLETED' },
                select: { id: true, scheduledAt: true },
            }),
        ])

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
        const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)
        const totalAppointments = appointments.length

        const monthlyAppointments = appointments.filter(
            a => new Date(a.scheduledAt) >= startOfMonth
        ).length

        const revenueByMonthMap = new Map<string, number>()
        payments.forEach(p => {
            if (p.paidAt) {
                const date = new Date(p.paidAt)
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                const monthName = date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
                revenueByMonthMap.set(
                    monthName,
                    (revenueByMonthMap.get(monthName) || 0) + p.amount
                )
            }
        })

        const revenueByMonth = Array.from(revenueByMonthMap.entries())
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month))

        const averageTicket = totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 0

        return NextResponse.json({
            totalRevenue,
            monthlyRevenue,
            totalAppointments,
            monthlyAppointments,
            averageTicket,
            revenueByMonth,
        })
    } catch (error) {
        console.error('Finance stats error:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas financieras' },
            { status: 500 }
        )
    }
}
