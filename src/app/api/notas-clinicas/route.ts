import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptClinicalNote } from '@/lib/encryption'
import { z } from 'zod'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const noteSchema = z.object({
    appointmentId: z.string(),
    content: z.string().optional(),
    indicaciones: z.string().optional(),
}).refine(data => data.content || data.indicaciones, {
    message: 'Debe incluir contenido o indicaciones',
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
        const { appointmentId, content, indicaciones } = noteSchema.parse(body)

        // Verify appointment belongs to this professional
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        })

        if (!appointment || appointment.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Cita no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        // Encrypt the content if provided
        const encryptedContent = content ? encryptClinicalNote(content) : undefined
        const encryptedIndicaciones = indicaciones ? encryptClinicalNote(indicaciones) : undefined

        // Check for existing note
        const existingNote = await prisma.clinicalNote.findFirst({
            where: {
                appointmentId,
                professionalId: professional.id,
                deletedAt: null,
            },
        })

        if (existingNote) {
            // Update existing note
            const updateData: Record<string, unknown> = {}
            if (encryptedContent !== undefined) {
                updateData.encryptedContent = encryptedContent
            }
            if (encryptedIndicaciones !== undefined) {
                updateData.encryptedIndicaciones = encryptedIndicaciones
            }

            await prisma.clinicalNote.update({
                where: { id: existingNote.id },
                data: updateData,
            })
        } else {
            // Create new note
            await prisma.clinicalNote.create({
                data: {
                    appointmentId,
                    professionalId: professional.id,
                    encryptedContent: encryptedContent || null,
                    encryptedIndicaciones: encryptedIndicaciones || null,
                },
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Nota guardada correctamente',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Clinical note error:', error)
        return NextResponse.json(
            { error: 'Error al guardar nota clínica' },
            { status: 500 }
        )
    }
}
