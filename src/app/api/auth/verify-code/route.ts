import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { generateVerificationCode, sendVerificationCodeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { captureApiError, getRequestId } from '@/lib/observability'
import { normalizeEmail } from '@/lib/emailAddress'

function createProfessionalSlug(name: string | null | undefined, userId: string) {
    const base = (name || 'profesional')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
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

// Vigencia del código enviado por correo
const CODE_EXPIRATION_MINUTES = 15
// Intentos fallidos permitidos por código. Al agotarlos el correo queda
// bloqueado hasta que el código expira, aunque se pida otro.
const MAX_ATTEMPTS = 5
// Espera mínima entre dos envíos al mismo correo (independiente de la IP).
const RESEND_COOLDOWN_MS = 60 * 1000
// Vigencia del token que autoriza completar el registro tras verificar el código.
const COMPLETION_TOKEN_TTL_MS = 10 * 60 * 1000
const MIN_PASSWORD_LENGTH = 8

export const dynamic = 'force-dynamic'

function sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

function tooManyRequests(message: string, retryAfterSeconds: number) {
    return NextResponse.json(
        { error: message },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfterSeconds)) } }
    )
}

/**
 * Búsqueda de usuario sin distinguir mayúsculas, para cubrir cuentas antiguas
 * guardadas con el correo tal como lo escribió la persona.
 */
function findUserByEmail(email: string) {
    return prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    })
}

/**
 * Emite un código nuevo para el correo. Aplica el bloqueo por intentos y la
 * espera entre envíos con datos de la base, de modo que no dependen de la IP
 * ni de la memoria de una instancia.
 */
async function issueCode(email: string, name: string) {
    const previous = await prisma.emailVerificationCode.findFirst({
        where: { email },
        orderBy: { createdAt: 'desc' },
    })

    if (previous) {
        const now = Date.now()
        if (!previous.verified && previous.attempts >= MAX_ATTEMPTS && previous.expires.getTime() > now) {
            return {
                blocked: tooManyRequests(
                    'Demasiados intentos fallidos. Espera unos minutos antes de pedir otro código.',
                    Math.ceil((previous.expires.getTime() - now) / 1000)
                ),
            }
        }
        if (!previous.verified && now - previous.createdAt.getTime() < RESEND_COOLDOWN_MS) {
            return {
                blocked: tooManyRequests(
                    'Ya te enviamos un código hace un momento. Espera un minuto para pedir otro.',
                    Math.ceil((RESEND_COOLDOWN_MS - (now - previous.createdAt.getTime())) / 1000)
                ),
            }
        }
    }

    await prisma.emailVerificationCode.deleteMany({ where: { email } })

    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000)

    if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 ==================== CÓDIGO DE VERIFICACIÓN ====================')
        console.log(`📬 Email: ${email}`)
        console.log(`🔐 Código: ${verificationCode}`)
        console.log('====================================================================\n')
    }

    await prisma.emailVerificationCode.create({
        data: {
            email,
            code: verificationCode,
            expires: expiresAt,
        },
    })

    const result = await sendVerificationCodeEmail(email, name, verificationCode)
    return { result }
}

