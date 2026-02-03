import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const professional = await prisma.professional.findUnique({
            where: {
                slug: params.slug,
                isPublic: true,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                availability: {
                    where: { isActive: true },
                    select: {
                        dayOfWeek: true,
                        startTime: true,
                        endTime: true,
                    },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
            },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(professional)
    } catch (error) {
        console.error('Professional fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener profesional' },
            { status: 500 }
        )
    }
}
