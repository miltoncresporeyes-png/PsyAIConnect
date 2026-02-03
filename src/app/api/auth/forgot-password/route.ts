import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

const requestResetSchema = z.object({
    email: z.string().email('Email inválido'),
})

export const dynamic = 'force-dynamic'

/**
 * Request password reset - sends email with reset link
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = requestResetSchema.parse(body)

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true },
        })

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
            })
        }

        // Create reset token
        const token = await createPasswordResetToken(email)

        // Send email
        const emailResult = await sendPasswordResetEmail(
            email,
            user.name || 'Usuario',
            token
        )

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error)
        }

        return NextResponse.json({
            success: true,
            message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Password reset request error:', error)
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        )
    }
}
