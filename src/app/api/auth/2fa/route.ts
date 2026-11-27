import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationCode, sendLoginCodeEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rateLimit'
import {
    LOGIN_CODE_MAX_ATTEMPTS,
    LOGIN_CODE_RESEND_COOLDOWN_MS,
    LOGIN_CODE_TTL_MS,
    hashLoginCode,
    loginCodeMatches,
} from '@/lib/twoFactor'

function fail(message: string, status: number, retryAfter?: number) {
    return NextResponse.json(
        { error: message },
        { status, headers: retryAfter ? { 'Retry-After': String(Math.max(1, retryAfter)) } : undefined }
    )
}

export async function POST(request: NextRequest) {
    // Se lee el JWT directamente: getServerSession oculta al usuario mientras
    // el segundo paso esta pendiente.
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id || !token.sid) return fail('Sesión no válida', 401)

    const body = await request.json().catch(() => null)
    const action = body?.action
    const userId = token.id as string
    const sessionId = token.sid as string

    if (action === 'send') {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        })
        if (!user) return fail('Sesión no válida', 401)

        const existing = await prisma.loginChallenge.findUnique({ where: { sessionId } })
        if (existing?.verifiedAt) return NextResponse.json({ success: true, alreadyVerified: true })

        const now = Date.now()
        if (
            existing &&
            existing.expires.getTime() > now &&
            now - existing.createdAt.getTime() < LOGIN_CODE_RESEND_COOLDOWN_MS
        ) {
            const wait = Math.ceil((LOGIN_CODE_RESEND_COOLDOWN_MS - (now - existing.createdAt.getTime())) / 1000)
            return NextResponse.json({ success: true, cooldown: wait })
        }

        // El limite solo cuenta envios reales (no las visitas dentro del cooldown).
        const limit = checkRateLimit(`2fa:send:${userId}`, { limit: 6, windowMs: 15 * 60 * 1000 })
        if (!limit.allowed) {
            return fail('Demasiados envíos. Espera unos minutos e inténtalo de nuevo.', 429, 60)
        }

        const code = generateVerificationCode()
        if (process.env.NODE_ENV === 'development') {
            console.log(`\n🔐 [2FA] Código de acceso para ${user.email}: ${code}\n`)
        }

        await prisma.loginChallenge.upsert({
            where: { sessionId },
            create: {
                userId,
                sessionId,
                codeHash: hashLoginCode(code),
                expires: new Date(now + LOGIN_CODE_TTL_MS),
            },
            update: {
                codeHash: hashLoginCode(code),
                expires: new Date(now + LOGIN_CODE_TTL_MS),
                attempts: 0,
                createdAt: new Date(now),
            },
        })

        // Limpieza de desafios antiguos
        await prisma.loginChallenge.deleteMany({
            where: { expires: { lt: new Date(now - 24 * 60 * 60 * 1000) } },
        })

        const result = await sendLoginCodeEmail(user.email, user.name || '', code)
        if (!result.success) {
            return fail('No pudimos enviar el código. Inténtalo de nuevo en un momento.', 502)
        }
        return NextResponse.json({ success: true, cooldown: LOGIN_CODE_RESEND_COOLDOWN_MS / 1000 })
    }

    if (action === 'verify') {
        const code = String(body?.code ?? '').trim()
        if (!/^\d{6}$/.test(code)) return fail('Ingresa el código de 6 dígitos', 400)

        const challenge = await prisma.loginChallenge.findUnique({ where: { sessionId } })
        if (!challenge || challenge.userId !== userId) {
            return fail('Primero solicita un código', 400)
        }
        if (challenge.verifiedAt) return NextResponse.json({ success: true })
        if (challenge.expires.getTime() < Date.now()) {
            return fail('El código expiró. Solicita uno nuevo.', 400)
        }
        if (challenge.attempts >= LOGIN_CODE_MAX_ATTEMPTS) {
            return fail('Demasiados intentos. Solicita un código nuevo.', 429, 60)
        }

        if (!loginCodeMatches(code, challenge.codeHash)) {
            await prisma.loginChallenge.update({
                where: { id: challenge.id },
                data: { attempts: { increment: 1 } },
            })
            return fail('Código incorrecto', 400)
        }

        await prisma.loginChallenge.update({
            where: { id: challenge.id },
            data: { verifiedAt: new Date() },
        })
        return NextResponse.json({ success: true })
    }

    return fail('Acción no válida', 400)
}