export async function POST(request: Request) {
    const blocked = getWaitlistBlockedResponse()
    if (blocked) return blocked

    const requestId = getRequestId(request)
    try {
        const body = await request.json()
        const { action, name, code, password, userType, completionToken } = body
        const email = normalizeEmail(body.email)
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

        if (action === 'send' || action === 'resend') {
            const sendLimit = checkRateLimit(`auth:verify-code:${action}:${clientIp}:${email || 'unknown'}`, {
                limit: 5,
                windowMs: 15 * 60 * 1000,
            })

            if (!sendLimit.allowed) {
                return NextResponse.json(
                    { error: 'Has solicitado demasiados codigos. Espera unos minutos.' },
                    { status: 429, headers: createRateLimitHeaders(sendLimit) }
                )
            }

            if (!email || !name) {
                return NextResponse.json(
                    { error: 'Email y nombre son requeridos' },
                    { status: 400 }
                )
            }

            // Un correo ya verificado no recibe códigos: evita usar el envío
            // para molestar a terceros y cerrar la vía de toma de cuentas.
            const existingUser = await findUserByEmail(email)
            if (existingUser?.emailVerified) {
                return NextResponse.json(
                    { error: 'Este correo ya está registrado' },
                    { status: 400 }
                )
            }

            const issued = await issueCode(email, String(name))
            if (issued.blocked) return issued.blocked

            if (!issued.result.success) {
                console.error('[/api/auth/verify-code] Email sending failed:', issued.result.error)
                return NextResponse.json(
                    {
                        error: issued.result.error || 'Error al enviar el código de verificación',
                        message: 'Error en servicio de correo',
                    },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                success: true,
                message: action === 'resend' ? 'Nuevo código de verificación enviado' : 'Código de verificación enviado',
                expiresIn: CODE_EXPIRATION_MINUTES,
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

            if (!email || !code) {
                return NextResponse.json(
                    { error: 'Email y código son requeridos' },
                    { status: 400 }
                )
            }

            const normalizedCode = String(code).trim()
            if (!/^\d{6}$/.test(normalizedCode)) {
                return NextResponse.json(
                    { error: 'Código inválido' },
                    { status: 400 }
                )
            }

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

            if (new Date() > verificationRecord.expires) {
                await prisma.emailVerificationCode.delete({
                    where: { id: verificationRecord.id },
                })
                return NextResponse.json(
                    { error: 'El código ha expirado. Por favor solicita uno nuevo.' },
                    { status: 400 }
                )
            }

            const exhaustedMessage =
                'Demasiados intentos fallidos. Espera unos minutos antes de pedir un nuevo código.'

            if (verificationRecord.attempts >= MAX_ATTEMPTS) {
                return NextResponse.json({ error: exhaustedMessage }, { status: 400 })
            }

            // Reserva el intento de forma atómica ANTES de comparar. Así,
            // solicitudes en paralelo no pueden superar el máximo de intentos.
            const reserved = await prisma.emailVerificationCode.updateMany({
                where: {
                    id: verificationRecord.id,
                    verified: false,
                    attempts: { lt: MAX_ATTEMPTS },
                },
                data: { attempts: { increment: 1 } },
            })

            if (reserved.count === 0) {
                return NextResponse.json({ error: exhaustedMessage }, { status: 400 })
            }

            if (!safeEqual(verificationRecord.code, normalizedCode)) {
                const remainingAttempts = Math.max(0, MAX_ATTEMPTS - verificationRecord.attempts - 1)
                return NextResponse.json(
                    {
                        error: `Código incorrecto. Te quedan ${remainingAttempts} intento${remainingAttempts !== 1 ? 's' : ''}.`,
                        remainingAttempts,
                    },
                    { status: 400 }
                )
            }

            // Código correcto: se reemplaza por el hash de un token de un solo
            // uso que solo recibe quien verificó. Sin ese token no se puede
            // completar el registro de este correo.
            const token = crypto.randomBytes(32).toString('hex')
            const consumed = await prisma.emailVerificationCode.updateMany({
                where: { id: verificationRecord.id, verified: false },
                data: {
                    verified: true,
                    code: sha256(token),
                    expires: new Date(Date.now() + COMPLETION_TOKEN_TTL_MS),
                },
            })

            if (consumed.count === 0) {
                return NextResponse.json(
                    { error: 'El código ya fue utilizado. Solicita uno nuevo.' },
                    { status: 400 }
                )
            }

            return NextResponse.json({
                success: true,
                message: 'Código verificado correctamente',
                verified: true,
                completionToken: token,
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

            if (!email || !name || !password || typeof completionToken !== 'string' || !completionToken) {
                return NextResponse.json(
                    { error: 'Datos incompletos para el registro' },
                    { status: 400 }
                )
            }

            if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
                return NextResponse.json(
                    { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
                    { status: 400 }
                )
            }

            // El token debe corresponder a una verificación reciente de ESTE correo.
            const verifiedRecord = await prisma.emailVerificationCode.findFirst({
                where: {
                    email,
                    verified: true,
                    code: sha256(completionToken),
                    expires: { gt: new Date() },
                },
            })

            if (!verifiedRecord) {
                return NextResponse.json(
                    { error: 'Debes verificar tu correo antes de completar el registro' },
                    { status: 400 }
                )
            }

            const existingUser = await findUserByEmail(email)

            if (existingUser?.emailVerified) {
                return NextResponse.json(
                    { error: 'Este correo ya está registrado' },
                    { status: 400 }
                )
            }

            // Consumo atómico: el token sirve una sola vez aunque lleguen dos
            // solicitudes en paralelo.
            const consumed = await prisma.emailVerificationCode.deleteMany({
                where: { id: verifiedRecord.id },
            })
            if (consumed.count === 0) {
                return NextResponse.json(
                    { error: 'La verificación ya fue utilizada. Vuelve a verificar tu correo.' },
                    { status: 400 }
                )
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            if (existingUser) {
                // Cuenta sin verificar: quien acaba de probar que controla el
                // correo es el dueño real, por lo que su contraseña reemplaza
                // cualquiera que se hubiera fijado antes sin verificación.
                const updatedUser = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { emailVerified: new Date(), password: hashedPassword },
                })

                if (updatedUser.role === 'PROFESSIONAL') {
                    await ensureProfessionalProfile(updatedUser.id, updatedUser.name)
                }

                await prisma.emailVerificationCode.deleteMany({ where: { email } })

                return NextResponse.json({
                    success: true,
                    message: 'Correo verificado exitosamente',
                    userId: existingUser.id,
                })
            }

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

            await prisma.emailVerificationCode.deleteMany({ where: { email } })

            return NextResponse.json({
                success: true,
                message: 'Registro completado exitosamente',
                userId: user.id,
            })
        }

        return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
        )

    } catch (error) {
        console.error('[/api/auth/verify-code] Error:', error)
        await captureApiError('/api/auth/verify-code', error, requestId)
        const errorMessage = error instanceof Error ? error.message : 'Error en el proceso de verificación'
        return NextResponse.json(
            { error: 'Error en el proceso de verificación', details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined, requestId },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }
}
