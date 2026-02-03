import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Resend verification email
 */
export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        // Check if already verified
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true, emailVerified: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { error: 'El email ya está verificado' },
                { status: 400 }
            )
        }

        // Create verification token
        const token = await createVerificationToken(user.email)

        // Send email
        const emailResult = await sendVerificationEmail(
            user.email,
            user.name || 'Usuario',
            token
        )

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error)
            return NextResponse.json(
                { error: 'Error al enviar el email de verificación' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Email de verificación enviado. Revisa tu bandeja de entrada.',
        })
    } catch (error) {
        console.error('Resend verification error:', error)
        return NextResponse.json(
            { error: 'Error al enviar el email de verificación' },
            { status: 500 }
        )
    }
}
