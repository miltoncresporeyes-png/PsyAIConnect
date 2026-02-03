import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Get professional profile
        const professional = await prisma.professional.findFirst({
            where: { userId: session.user.id },
        })

        if (!professional) {
            return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
        }

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

        // Start of week (Monday)
        const dayOfWeek = now.getDay()
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59)

        // Start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // Count today's appointments
        const todayAppointments = await prisma.appointment.count({
            where: {
                professionalId: professional.id,
                scheduledAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['CONFIRMED', 'PENDING'],
                },
            },
        })

        // Count this week's appointments
        const weekAppointments = await prisma.appointment.count({
            where: {
                professionalId: professional.id,
                scheduledAt: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
                status: {
                    in: ['CONFIRMED', 'PENDING', 'COMPLETED'],
                },
            },
        })

        // Count unique patients
        const patients = await prisma.appointment.groupBy({
            by: ['patientId'],
            where: {
                professionalId: professional.id,
            },
        })

        // Calculate monthly income from completed payments
        const monthlyPayments = await prisma.payment.aggregate({
            _sum: {
                netAmount: true,
            },
            where: {
                appointment: {
                    professionalId: professional.id,
                    scheduledAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                status: 'COMPLETED',
            },
        })

        // Get upcoming appointments for today
        const upcomingToday = await prisma.appointment.findMany({
            where: {
                professionalId: professional.id,
                scheduledAt: {
                    gte: now,
                    lte: endOfDay,
                },
                status: {
                    in: ['CONFIRMED', 'PENDING'],
                },
            },
            include: {
                patient: {
                    select: { name: true, image: true },
                },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
        })

        // Get pending appointments (need confirmation)
        const pendingCount = await prisma.appointment.count({
            where: {
                professionalId: professional.id,
                status: 'PENDING',
            },
        })

        return NextResponse.json({
            todayAppointments,
            weekAppointments,
            totalPatients: patients.length,
            monthlyIncome: monthlyPayments._sum.netAmount || 0,
            upcomingToday: upcomingToday.map((a) => ({
                id: a.id,
                patientName: a.patient.name,
                patientImage: a.patient.image,
                scheduledAt: a.scheduledAt,
                modality: a.modality,
            })),
            pendingCount,
        })
    } catch (error) {
        console.error('Error fetching professional stats:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
