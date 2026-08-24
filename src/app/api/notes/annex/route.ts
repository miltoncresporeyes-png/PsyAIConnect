import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptClinicalNote } from '@/lib/encryption'
import { generateAnnexHash, generateClinicalSignature } from '@/lib/clinicalSignature'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const annexSchema = z.object({
    clinicalNoteId: z.string(),
    content: z.string(),
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
        const { clinicalNoteId, content } = annexSchema.parse(body)

        const clinicalNote = await prisma.clinicalNote.findUnique({
            where: { id: clinicalNoteId },
        })

        if (!clinicalNote || clinicalNote.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Nota clínica no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        if (!clinicalNote.isFinalized) {
            return NextResponse.json(
                { error: 'La nota debe estar firmada antes de agregar anexos' },
                { status: 400 }
            )
        }

        const contentHash = generateAnnexHash(content, clinicalNoteId, professional.id)
        const signedAt = new Date()

        const encryptedContent = encryptClinicalNote(content)

        const annex = await prisma.clinicalNoteAnnex.create({
            data: {
                clinicalNoteId,
                content,
                encryptedContent,
                createdBy: professional.id,
                contentHash,
                signature: null,
                signedAt,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Anexo creado correctamente',
            annex: {
                id: annex.id,
                createdAt: annex.createdAt,
                contentHash,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Create annex error:', error)
        return NextResponse.json(
            { error: 'Error al crear anexo' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url)
        const clinicalNoteId = searchParams.get('clinicalNoteId')

        if (!clinicalNoteId) {
            return NextResponse.json(
                { error: 'Se requiere clinicalNoteId' },
                { status: 400 }
            )
        }

        const clinicalNote = await prisma.clinicalNote.findUnique({
            where: { id: clinicalNoteId },
        })

        if (!clinicalNote || clinicalNote.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'Nota clínica no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        const annexes = await prisma.clinicalNoteAnnex.findMany({
            where: { clinicalNoteId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                content: true,
                createdAt: true,
                contentHash: true,
            },
        })

        return NextResponse.json({ annexes })
    } catch (error) {
        console.error('Get annexes error:', error)
        return NextResponse.json(
            { error: 'Error al obtener anexos' },
            { status: 500 }
        )
    }
}
