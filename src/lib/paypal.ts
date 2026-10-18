/**
 * PayPal Checkout v2 Orders Integration
 * Official Docs: https://developer.paypal.com/docs/api/orders/v2/
 */

function isPayPalProduction(): boolean {
    return process.env.PAYPAL_ENVIRONMENT === 'production'
}

function getPayPalBaseUrl(): string {
    return isPayPalProduction()
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
}

function getClientId(): string {
    return process.env.PAYPAL_CLIENT_ID || ''
}

function getClientSecret(): string {
    return process.env.PAYPAL_CLIENT_SECRET || ''
}

export function isPayPalConfigured(): boolean {
    return Boolean(getClientId() && getClientSecret())
}

/**
 * Obtain an OAuth2 access token from PayPal
 */
async function getPayPalAccessToken(): Promise<string> {
    const clientId = getClientId()
    const clientSecret = getClientSecret()

    if (!clientId || !clientSecret) {
        throw new Error('PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET deben estar configurados en las variables de entorno.')
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const baseUrl = getPayPalBaseUrl()

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`PayPal auth error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.access_token
}

export interface PayPalCreateOrderParams {
    appointmentId: string
    amountClp: number
    description: string
    returnUrl: string
    cancelUrl: string
}

export interface PayPalCreateOrderResult {
    orderId: string
    approveUrl: string
}

/**
 * Creates an order in PayPal Checkout v2
 * Note: PayPal standard accounts typically process USD for Chilean transactions.
 * Uses an approximate rate or explicit USD conversion.
 */
export async function createPayPalOrder(params: PayPalCreateOrderParams): Promise<PayPalCreateOrderResult> {
    const accessToken = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()

    // Approximate conversion CLP -> USD (can be configured via PAYPAL_USD_EXCHANGE_RATE)
    const exchangeRate = Number(process.env.PAYPAL_USD_EXCHANGE_RATE) || 950
    const amountUsd = (params.amountClp / exchangeRate).toFixed(2)

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                reference_id: params.appointmentId,
                description: params.description,
                amount: {
                    currency_code: 'USD',
                    value: amountUsd,
                },
            },
        ],
        application_context: {
            brand_name: 'PsyConnect',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
        },
    }

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`PayPal create order error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const approveLink = data.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approveLink) {
        throw new Error('PayPal no retornó link de aprobación')
    }

    return {
        orderId: data.id,
        approveUrl: approveLink,
    }
}

/**
 * Capture an approved PayPal order
 */
export async function capturePayPalOrder(orderId: string) {
    const accessToken = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`PayPal capture error (${response.status}): ${errorText}`)
    }

    return response.json()
}
