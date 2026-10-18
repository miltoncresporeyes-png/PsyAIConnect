import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { execFile as execFileCallback } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execFile = promisify(execFileCallback)

const ANALYSIS_TYPES = ['medications', 'diagnoses', 'patterns', 'outcomes'] as const
type AnalysisType = (typeof ANALYSIS_TYPES)[number]

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Solo administradores pueden acceder a analytics' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const professionalId = searchParams.get('professional_id')
        const requestedType = searchParams.get('type') || 'medications'
        const daysParam = parseInt(searchParams.get('days') || '90')

        if (!ANALYSIS_TYPES.includes(requestedType as AnalysisType)) {
            return NextResponse.json(
                { error: 'Tipo de análisis no válido' },
                { status: 400 }
            )
        }
        if (!Number.isInteger(daysParam) || daysParam < 1 || daysParam > 365) {
            return NextResponse.json(
                { error: 'Rango de días no válido' },
                { status: 400 }
            )
        }
        const analysisType = requestedType

        const analytics = await prisma.clinicalAnalytics.findFirst({
            where: {
                ...(professionalId ? { professionalId } : {}),
                analysisType,
            },
            orderBy: { generatedAt: 'desc' },
        })

        if (!analytics) {
            return NextResponse.json({
                needsRun: true,
                message: 'No hay análisis disponible. Ejecuta POST para generar.',
            })
        }

        return NextResponse.json({
            analysisType: analytics.analysisType,
            sampleSize: analytics.sampleSize,
            generatedAt: analytics.generatedAt,
            results: analytics.results,
        })
    } catch (error) {
        console.error('Analytics fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener analytics' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Solo administradores pueden ejecutar analytics' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const rawType = body?.type ?? 'medications'
        const rawDays = body?.days ?? 90
        const professionalId = body?.professional_id

        if (!ANALYSIS_TYPES.includes(rawType as AnalysisType)) {
            return NextResponse.json(
                { error: 'Tipo de análisis no válido' },
                { status: 400 }
            )
        }
        const type = rawType as AnalysisType

        const days = Number(rawDays)
        if (!Number.isInteger(days) || days < 1 || days > 365) {
            return NextResponse.json(
                { error: 'Rango de días no válido' },
                { status: 400 }
            )
        }

        if (professionalId !== undefined && professionalId !== null && professionalId !== '') {
            if (typeof professionalId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(professionalId)) {
                return NextResponse.json(
                    { error: 'Identificador de profesional no válido' },
                    { status: 400 }
                )
            }
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'analytics', 'analyze_notes.py')

        if (!fs.existsSync(scriptPath)) {
            return NextResponse.json(
                { error: 'Script de análisis no encontrado' },
                { status: 500 }
            )
        }

        const args = [
            scriptPath,
            '--type', type,
            '--days', String(days),
        ]

        if (professionalId) {
            args.push('--professional-id', String(professionalId))
        }

        let stdout = ''
        let stderr = ''
        try {
            const result = await execFile('python3', args, {
                cwd: process.cwd(),
                timeout: 120000,
                maxBuffer: 1024 * 1024,
            })
            stdout = result.stdout
            stderr = result.stderr
        } catch (execError: any) {
            stdout = execError.stdout || ''
            stderr = execError.stderr || ''
            console.error('Python script error:', stderr)
        }

        const latestAnalytics = await prisma.clinicalAnalytics.findFirst({
            where: {
                ...(professionalId ? { professionalId: String(professionalId) } : {}),
                analysisType: type,
            },
            orderBy: { generatedAt: 'desc' },
        })

        return NextResponse.json({
            success: true,
            message: `Análisis ${type} completado`,
            analysis: latestAnalytics ? {
                analysisType: latestAnalytics.analysisType,
                sampleSize: latestAnalytics.sampleSize,
                generatedAt: latestAnalytics.generatedAt,
                results: latestAnalytics.results,
            } : null,
        })
    } catch (error) {
        console.error('Analytics run error:', error)
        return NextResponse.json(
            { error: 'Error al ejecutar análisis' },
            { status: 500 }
        )
    }
}
