import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const slotSchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    isActive: z.boolean().default(true),
})

const availabilitySchema = z.object({
    slots: z.array(slotSchema),
})

export async function GET() {
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
                availability: {
                    where: { isActive: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
            },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil profesional no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(professional.availability)
    } catch (error) {
        console.error('Availability fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener disponibilidad' },
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
        const { slots } = availabilitySchema.parse(body)

        // Delete existing availability
        await prisma.availability.deleteMany({
            where: { professionalId: professional.id },
        })

        // Create new availability slots
        if (slots.length > 0) {
            await prisma.availability.createMany({
                data: slots.map(slot => ({
                    professionalId: professional.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isActive: slot.isActive,
                })),
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Disponibilidad actualizada',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Availability update error:', error)
        return NextResponse.json(
            { error: 'Error al guardar disponibilidad' },
            { status: 500 }
        )
    }
}
