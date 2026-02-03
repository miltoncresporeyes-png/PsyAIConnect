import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    role: z.enum(['PATIENT', 'PROFESSIONAL']).default('PATIENT'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = registerSchema.parse(body)

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email ya está registrado' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
        })

        // If professional, create professional profile placeholder
        if (data.role === 'PROFESSIONAL') {
            await prisma.professional.create({
                data: {
                    userId: user.id,
                    professionalType: 'PSYCHOLOGIST',
                    slug: `${user.name?.toLowerCase().replace(/\s+/g, '-')}-${user.id.slice(0, 6)}`,
                    sessionPrice: 50000, // Default price
                },
            })
        }

        // Send verification email
        try {
            const verificationToken = await createVerificationToken(user.email)
            await sendVerificationEmail(
                user.email,
                user.name || 'Usuario',
                verificationToken
            )
        } catch (emailError) {
            // Log but don't fail registration if email fails
            console.error('Failed to send verification email:', emailError)
        }

        // Log consent acceptance for Terms & Conditions and Privacy Policy
        try {
            const ipAddress = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'Unknown'
            const userAgent = request.headers.get('user-agent') || 'Unknown'
            const consentVersion = '1.0'

            // Create hash of consent text for integrity
            const crypto = await import('crypto')
            const termsHash = crypto.createHash('sha256')
                .update(`TERMS_OF_SERVICE_${consentVersion}_${new Date().toISOString()}`)
                .digest('hex')
            const privacyHash = crypto.createHash('sha256')
                .update(`PRIVACY_POLICY_${consentVersion}_${new Date().toISOString()}`)
                .digest('hex')

            // Log both consents
            await prisma.consentLog.createMany({
                data: [
                    {
                        userId: user.id,
                        consentType: 'TERMS_OF_SERVICE',
                        consentVersion: consentVersion,
                        consentTextHash: termsHash,
                        granted: true,
                        grantedAt: new Date(),
                        ipAddress: ipAddress,
                        userAgent: userAgent,
                    },
                    {
                        userId: user.id,
                        consentType: 'PRIVACY_POLICY',
                        consentVersion: consentVersion,
                        consentTextHash: privacyHash,
                        granted: true,
                        grantedAt: new Date(),
                        ipAddress: ipAddress,
                        userAgent: userAgent,
                    },
                ],
            })
        } catch (consentError) {
            // Log but don't fail registration
            console.error('Failed to log consent:', consentError)
        }


        return NextResponse.json({
            success: true,
            message: 'Usuario creado exitosamente. Te enviamos un correo para verificar tu cuenta.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Register error:', error)
        return NextResponse.json(
            { error: 'Error al crear usuario' },
            { status: 500 }
        )
    }
}
