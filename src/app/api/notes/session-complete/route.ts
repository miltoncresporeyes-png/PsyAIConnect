import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { finalizarSesionCompleta } from '@/lib/sessionManager'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const sessionCompleteSchema = z.object({
    appointmentId: z.string(),
    generateRecipe: z.boolean().optional().default(false),
    recipeContent: z.string().optional(),
    generateCertificate: z.boolean().optional().default(false),
    certificateContent: z.string().optional(),
    diagnosis: z.string().optional(),
    emitInvoice: z.boolean().optional().default(true),
})

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
        const parsed = sessionCompleteSchema.parse(body)

        // Usar el orquestador
        const result = await finalizarSesionCompleta({
            appointmentId: parsed.appointmentId,
            professionalId: professional.id,
            generateRecipe: parsed.generateRecipe,
            recipeContent: parsed.recipeContent,
            generateCertificate: parsed.generateCertificate,
            certificateContent: parsed.certificateContent,
            diagnosis: parsed.diagnosis,
            emitInvoice: parsed.emitInvoice,
        })

        if (!result.success) {
            const failedStep = result.steps.find(s => !s.success)
            return NextResponse.json(
                {
                    error: result.error || 'Error al completar sesión',
                    failedStep: failedStep?.step,
                    failedStepError: failedStep?.error,
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Sesión completada correctamente',
            appointmentId: result.appointmentId,
            clinicalNote: result.clinicalNote,
            documents: result.documents,
            steps: result.steps.map(s => ({
                step: s.step,
                success: s.success,
                message: s.message,
            })),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Session complete error:', error)
        return NextResponse.json(
            { error: 'Error al completar sesión' },
            { status: 500 }
        )
    }
}
