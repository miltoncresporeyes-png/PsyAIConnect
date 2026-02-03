/**
 * API: Get Monthly Report
 * GET /api/profesional/reportes/mensual?year=2026&month=1
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateMonthlyReport } from '@/lib/reports'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'PROFESSIONAL') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Get professional ID
        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
        const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))

        // Validate parameters
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return NextResponse.json(
                { error: 'Parámetros inválidos' },
                { status: 400 }
            )
        }

        // Generate or retrieve report
        const report = await generateMonthlyReport(professional.id, year, month)

        return NextResponse.json(report)
    } catch (error) {
        console.error('Error generating monthly report:', error)
        return NextResponse.json(
            { error: 'Error al generar el reporte' },
            { status: 500 }
        )
    }
}
