import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptClinicalNote } from '@/lib/encryption'
import { generateClinicalHash, generateClinicalSignature } from '@/lib/clinicalSignature'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const finalizeSchema = z.object({
    appointmentId: z.string(),
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
            include: {
                user: true,
            },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil profesional no encontrado' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { appointmentId } = finalizeSchema.parse(body)

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        })

        if (!appointment || appointment.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Cita no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        const draft = await prisma.clinicalNoteDraft.findUnique({
            where: { appointmentId },
        })

        if (!draft) {
            return NextResponse.json(
                { error: 'No existe borrador para esta cita' },
                { status: 404 }
            )
        }

        const contentHash = generateClinicalHash(draft.content, professional.id, appointmentId)
        const signedAt = new Date()
        const signature = generateClinicalSignature(
            draft.content,
            professional.id,
            appointmentId,
            professional.user.name || 'Profesional'
        )

        const encryptedContent = encryptClinicalNote(draft.content)

        const existingNote = await prisma.clinicalNote.findFirst({
            where: {
                appointmentId,
                professionalId: professional.id,
                deletedAt: null,
            },
        })

        if (existingNote) {
            if (existingNote.isFinalized) {
                return NextResponse.json(
                    { error: 'Esta nota ya ha sido firmada y no puede ser modificada. Usa un Anexo para correcciones.' },
                    { status: 403 }
                )
            }

            await prisma.clinicalNote.update({
                where: { id: existingNote.id },
                data: {
                    encryptedContent,
                    contentHash,
                    signature,
                    signedAt,
                    isFinalized: true,
                    finalizedAt: signedAt,
                    updatedAt: new Date(),
                },
            })
        } else {
            await prisma.clinicalNote.create({
                data: {
                    appointmentId,
                    professionalId: professional.id,
                    encryptedContent,
                    contentHash,
                    signature,
                    signedAt,
                    isFinalized: true,
                    finalizedAt: signedAt,
                },
            })
        }

        await prisma.clinicalNoteDraft.delete({
            where: { id: draft.id },
        })

        return NextResponse.json({
            success: true,
            message: 'Nota firmada y guardada correctamente',
            data: {
                contentHash,
                signedAt: signedAt.toISOString(),
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Finalize note error:', error)
        return NextResponse.json(
            { error: 'Error al firmar nota' },
            { status: 500 }
        )
    }
}
