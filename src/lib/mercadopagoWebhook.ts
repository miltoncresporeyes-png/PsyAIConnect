import crypto from 'crypto'

export interface SignatureCheckInput {
    /** Header `x-signature` ("ts=...,v1=..."). */
    xSignature: string | null
    /** Header `x-request-id`. */
    xRequestId: string | null
    /** ID del recurso notificado (`data.id` de la query). */
    dataId: string | null
    /** Secreto de firma del webhook (panel de Mercado Pago → Webhooks). */
    secret: string
}

/**
 * Valida la firma de una notificación de Mercado Pago:
 * HMAC-SHA256 (hex) del manifest `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` con el secreto del webhook.
 * Docs: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoSignature({ xSignature, xRequestId, dataId, secret }: SignatureCheckInput): boolean {
    if (!xSignature || !secret) return false

    let ts: string | undefined
    let v1: string | undefined
    for (const part of xSignature.split(',')) {
        const [key, value] = part.split('=').map((s) => s.trim())
        if (key === 'ts') ts = value
        if (key === 'v1') v1 = value
    }
    if (!ts || !v1) return false

    // Si el id es alfanumérico se firma en minúsculas
    const id = dataId && /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId
    let manifest = ''
    if (id) manifest += `id:${id};`
    if (xRequestId) manifest += `request-id:${xRequestId};`
    manifest += `ts:${ts};`

    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(v1, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}
