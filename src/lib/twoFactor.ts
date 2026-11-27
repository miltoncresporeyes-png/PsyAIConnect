import crypto from 'crypto'

export const LOGIN_CODE_TTL_MS = 10 * 60 * 1000
export const LOGIN_CODE_RESEND_COOLDOWN_MS = 60 * 1000
export const LOGIN_CODE_MAX_ATTEMPTS = 5
// Un inicio de sesion hecho justo despues de verificar el correo no pide
// un segundo codigo (la persona acaba de demostrar que controla el correo).
export const RECENT_EMAIL_VERIFICATION_MS = 2 * 60 * 1000

export function hashLoginCode(code: string): string {
    return crypto
        .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'dev-secret')
        .update(code)
        .digest('hex')
}

export function loginCodeMatches(code: string, codeHash: string): boolean {
    const a = Buffer.from(hashLoginCode(code))
    const b = Buffer.from(codeHash)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}
