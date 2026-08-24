import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const templateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    content: z.string().min(1),
    category: z.string().optional().default('general'),
})

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

        const templates = await prisma.clinicalTemplate.findMany({
            where: {
                isActive: true,
                OR: [
                    { isGlobal: true },
                    ...(professional ? [{ professionalId: professional.id }] : []),
                ],
            },
            orderBy: [
                { isGlobal: 'desc' },
                { sortOrder: 'asc' },
                { name: 'asc' },
            ],
        })

        return NextResponse.json({ templates })
    } catch (error) {
        console.error('Templates fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener plantillas' },
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
        const data = templateSchema.parse(body)

        const template = await prisma.clinicalTemplate.create({
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                category: data.category,
                professionalId: professional.id,
                isGlobal: false,
                isActive: true,
            },
        })

        return NextResponse.json({
            success: true,
            template,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Template create error:', error)
        return NextResponse.json(
            { error: 'Error al crear plantilla' },
            { status: 500 }
        )
    }
}
