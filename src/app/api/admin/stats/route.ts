import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for API routes using auth
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

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acceso denegado' },
                { status: 403 }
            )
        }

        // Get stats
        const [
            totalUsers,
            totalProfessionals,
            pendingVerification,
            totalAppointments,
            completedAppointments,
            payments,
            waitlistCount,
            recentUsers,
            recentAppointments,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.professional.count(),
            prisma.professional.count({ where: { verificationStatus: 'PENDING' } }),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'COMPLETED' } }),
            prisma.payment.findMany({ where: { status: 'COMPLETED' } }),
            prisma.waitlistEntry.count(),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { name: true, createdAt: true, role: true },
            }),
            prisma.appointment.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: { select: { name: true } },
                    professional: { include: { user: { select: { name: true } } } },
                },
            }),
        ])

        // Calculate totals
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
        const totalCommission = payments.reduce((sum, p) => sum + p.commission, 0)

        // Build activity feed
        const activity = [
            ...recentUsers.map(u => ({
                type: u.role === 'PROFESSIONAL' ? 'professional' : 'user' as const,
                message: `Nuevo ${u.role === 'PROFESSIONAL' ? 'profesional' : 'usuario'}: ${u.name}`,
                timestamp: formatTimeAgo(u.createdAt),
            })),
            ...recentAppointments.map(a => ({
                type: 'appointment' as const,
                message: `Cita: ${a.patient.name} con ${a.professional.user.name}`,
                timestamp: formatTimeAgo(a.createdAt),
            })),
        ].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(0, 10)

        return NextResponse.json({
            stats: {
                totalUsers,
                totalProfessionals,
                pendingVerification,
                totalAppointments,
                completedAppointments,
                totalRevenue,
                totalCommission,
                waitlistCount,
            },
            activity,
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-CL')
}
