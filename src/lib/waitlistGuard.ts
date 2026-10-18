import { NextResponse } from 'next/server'

/**
 * Retorna true si la aplicación se encuentra configurada en modo lista de espera.
 */
export function isWaitlistMode(): boolean {
    return process.env.WAITLIST_MODE === 'true'
}

/**
 * Responde 404 JSON inmediatamente si WAITLIST_MODE === 'true',
 * evitando acceso a base de datos, APIs de terceros o servicios externos.
 * Si no está en modo lista de espera, retorna null para continuar el flujo normal.
 */
export function getWaitlistBlockedResponse(): NextResponse | null {
    if (isWaitlistMode()) {
        return NextResponse.json(
            { error: 'Not found' },
            {
                status: 404,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            }
        )
    }
    return null
}
