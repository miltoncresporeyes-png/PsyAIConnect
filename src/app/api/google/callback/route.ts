import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { connectWithCode, GoogleMeetError } from '@/lib/googleMeet'

export const dynamic = 'force-dynamic'

const COOKIE = 'gm_oauth_state'

function back(req: NextRequest, params: Record<string, string>) {
    const base = (process.env.NEXTAUTH_URL || req.nextUrl.origin).replace(/\/$/, '')
    const url = new URL(`${base}/admin/salas`)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    const res = NextResponse.redirect(url)
    res.cookies.delete(COOKIE)
    return res
}

/** Callback de OAuth de Google: guarda la conexion de la cuenta de salas (solo administradores). */
export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const { searchParams } = req.nextUrl
    const googleError = searchParams.get('error')
    if (googleError) return back(req, { error: googleError })

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const expected = req.cookies.get(COOKIE)?.value
    if (!code || !state || !expected || state !== expected) {
        return back(req, { error: 'estado_invalido' })
    }

    try {
        await connectWithCode(code, guard.adminId)
        return back(req, { ok: '1' })
    } catch (err) {
        console.error('[google-meet] callback error:', err)
        return back(req, { error: err instanceof GoogleMeetError ? err.message : 'error_desconocido' })
    }
}
