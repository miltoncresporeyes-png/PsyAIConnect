import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationCode, sendVerificationCodeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { captureApiError, getRequestId } from '@/lib/observability'

function createProfessionalSlug(name: string | null | undefined, userId: string) {
    const base = (name || 'profesional')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')

    return `${base || 'profesional'}-${userId.slice(0, 6)}`
}

async function ensureProfessionalProfile(userId: string, name: string | null | undefined) {
    const existing = await prisma.professional.findUnique({
        where: { userId },
        select: { id: true },
    })

    if (existing) {
        return
    }

    await prisma.professional.create({
        data: {
            userId,
            professionalType: 'PSYCHOLOGIST',
            slug: createProfessionalSlug(name, userId),
            sessionPrice: 50000,
        },
    })
}

// Code expiration time: 15 minutes
const CODE_EXPIRATION_MINUTES = 15
const MAX_ATTEMPTS = 5

// Development test code - use 123456 in development
const DEV_TEST_CODE = process.env.NODE_ENV === 'development' ? '123456' : null

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const requestId = getRequestId(request)
    try {
        const body = await request.json()
        const { action, email, name, code, password, userType } = body
        const clientIp = getClientIp(request)

        const globalLimit = checkRateLimit(`auth:verify-code:global:${clientIp}`, {
            limit: 50,
            windowMs: 15 * 60 * 1000,
        })

        if (!globalLimit.allowed) {
            return NextResponse.json(
                { error: 'Demasiados intentos. Intenta nuevamente en unos minutos.' },
                { status: 429, headers: createRateLimitHeaders(globalLimit) }
            )
        }

        if (action === 'send') {
            const sendLimit = checkRateLimit(`auth:verify-code:send:${clientIp}:${email || 'unknown'}`, {
                limit: 5,
                windowMs: 15 * 60 * 1000,
            })

            if (!sendLimit.allowed) {
                return NextResponse.json(
                    { error: 'Has solicitado demasiados codigos. Espera unos minutos.' },
                    { status: 429, headers: createRateLimitHeaders(sendLimit) }
                )
            }

            // Send verification code
            if (!email || !name) {
                return NextResponse.json(
                    { error: 'Email y nombre son requeridos' },
                    { status: 400 }
                )
            }

            // Check if email already exists and is verified
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser?.emailVerified) {
                return NextResponse.json(
                    { error: 'Este correo ya está registrado' },
                    { status: 400 }
                )
            }

            // Delete any existing codes for this email
            await prisma.emailVerificationCode.deleteMany({
                where: { email },
            })

            // Generate new code (use test code in development)
            const verificationCode = DEV_TEST_CODE || generateVerificationCode()
            const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000)

            // Log code in development
            if (process.env.NODE_ENV === 'development') {
                console.log('\n📧 ==================== CÓDIGO DE VERIFICACIÓN ====================')
                console.log(`📬 Email: ${email}`)
                console.log(`🔐 Código: ${verificationCode}`)
                console.log('====================================================================\n')
            }

            // Save code to database
            await prisma.emailVerificationCode.create({
                data: {
                    email,
                    code: verificationCode,
                    expires: expiresAt,
                },
            })

            // Send email
            const result = await sendVerificationCodeEmail(email, name, verificationCode)

            if (!result.success) {
                return NextResponse.json(
                    { error: 'Error al enviar el código de verificación' },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                success: true,
                message: 'Código de verificación enviado',
                expiresIn: CODE_EXPIRATION_MINUTES,
                // Include code in response for development testing
                ...(DEV_TEST_CODE && { devCode: verificationCode }),
            })
        }

        if (action === 'verify') {
            const verifyLimit = checkRateLimit(`auth:verify-code:verify:${clientIp}:${email || 'unknown'}`, {
                limit: 20,
                windowMs: 15 * 60 * 1000,
            })

            if (!verifyLimit.allowed) {
                return NextResponse.json(
                    { error: 'Demasiados intentos de verificacion. Intenta nuevamente mas tarde.' },
                    { status: 429, headers: createRateLimitHeaders(verifyLimit) }
                )
            }

            // Verify code
            if (!email || !code) {
                return NextResponse.json(
                    { error: 'Email y código son requeridos' },
                    { status: 400 }
                )
            }

            // Find the verification code
            const verificationRecord = await prisma.emailVerificationCode.findFirst({
                where: {
                    email,
                    verified: false,
                },
                orderBy: { createdAt: 'desc' },
            })

            if (!verificationRecord) {
                return NextResponse.json(
                    { error: 'No se encontró un código de verificación para este email' },
                    { status: 400 }
                )
            }

            // Check if expired
            if (new Date() > verificationRecord.expires) {
                await prisma.emailVerificationCode.delete({
                    where: { id: verificationRecord.id },
                })
                return NextResponse.json(
                    { error: 'El código ha expirado. Por favor solicita uno nuevo.' },
                    { status: 400 }
                )
            }

            // Check attempts
            if (verificationRecord.attempts >= MAX_ATTEMPTS) {
                await prisma.emailVerificationCode.delete({
                    where: { id: verificationRecord.id },
                })
                return NextResponse.json(
                    { error: 'Demasiados intentos fallidos. Por favor solicita un nuevo código.' },
                    { status: 400 }
                )
            }

            // Verify code
            if (verificationRecord.code !== code) {
                // Increment attempts
                await prisma.emailVerificationCode.update({
                    where: { id: verificationRecord.id },
                    data: { attempts: { increment: 1 } },
                })

                const remainingAttempts = MAX_ATTEMPTS - verificationRecord.attempts - 1
                return NextResponse.json(
                    {
                        error: `Código incorrecto. Te quedan ${remainingAttempts} intento${remainingAttempts !== 1 ? 's' : ''}.`,
                        remainingAttempts,
                    },
                    { status: 400 }
                )
            }

            // Code is correct - mark as verified
            await prisma.emailVerificationCode.update({
                where: { id: verificationRecord.id },
                data: { verified: true },
            })

            return NextResponse.json({
                success: true,
                message: 'Código verificado correctamente',
                verified: true,
            })
        }

        if (action === 'complete') {
            const completeLimit = checkRateLimit(`auth:verify-code:complete:${clientIp}:${email || 'unknown'}`, {
                limit: 10,
                windowMs: 15 * 60 * 1000,
            })

            if (!completeLimit.allowed) {
                return NextResponse.json(
                    { error: 'Demasiados intentos para completar registro. Intenta nuevamente mas tarde.' },
                    { status: 429, headers: createRateLimitHeaders(completeLimit) }
                )
            }

            // Complete registration after verification
            if (!email || !name || !password) {
                return NextResponse.json(
                    { error: 'Datos incompletos para el registro' },
                    { status: 400 }
                )
            }

            // Check that email was verified
            const verifiedCode = await prisma.emailVerificationCode.findFirst({
                where: {
                    email,
                    verified: true,
                },
            })

            if (!verifiedCode) {
                return NextResponse.json(
                    { error: 'Debes verificar tu correo antes de completar el registro' },
                    { status: 400 }
                )
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                const updateData: { emailVerified: Date; password?: string } = {
                    emailVerified: new Date(),
                }

                if (!existingUser.password) {
                    updateData.password = await bcrypt.hash(password, 12)
                }

                // Update existing user with verified email
                const updatedUser = await prisma.user.update({
                    where: { email },
                    data: updateData,
                })

                if (updatedUser.role === 'PROFESSIONAL') {
                    await ensureProfessionalProfile(updatedUser.id, updatedUser.name)
                }

                // Clean up verification codes
                await prisma.emailVerificationCode.deleteMany({
                    where: { email },
                })

                return NextResponse.json({
                    success: true,
                    message: 'Correo verificado exitosamente',
                    userId: existingUser.id,
                })
            }

            // Create new user with verified email
            const hashedPassword = await bcrypt.hash(password, 12)
            const role = userType === 'professional' ? 'PROFESSIONAL' : 'PATIENT'

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role,
                    emailVerified: new Date(),
                },
            })

            if (role === 'PROFESSIONAL') {
                await ensureProfessionalProfile(user.id, user.name)
            }

            // Clean up verification codes
            await prisma.emailVerificationCode.deleteMany({
                where: { email },
            })

            return NextResponse.json({
                success: true,
                message: 'Registro completado exitosamente',
                userId: user.id,
            })
        }

        if (action === 'resend') {
            const resendLimit = checkRateLimit(`auth:verify-code:resend:${clientIp}:${email || 'unknown'}`, {
                limit: 5,
                windowMs: 15 * 60 * 1000,
            })

            if (!resendLimit.allowed) {
                return NextResponse.json(
                    { error: 'Demasiados reenvios de codigo. Espera unos minutos.' },
                    { status: 429, headers: createRateLimitHeaders(resendLimit) }
                )
            }

            // Resend verification code
            if (!email || !name) {
                return NextResponse.json(
                    { error: 'Email y nombre son requeridos' },
                    { status: 400 }
                )
            }

            // Delete any existing codes for this email
            await prisma.emailVerificationCode.deleteMany({
                where: { email },
            })

            // Generate new code
            const verificationCode = generateVerificationCode()
            const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000)

            // Save code to database
            await prisma.emailVerificationCode.create({
                data: {
                    email,
                    code: verificationCode,
                    expires: expiresAt,
                },
            })

            // Send email
            const result = await sendVerificationCodeEmail(email, name, verificationCode)

            if (!result.success) {
                return NextResponse.json(
                    { error: 'Error al reenviar el código de verificación' },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                success: true,
                message: 'Nuevo código de verificación enviado',
                expiresIn: CODE_EXPIRATION_MINUTES,
            })
        }

        return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
        )

    } catch (error) {
        await captureApiError('/api/auth/verify-code', error, requestId)
        return NextResponse.json(
            { error: 'Error en el proceso de verificación', requestId },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }
}
