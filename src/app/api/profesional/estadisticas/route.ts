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

        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil profesional no encontrado' },
                { status: 404 }
            )
        }

        // Get date ranges
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        // Get all appointments
        const appointments = await prisma.appointment.findMany({
            where: { professionalId: professional.id },
            include: { payment: true },
        })

        // Calculate stats
        const totalAppointments = appointments.length
        const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length
        const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length

        const totalRevenue = appointments
            .filter(a => a.payment?.status === 'COMPLETED')
            .reduce((sum, a) => sum + (a.payment?.netAmount || 0), 0)

        // Unique patients
        const uniquePatients = new Set(appointments.map(a => a.patientId)).size

        // This month vs last month
        const thisMonthAppointments = appointments.filter(a =>
            a.scheduledAt >= thisMonthStart
        ).length

        const lastMonthAppointments = appointments.filter(a =>
            a.scheduledAt >= lastMonthStart && a.scheduledAt <= lastMonthEnd
        ).length

        return NextResponse.json({
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            totalRevenue,
            averageRating: 0, // TODO: Implement ratings
            uniquePatients,
            thisMonthAppointments,
            lastMonthAppointments,
        })
    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}
