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

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true,
                professional: {
                    select: {
                        professionalType: true,
                        bio: true,
                        specialties: true,
                        modality: true,
                        sessionPrice: true,
                        sessionDuration: true,
                    },
                },
            },
        })

        // Get appointments as patient
        const appointmentsAsPatient = await prisma.appointment.findMany({
            where: { patientId: session.user.id },
            select: {
                id: true,
                scheduledAt: true,
                duration: true,
                modality: true,
                status: true,
                consultationReason: true,
                professional: {
                    select: {
                        user: { select: { name: true } },
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        })

        // Get consents
        const consents = await prisma.consentLog.findMany({
            where: { userId: session.user.id },
            select: {
                consentType: true,
                consentVersion: true,
                granted: true,
                grantedAt: true,
                revokedAt: true,
            },
            orderBy: { grantedAt: 'desc' },
        })

        // Format data for export
        const exportData = {
            exportDate: new Date().toISOString(),
            user: {
                ...user,
                createdAt: user?.createdAt.toISOString(),
            },
            appointments: appointmentsAsPatient.map(apt => ({
                ...apt,
                scheduledAt: apt.scheduledAt.toISOString(),
                professionalName: apt.professional.user.name,
            })),
            consents: consents.map(c => ({
                ...c,
                grantedAt: c.grantedAt.toISOString(),
                revokedAt: c.revokedAt?.toISOString(),
            })),
            note: 'Este archivo contiene todos tus datos personales almacenados en PsyConnect. ' +
                'Las notas clínicas están cifradas y solo son accesibles por tu profesional.',
        }

        // Return as downloadable JSON
        const jsonString = JSON.stringify(exportData, null, 2)

        return new NextResponse(jsonString, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="psyconnect-data-${session.user.id.slice(0, 8)}.json"`,
            },
        })
    } catch (error) {
        console.error('Data export error:', error)
        return NextResponse.json(
            { error: 'Error al exportar datos' },
            { status: 500 }
        )
    }
}
