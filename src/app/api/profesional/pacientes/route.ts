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

        // Get all unique patients with appointment count
        const appointments = await prisma.appointment.findMany({
            where: {
                professionalId: professional.id,
                status: { in: ['CONFIRMED', 'COMPLETED'] },
            },
            select: {
                patientId: true,
                scheduledAt: true,
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        })

        // Aggregate by patient
        const patientMap = new Map<string, {
            id: string
            name: string
            email: string
            image: string | null
            appointmentCount: number
            lastAppointment: string
        }>()

        for (const apt of appointments) {
            const existing = patientMap.get(apt.patientId)
            if (existing) {
                existing.appointmentCount++
            } else {
                patientMap.set(apt.patientId, {
                    id: apt.patient.id,
                    name: apt.patient.name || 'Sin nombre',
                    email: apt.patient.email,
                    image: apt.patient.image,
                    appointmentCount: 1,
                    lastAppointment: apt.scheduledAt.toISOString(),
                })
            }
        }

        return NextResponse.json(Array.from(patientMap.values()))
    } catch (error) {
        console.error('Patients fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener pacientes' },
            { status: 500 }
        )
    }
}
