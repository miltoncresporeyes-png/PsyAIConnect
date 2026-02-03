/**
 * API: Obtener sesiones elegibles para reembolso
 * GET /api/reembolsos/eligible-sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Obtener parámetros opcionales
        const { searchParams } = new URL(req.url)
        const month = searchParams.get('month')
        const year = searchParams.get('year')

        // Construir filtros
        const where: any = {
            patientId: user.id,
            status: 'COMPLETED',
            reimbursementRequestId: null, // Solo sesiones no incluidas en otra solicitud
            payment: {
                status: 'COMPLETED'
            },
            invoice: {
                isNot: null // Solo sesiones con boleta
            }
        }

        // Filtrar por período si se especifica
        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

            where.scheduledAt = {
                gte: startDate,
                lte: endDate
            }
        }

        // Obtener sesiones elegibles
        const sessions = await prisma.appointment.findMany({
            where,
            include: {
                professional: {
                    include: { user: true }
                },
                invoice: true,
                payment: true
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        })

        // Formatear respuesta
        const formatted = sessions.map(session => ({
            id: session.id,
            date: session.scheduledAt,
            professional: {
                id: session.professionalId,
                name: session.professional.user.name
            },
            duration: session.duration,
            modality: session.modality,
            invoice: session.invoice ? {
                number: session.invoice.invoiceNumber,
                brutAmount: session.invoice.brutAmount,
                siiRetention: session.invoice.siiRetention,
                netAmount: session.invoice.netAmount,
                issueDate: session.invoice.issueDate
            } : null,
            payment: {
                status: session.payment?.status,
                amount: session.payment?.amount
            }
        }))

        // Calcular totales
        const totalAmount = formatted.reduce((sum, s) => sum + (s.invoice?.brutAmount || 0), 0)

        return NextResponse.json({
            sessions: formatted,
            summary: {
                count: formatted.length,
                totalAmount
            }
        })
    } catch (error) {
        console.error('Error fetching eligible sessions:', error)
        return NextResponse.json(
            { error: 'Error al obtener sesiones elegibles' },
            { status: 500 }
        )
    }
}
