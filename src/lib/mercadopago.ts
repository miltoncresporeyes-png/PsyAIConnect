/**
 * Mercado Pago Checkout Pro Integration
 * Official Docs: https://www.mercadopago.cl/developers/es/reference/preferences/_checkout_preferences/post
 */

export interface MercadoPagoPreferenceParams {
    title: string
    unitPrice: number
    quantity?: number
    currencyId?: string
    payerEmail: string
    payerName?: string
    externalReference: string // appointmentId
    backUrls: {
        success: string
        failure: string
        pending: string
    }
    notificationUrl?: string
}

export interface MercadoPagoPreferenceResult {
    id: string
    initPoint: string
    sandboxInitPoint: string
}

function getMercadoPagoAccessToken(): string {
    return process.env.MERCADOPAGO_ACCESS_TOKEN || ''
}

export function isMercadoPagoConfigured(): boolean {
    return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN)
}

/**
 * Create a Checkout Pro Preference in Mercado Pago
 */
export async function createMercadoPagoPreference(
    params: MercadoPagoPreferenceParams
): Promise<MercadoPagoPreferenceResult> {
    const token = getMercadoPagoAccessToken()
    if (!token) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno.')
    }

    const payload = {
        items: [
            {
                id: params.externalReference,
                title: params.title,
                quantity: params.quantity || 1,
                unit_price: Math.round(params.unitPrice),
                currency_id: params.currencyId || 'CLP',
            },
        ],
        payer: {
            email: params.payerEmail,
            name: params.payerName || 'Paciente',
        },
        external_reference: params.externalReference,
        back_urls: params.backUrls,
        auto_return: 'approved',
        statement_descriptor: 'PSYCONNECT',
        ...(params.notificationUrl && { notification_url: params.notificationUrl }),
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Mercado Pago API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return {
        id: data.id,
        initPoint: data.init_point,
        sandboxInitPoint: data.sandbox_init_point,
    }
}

/**
 * Verify payment status by payment ID
 */
export async function getMercadoPagoPayment(paymentId: string) {
    const token = getMercadoPagoAccessToken()
    if (!token) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado.')
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error obteniendo pago de Mercado Pago: ${errorText}`)
    }

    return response.json()
}
