import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { verifyEmailToken } from '@/lib/tokens'

const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
})

export const dynamic = 'force-dynamic'

/**
 * Verify email with token
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token } = verifyEmailSchema.parse(body)

        // Verify token and get email
        const email = await verifyEmailToken(token)

        if (!email) {
            return NextResponse.json(
                { error: 'El enlace de verificación es inválido o ha expirado.' },
                { status: 400 }
            )
        }

        // Update user as verified
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        })

        return NextResponse.json({
            success: true,
            message: '¡Email verificado exitosamente! Ya puedes usar todas las funciones.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Email verification error:', error)
        return NextResponse.json(
            { error: 'Error al verificar el email' },
            { status: 500 }
        )
    }
}
