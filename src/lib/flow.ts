/**
 * Flow.cl Payment Gateway Integration
 * 
 * Official API Docs: https://www.flow.cl/docs/api.html
 * 
 * Environment variables required:
 * - FLOW_API_KEY: Your Flow API key
 * - FLOW_SECRET_KEY: Your Flow secret key
 * - FLOW_ENVIRONMENT: 'sandbox' or 'production'
 */

import crypto from 'crypto'

const FLOW_API_URL = process.env.FLOW_ENVIRONMENT === 'production'
    ? 'https://www.flow.cl/api'
    : 'https://sandbox.flow.cl/api'

const FLOW_API_KEY = process.env.FLOW_API_KEY!
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY!

/**
 * Generate Flow signature for API requests
 */
function generateSignature(params: Record<string, any>): string {
    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort()
    const data = sortedKeys.map(key => `${key}${params[key]}`).join('')

    // Create HMAC SHA256 signature
    return crypto
        .createHmac('sha256', FLOW_SECRET_KEY)
        .update(data)
        .digest('hex')
}

interface CreatePaymentParams {
    commerceOrder: string       // Your internal order ID
    subject: string             // Payment description
    amount: number              // Amount in CLP
    email: string               // Payer email
    urlConfirmation: string     // Webhook URL for confirmation
    urlReturn: string           // URL to redirect after payment
    optional?: string           // Optional metadata (JSON string)
}

interface PaymentOrder {
    flowOrder: number
    url: string
    token: string
}

/**
 * Create a payment order in Flow
 */
export async function createPaymentOrder(
    params: CreatePaymentParams
): Promise<PaymentOrder> {
    const payload: Record<string, any> = {
        apiKey: FLOW_API_KEY,
        commerceOrder: params.commerceOrder,
        subject: params.subject,
        currency: 'CLP',
        amount: params.amount,
        email: params.email,
        urlConfirmation: params.urlConfirmation,
        urlReturn: params.urlReturn,
        ...(params.optional && { optional: params.optional }),
    }

    // Generate signature
    const s = generateSignature(payload)
    payload.s = s

    // Make API request
    const response = await fetch(`${FLOW_API_URL}/payment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload).toString(),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Flow API error: ${error}`)
    }

    const data = await response.json()

    return {
        flowOrder: data.flowOrder,
        url: data.url + '?token=' + data.token,
        token: data.token,
    }
}

interface PaymentStatus {
    flowOrder: number
    commerceOrder: string
    status: number              // 1=pending, 2=paid, 3=rejected, 4=cancelled
    amount: number
    payer: string
    paymentDate?: string
}

/**
 * Get payment status from Flow
 */
export async function getPaymentStatus(token: string): Promise<PaymentStatus> {
    const payload: Record<string, any> = {
        apiKey: FLOW_API_KEY,
        token,
    }

    const s = generateSignature(payload)
    payload.s = s

    const response = await fetch(
        `${FLOW_API_URL}/payment/getStatus?${new URLSearchParams(payload).toString()}`
    )

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Flow API error: ${error}`)
    }

    return await response.json()
}

/**
 * Validate Flow webhook signature
 */
export function validateWebhookSignature(
    params: Record<string, string>,
    receivedSignature: string
): boolean {
    const { s, ...paramsWithoutSignature } = params
    const calculatedSignature = generateSignature(paramsWithoutSignature)
    return calculatedSignature === receivedSignature
}

/**
 * Flow payment status codes
 */
export const FLOW_STATUS = {
    PENDING: 1,
    PAID: 2,
    REJECTED: 3,
    CANCELLED: 4,
} as const
