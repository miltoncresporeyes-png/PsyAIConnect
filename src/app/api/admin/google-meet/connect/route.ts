import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/adminGuard'
import { buildAuthUrl, isGoogleMeetConfigured } from '@/lib/googleMeet'

export const dynamic = 'force-dynamic'

const GOOGLE_STATE_COOKIE = 'gm_oauth_state'

/** Inicia la autorizacion de la cuenta de Google que creara las salas de Meet. */
export async function GET() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error
    if (!isGoogleMeetConfigured()) {
        return NextResponse.json({ error: 'Faltan GOOGLE_MEET_CLIENT_ID / GOOGLE_MEET_CLIENT_SECRET' }, { status: 503 })
    }

    const state = crypto.randomBytes(24).toString('hex')
    const response = NextResponse.redirect(buildAuthUrl(state))
    response.cookies.set(GOOGLE_STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 10 * 60,
    })
    return response
}
