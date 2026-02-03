import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const professionalId = searchParams.get('professionalId')

        if (!professionalId) {
            return NextResponse.json(
                { error: 'professionalId requerido' },
                { status: 400 }
            )
        }

        // Count previous appointments with this professional
        const previousAppointments = await prisma.appointment.count({
            where: {
                patientId: session.user.id,
                professionalId: professionalId,
                status: {
                    notIn: ['CANCELLED']
                }
            }
        })

        // Check if patient has already signed clinical consent with this professional
        const existingConsent = await prisma.consentLog.findFirst({
            where: {
                userId: session.user.id,
                professionalId: professionalId,
                consentType: 'CLINICAL' as const
            }
        })

        return NextResponse.json({
            isFirstSession: previousAppointments === 0,
            hasSignedConsent: !!existingConsent,
            requiresConsent: previousAppointments === 0 && !existingConsent
        })

    } catch (error) {
        console.error('Error checking first session:', error)
        return NextResponse.json(
            { error: 'Error al verificar primera sesión' },
            { status: 500 }
        )
    }
}
