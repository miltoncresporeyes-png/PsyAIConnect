/**
 * Salas de Google Meet creadas por PsyDoctor: una sala nueva por cada cita.
 *
 * Una cuenta de Google de PsyDoctor (autorizada una vez por un administrador) crea las salas con la
 * API REST de Meet. El refresh token se guarda cifrado en GoogleMeetConnection.
 *
 * Las salas se crean con acceso ABIERTO: como el enlace es unico por cita y solo se entrega a los dos
 * participantes dentro de la ventana de la cita, no hace falta que un anfitrion admita a nadie
 * (con acceso RESTRICTED el anfitrion seria la cuenta de PsyDoctor, que nadie opera).
 */
import { prisma } from '@/lib/prisma'
import { decrypt, encrypt } from '@/lib/encryption'

export const MEET_SCOPE = 'https://www.googleapis.com/auth/meetings.space.created'
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
const MEET_API = 'https://meet.googleapis.com/v2'

export class GoogleMeetError extends Error {
    constructor(
        message: string,
        public code: 'NOT_CONFIGURED' | 'NOT_CONNECTED' | 'AUTH_FAILED' | 'API_FAILED'
    ) {
        super(message)
    }
}

function clientCredentials() {
    const clientId = process.env.GOOGLE_MEET_CLIENT_ID
    const clientSecret = process.env.GOOGLE_MEET_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        throw new GoogleMeetError('Faltan GOOGLE_MEET_CLIENT_ID / GOOGLE_MEET_CLIENT_SECRET', 'NOT_CONFIGURED')
    }
    return { clientId, clientSecret }
}

export function isGoogleMeetConfigured(): boolean {
    return Boolean(process.env.GOOGLE_MEET_CLIENT_ID && process.env.GOOGLE_MEET_CLIENT_SECRET)
}

export function getRedirectUri(): string {
    const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    return `${base}/api/google/callback`
}

export function buildAuthUrl(state: string): string {
    const { clientId } = clientCredentials()
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: getRedirectUri(),
        response_type: 'code',
        scope: `openid email ${MEET_SCOPE}`,
        access_type: 'offline',
        prompt: 'select_account consent', // elegir cuenta + forzar la entrega de refresh_token
        state,
    })
    return `${AUTH_URL}?${params.toString()}`
}

interface TokenResponse {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    scope?: string
    id_token?: string
    error?: string
    error_description?: string
}

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body),
    })
    const data = (await res.json().catch(() => ({}))) as TokenResponse
    if (!res.ok || data.error) {
        throw new GoogleMeetError(data.error_description || data.error || `Token HTTP ${res.status}`, 'AUTH_FAILED')
    }
    return data
}

/** Lee el correo del id_token (llega directo de Google por TLS en el intercambio del codigo). */
function emailFromIdToken(idToken?: string): string | null {
    if (!idToken) return null
    try {
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8'))
        return typeof payload.email === 'string' ? payload.email : null
    } catch {
        return null
    }
}

/** Intercambia el codigo de autorizacion y guarda la conexion (refresh token cifrado). */
export async function connectWithCode(code: string, adminUserId: string) {
    const { clientId, clientSecret } = clientCredentials()
    const token = await postToken({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(),
        grant_type: 'authorization_code',
    })
    if (!token.refresh_token) {
        throw new GoogleMeetError(
            'Google no entregó un refresh token. Revoca el acceso de la app en tu cuenta de Google e inténtalo de nuevo.',
            'AUTH_FAILED'
        )
    }
    if (!token.scope?.includes(MEET_SCOPE)) {
        throw new GoogleMeetError('No se concedió el permiso de Google Meet.', 'AUTH_FAILED')
    }

    const accountEmail = emailFromIdToken(token.id_token)
    const data = {
        accountEmail,
        refreshToken: encrypt(token.refresh_token),
        scope: token.scope ?? null,
        connectedById: adminUserId,
        connectedAt: new Date(),
    }
    await prisma.googleMeetConnection.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...data },
        update: data,
    })
    cachedToken = null
    return { accountEmail }
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value

    const { clientId, clientSecret } = clientCredentials()
    const connection = await prisma.googleMeetConnection.findUnique({ where: { id: 'default' } })
    if (!connection) {
        throw new GoogleMeetError('La cuenta de Google para las salas no está conectada.', 'NOT_CONNECTED')
    }
    const refreshToken = decrypt(Buffer.from(connection.refreshToken))
    const token = await postToken({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
    })
    if (!token.access_token) throw new GoogleMeetError('Google no entregó un access token.', 'AUTH_FAILED')

    cachedToken = { value: token.access_token, expiresAt: Date.now() + (token.expires_in ?? 3600) * 1000 }
    return token.access_token
}

export interface MeetSpace {
    name: string
    meetingUri: string
    meetingCode?: string
}

/** Crea una sala de Meet nueva (acceso abierto, enlace unico). */
export async function createMeetSpace(): Promise<MeetSpace> {
    const accessToken = await getAccessToken()
    const res = await fetch(`${MEET_API}/spaces`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { accessType: 'OPEN' } }),
    })
    const data = (await res.json().catch(() => ({}))) as Partial<MeetSpace> & { error?: { message?: string } }
    if (!res.ok || !data.meetingUri || !data.name) {
        throw new GoogleMeetError(data.error?.message || `Meet API HTTP ${res.status}`, 'API_FAILED')
    }
    return { name: data.name, meetingUri: data.meetingUri, meetingCode: data.meetingCode }
}

/** Desconecta la cuenta: borra el token guardado y lo revoca en Google (mejor esfuerzo). */
export async function disconnect() {
    const connection = await prisma.googleMeetConnection.findUnique({ where: { id: 'default' } })
    if (!connection) return
    try {
        const token = decrypt(Buffer.from(connection.refreshToken))
        await fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' })
    } catch {
        // si falla la revocacion igual se elimina el token local
    }
    await prisma.googleMeetConnection.delete({ where: { id: 'default' } })
    cachedToken = null
}

export async function getConnectionStatus() {
    const connection = await prisma.googleMeetConnection.findUnique({
        where: { id: 'default' },
        select: { accountEmail: true, connectedAt: true },
    })
    return {
        configured: isGoogleMeetConfigured(),
        connected: connection != null,
        accountEmail: connection?.accountEmail ?? null,
        connectedAt: connection?.connectedAt ?? null,
    }
}
