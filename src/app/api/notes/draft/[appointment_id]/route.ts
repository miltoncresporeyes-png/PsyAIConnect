import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const draftSchema = z.object({
    content: z.string(),
    templateId: z.string().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ appointment_id: string }> }) {
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

        const { appointment_id } = await params
        const body = await request.json()
        const { content, templateId } = draftSchema.parse(body)

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointment_id },
        })

        if (!appointment || appointment.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Cita no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        const existingDraft = await prisma.clinicalNoteDraft.findUnique({
            where: { appointmentId: appointment_id },
        })

        if (existingDraft) {
            if (existingDraft.locked && existingDraft.lockedBySession !== session.user.id) {
                return NextResponse.json(
                    { error: 'Esta nota está siendo editada en otro dispositivo' },
                    { status: 409 }
                )
            }

            await prisma.clinicalNoteDraft.update({
                where: { id: existingDraft.id },
                data: {
                    content,
                    updatedAt: new Date(),
                    locked: true,
                    lockedAt: new Date(),
                    lockedBySession: session.user.id,
                    ...(templateId && { templateId }),
                },
            })

            await prisma.clinicalNoteSnapshot.create({
                data: {
                    draftId: existingDraft.id,
                    content: existingDraft.content,
                },
            })
        } else {
            await prisma.clinicalNoteDraft.create({
                data: {
                    appointmentId: appointment_id,
                    professionalId: professional.id,
                    content,
                    templateId,
                    locked: true,
                    lockedAt: new Date(),
                    lockedBySession: session.user.id,
                },
            })
        }

        return NextResponse.json({
            success: true,
            updatedAt: new Date().toISOString(),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Draft save error:', error)
        return NextResponse.json(
            { error: 'Error al guardar borrador' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ appointment_id: string }> }) {
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

        const { appointment_id } = await params

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointment_id },
        })

        if (!appointment || appointment.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Cita no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        const draft = await prisma.clinicalNoteDraft.findUnique({
            where: { appointmentId: appointment_id },
        })

        if (!draft) {
            return NextResponse.json({ draft: null })
        }

        if (draft.locked && draft.lockedBySession !== session.user.id) {
            return NextResponse.json({
                locked: true,
                lockedAt: draft.lockedAt,
            })
        }

        await prisma.clinicalNoteDraft.update({
            where: { id: draft.id },
            data: {
                locked: true,
                lockedAt: new Date(),
                lockedBySession: session.user.id,
            },
        })

        return NextResponse.json({
            draft: {
                content: draft.content,
                templateId: draft.templateId,
                updatedAt: draft.updatedAt,
            },
            locked: false,
        })
    } catch (error) {
        console.error('Draft load error:', error)
        return NextResponse.json(
            { error: 'Error al cargar borrador' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ appointment_id: string }> }) {
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

        const { appointment_id } = await params

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointment_id },
        })

        if (!appointment || appointment.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Cita no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        await prisma.clinicalNoteDraft.update({
            where: { appointmentId: appointment_id },
            data: {
                locked: false,
                lockedAt: null,
                lockedBySession: null,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Draft unlock error:', error)
        return NextResponse.json(
            { error: 'Error al desbloquear' },
            { status: 500 }
        )
    }
}
