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

const documentSchema = {
    type: 'object',
    properties: {
        type: { type: 'string', enum: ['recipe', 'certificate'] },
        appointmentId: { type: 'string' },
        content: { type: 'string' },
        diagnosis: { type: 'string' },
    },
    required: ['type'],
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

        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil profesional no encontrado' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { type, appointmentId, content, diagnosis } = body

        if (!appointmentId && !content) {
            return NextResponse.json(
                { error: 'Se requiere appointmentId o content' },
                { status: 400 }
            )
        }

        if (appointmentId) {
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
            })

            if (!appointment || appointment.professionalId !== professional.id) {
                return NextResponse.json(
                    { error: 'Cita no encontrada o no autorizada' },
                    { status: 404 }
                )
            }
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'pdf', 'generate_medical_pdf.py')

        if (!fs.existsSync(scriptPath)) {
            return NextResponse.json(
                { error: 'Script de generación de PDF no encontrado' },
                { status: 500 }
            )
        }

        const args = [
            scriptPath,
            '--type', type,
            '--professional_id', professional.id,
        ]

        if (appointmentId) {
            args.push('--appointment_id', appointmentId)
        }

        if (content) {
            args.push('--content', content.replace(/"/g, '\\"'))
        }

        if (diagnosis) {
            args.push('--diagnosis', diagnosis.replace(/"/g, '\\"'))
        }

        const command = `python3 ${args.join(' ')}`

        let stdout, stderr
        try {
            const result = await exec(command, { 
                cwd: process.cwd(),
                timeout: 60000,
            })
            stdout = result.stdout
            stderr = result.stderr
        } catch (execError: any) {
            stdout = execError.stdout || ''
            stderr = execError.stderr || execError.message || ''
        }

        if (stderr && !stderr.includes('PageMetrics')) {
            console.error('Python PDF script error:', stderr)
        }

        let pdfData
        try {
            pdfData = JSON.parse(stdout)
        } catch {
            return NextResponse.json({
                error: 'Error al parsear resultado del PDF',
                debug: { stdout: stdout.slice(-500), stderr: stderr.slice(-500) },
            }, { status: 500 })
        }

        if (pdfData.error) {
            return NextResponse.json(
                { error: pdfData.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            filename: pdfData.filename,
            pdfBase64: pdfData.pdf_base64,
            createdAt: pdfData.created_at,
        })
    } catch (error) {
        console.error('PDF generation error:', error)
        return NextResponse.json(
            { error: 'Error al generar PDF' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'recipe'

    return NextResponse.json({
        availableTypes: [
            { value: 'recipe', label: 'Receta Médica' },
            { value: 'certificate', label: 'Certificado Médico' },
        ],
        usage: {
            POST: {
                type: 'recipe | certificate',
                appointmentId: 'ID de la cita (opcional)',
                content: 'Contenido del documento',
                diagnosis: 'Diagnóstico (para certificados)',
            },
        },
    })
}
