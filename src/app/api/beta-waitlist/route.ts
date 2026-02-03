import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        // Validación básica
        if (!email) {
            return NextResponse.json(
                { error: 'El correo electrónico es requerido' },
                { status: 400 }
            )
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Formato de correo electrónico inválido' },
                { status: 400 }
            )
        }

        // Verificar si el email ya existe
        const existingEntry = await prisma.waitlistEntry.findUnique({
            where: { email },
        })

        if (existingEntry) {
            return NextResponse.json(
                { error: 'Este correo ya está registrado en la lista de espera' },
                { status: 409 }
            )
        }

        // Crear nueva entrada en la waitlist
        const waitlistEntry = await prisma.waitlistEntry.create({
            data: {
                email,
                type: 'PATIENT', // Valor por defecto
                source: 'beta-launch-banner',
            },
        })

        // TODO: Aquí puedes agregar lógica para enviar email de confirmación
        // usando un servicio como Resend, SendGrid, etc.

        return NextResponse.json(
            {
                success: true,
                message: '¡Te has registrado exitosamente en la lista de espera!',
                waitlistEntry: {
                    id: waitlistEntry.id,
                    email: waitlistEntry.email,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error al registrar en waitlist:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor. Por favor, intenta de nuevo.' },
            { status: 500 }
        )
    }
}

// Endpoint GET opcional para verificar el estado de la waitlist (solo admin)
export async function GET(request: NextRequest) {
    try {
        const count = await prisma.waitlistEntry.count({
            where: {
                source: 'beta-launch-banner',
            },
        })

        return NextResponse.json({
            success: true,
            count,
        })
    } catch (error) {
        console.error('Error al obtener estadísticas de waitlist:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
