import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const waitlistSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().optional(),
    type: z.enum(['patient', 'professional']).default('patient'),
    profession: z.string().optional(),
    source: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = waitlistSchema.parse(body)

        // Check if email already exists
        const existing = await prisma.waitlistEntry.findUnique({
            where: { email: data.email },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Este email ya está registrado en la lista de espera' },
                { status: 400 }
            )
        }

        // Create waitlist entry
        const entry = await prisma.waitlistEntry.create({
            data: {
                email: data.email,
                name: data.name,
                type: data.type === 'professional' ? 'PROFESSIONAL' : 'PATIENT',
                profession: data.profession,
                source: data.source || 'landing',
            },
        })

        return NextResponse.json({
            success: true,
            message: '¡Te has unido a la lista de espera!',
            id: entry.id,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Waitlist error:', error)
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const count = await prisma.waitlistEntry.count()

        return NextResponse.json({
            count,
            patients: await prisma.waitlistEntry.count({ where: { type: 'PATIENT' } }),
            professionals: await prisma.waitlistEntry.count({ where: { type: 'PROFESSIONAL' } }),
        })
    } catch (error) {
        console.error('Waitlist count error:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}
