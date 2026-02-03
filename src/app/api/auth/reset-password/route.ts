import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { verifyPasswordResetToken } from '@/lib/tokens'

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const dynamic = 'force-dynamic'

/**
 * Reset password with token
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, password } = resetPasswordSchema.parse(body)

        // Verify token and get email
        const email = await verifyPasswordResetToken(token)

        if (!email) {
            return NextResponse.json(
                { error: 'El enlace es inválido o ha expirado. Solicita uno nuevo.' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update user password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        })

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Password reset error:', error)
        return NextResponse.json(
            { error: 'Error al restablecer la contraseña' },
            { status: 500 }
        )
    }
}
