import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { spawn } from 'child_process'
import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import path from 'path'
import fs from 'fs'

const exec = promisify(execCallback)

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
        const analysisType = searchParams.get('type') || 'medications'
        const days = parseInt(searchParams.get('days') || '90')

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
        const { professional_id, type = 'medications', days = 90 } = body

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
            '--days', days.toString(),
        ]

        if (professional_id) {
            args.push('--professional-id', professional_id)
        }

        const command = `python3 ${args.join(' ')}`

        let stdout, stderr
        try {
            const result = await exec(command, { 
                cwd: process.cwd(),
                timeout: 120000,
            })
            stdout = result.stdout
            stderr = result.stderr
        } catch (execError: any) {
            stdout = execError.stdout || ''
            stderr = execError.stderr || execError.message || ''
        }

        if (stderr && !stderr.includes('SELECT') && !stderr.includes('INSERT')) {
            console.error('Python script error:', stderr)
        }

        const latestAnalytics = await prisma.clinicalAnalytics.findFirst({
            where: {
                ...(professional_id ? { professionalId: professional_id } : {}),
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
            debug: {
                stdout: stdout.slice(-1000),
                stderr: stderr?.slice(-500),
            },
        })
    } catch (error) {
        console.error('Analytics run error:', error)
        return NextResponse.json(
            { error: 'Error al ejecutar análisis' },
            { status: 500 }
        )
    }
}
