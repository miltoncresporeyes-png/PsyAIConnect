import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { finalizarSesionCompleta } from '@/lib/sessionManager'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const finalizeSchema = z.object({
    generateRecipe: z.boolean().optional().default(false),
    recipeContent: z.string().optional(),
    generateCertificate: z.boolean().optional().default(false),
    certificateContent: z.string().optional(),
    diagnosis: z.string().optional(),
    emitInvoice: z.boolean().optional().default(true),
})

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: appointmentId } = await params
        const body = await request.json()
        const options = finalizeSchema.parse(body)

        // Ejecutar el orquestador de sesión completa
        const result = await finalizarSesionCompleta({
            appointmentId,
            professionalId: professional.id,
            generateRecipe: options.generateRecipe,
            recipeContent: options.recipeContent,
            generateCertificate: options.generateCertificate,
            certificateContent: options.certificateContent,
            diagnosis: options.diagnosis,
            emitInvoice: options.emitInvoice,
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
            documents: {
                recipe: result.documents?.recipe ? {
                    filename: result.documents.recipe.filename,
                    pdfBase64: result.documents.recipe.pdfBase64,
                } : undefined,
                certificate: result.documents?.certificate ? {
                    filename: result.documents.certificate.filename,
                    pdfBase64: result.documents.certificate.pdfBase64,
                } : undefined,
                invoice: result.documents?.invoice,
            },
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

        console.error('Finalize appointment error:', error)
        return NextResponse.json(
            { error: 'Error al finalizar sesión' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: appointmentId } = await params

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                clinicalNotes: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                },
                payment: true,
            },
        })

        if (!appointment) {
            return NextResponse.json(
                { error: 'Cita no encontrada' },
                { status: 404 }
            )
        }

        if (appointment.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'No autorizado para acceder a esta cita' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            appointmentId: appointment.id,
            status: appointment.status,
            attendanceStatus: appointment.attendanceStatus,
            scheduledAt: appointment.scheduledAt,
            hasClinicalNote: appointment.clinicalNotes.length > 0,
            isNoteFinalized: appointment.clinicalNotes[0]?.isFinalized || false,
            hasPayment: !!appointment.payment,
            canFinalize: appointment.status === 'CONFIRMED' && appointment.attendanceStatus === 'EN_SESION',
        })
    } catch (error) {
        console.error('Get appointment status error:', error)
        return NextResponse.json(
            { error: 'Error al obtener estado de la cita' },
            { status: 500 }
        )
    }
}
