/**
 * Payment Service for PsyConnect
 * Integration with Flow.cl - Chilean payment gateway
 * 
 * Flow.cl Documentation: https://www.flow.cl/docs/api.html
 */

import crypto from 'crypto'

// Payment status enum matching our Prisma schema
export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED',
}

// Flow response types
interface FlowCreatePaymentResponse {
    url: string
    token: string
    flowOrder: string
}

interface FlowPaymentStatusResponse {
    flowOrder: string
    commerceOrder: string
    status: number // 1=Pending, 2=Completed, 3=Rejected, 4=Cancelled
    amount: number
    payer: string | null
    paymentData?: {
        date: string
        media: string
        conversionDate?: string
        conversionRate?: number
        amount: number
        currency: string
    }
}

// Commission rates by subscription tier (as percentage)
const COMMISSION_RATES = {
    STARTER: 0.12,  // 12%
    PRO: 0.08,      // 8%
    PREMIUM: 0.05,  // 5%
} as const

interface CreatePaymentParams {
    appointmentId: string
    amount: number
    patientEmail: string
    patientName: string
    professionalName: string
    subscriptionTier: keyof typeof COMMISSION_RATES
}

interface PaymentResult {
    success: boolean
    paymentUrl?: string
    flowToken?: string
    flowOrderId?: string
    error?: string
}

/**
 * Generate HMAC signature for Flow API
 */
function generateFlowSignature(params: Record<string, string>): string {
    const secretKey = process.env.FLOW_SECRET_KEY
    if (!secretKey) {
        throw new Error('FLOW_SECRET_KEY not configured')
    }

    // Sort keys alphabetically and concatenate
    const sortedKeys = Object.keys(params).sort()
    const signatureString = sortedKeys
        .map(key => `${key}${params[key]}`)
        .join('')

    // Generate HMAC-SHA256
    return crypto
        .createHmac('sha256', secretKey)
        .update(signatureString)
        .digest('hex')
}

/**
 * Calculate commission based on subscription tier
 */
export function calculateCommission(
    amount: number,
    subscriptionTier: keyof typeof COMMISSION_RATES
): { commission: number; netAmount: number } {
    const rate = COMMISSION_RATES[subscriptionTier]
    const commission = Math.round(amount * rate)
    const netAmount = amount - commission

    return { commission, netAmount }
}

/**
 * Create a payment with Flow.cl
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    if (process.env.ENABLE_PAYMENTS === 'false') {
        return {
            success: false,
            error: 'Los pagos en línea se encuentran temporalmente en mantenimiento preventivo. Intenta más tarde.',
        }
    }

    const {
        appointmentId,
        amount,
        patientEmail,
        patientName,
        professionalName,
        subscriptionTier
    } = params

    // Sin API key solo se simula el pago fuera de producción.
    // En producción hay que fallar: un pago "simulado" no cobra a nadie.
    if (!process.env.FLOW_API_KEY) {
        if (process.env.NODE_ENV === 'production') {
            console.error('💳 [PAYMENT SERVICE] FLOW_API_KEY no configurada en producción')
            return {
                success: false,
                error: 'Pagos no configurados. Contacta al soporte.',
            }
        }

        console.log('💳 [PAYMENT SERVICE - DEV MODE]')
        console.log('Creating simulated payment:', {
            appointmentId,
            amount,
            patientEmail,
        })

        return {
            success: true,
            paymentUrl: `http://localhost:3000/pago/simulado?appointmentId=${appointmentId}`,
            flowToken: 'dev-token-' + Date.now(),
            flowOrderId: 'dev-order-' + Date.now(),
        }
    }

    try {
        const apiUrl = process.env.FLOW_API_URL || 'https://www.flow.cl/api'
        const returnUrl = `${process.env.NEXTAUTH_URL}/pago/confirmacion`
        const confirmUrl = `${process.env.NEXTAUTH_URL}/api/pagos/webhook`

        const { commission, netAmount } = calculateCommission(amount, subscriptionTier)

        const flowParams: Record<string, string> = {
            apiKey: process.env.FLOW_API_KEY,
            commerceOrder: appointmentId,
            subject: `Cita con ${professionalName}`,
            currency: 'CLP',
            amount: amount.toString(),
            email: patientEmail,
            paymentMethod: '9', // All methods
            urlConfirmation: confirmUrl,
            urlReturn: returnUrl,
        }

        // Add signature
        flowParams.s = generateFlowSignature(flowParams)

        // Call Flow API
        const response = await fetch(`${apiUrl}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(flowParams),
        })

        const data = await response.json() as FlowCreatePaymentResponse

        if (!response.ok) {
            throw new Error(data.toString() || 'Error creating payment')
        }

        return {
            success: true,
            paymentUrl: `${data.url}?token=${data.token}`,
            flowToken: data.token,
            flowOrderId: data.flowOrder,
        }
    } catch (error) {
        console.error('Payment creation error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error creating payment',
        }
    }
}

/**
 * Get payment status from Flow.cl
 */
export async function getPaymentStatus(flowToken: string): Promise<FlowPaymentStatusResponse | null> {
    if (!process.env.FLOW_API_KEY) {
        // Nunca reportar un pago como completado sin gateway en producción
        if (process.env.NODE_ENV === 'production') {
            console.error('💳 [PAYMENT SERVICE] FLOW_API_KEY no configurada en producción')
            return null
        }

        console.log('💳 [PAYMENT SERVICE - DEV MODE] Getting status for:', flowToken)
        return {
            flowOrder: flowToken,
            commerceOrder: 'dev-appointment-id',
            status: 2, // Completed
            amount: 50000,
            payer: 'test@example.com',
        }
    }

    try {
        const apiUrl = process.env.FLOW_API_URL || 'https://www.flow.cl/api'

        const params: Record<string, string> = {
            apiKey: process.env.FLOW_API_KEY,
            token: flowToken,
        }
        params.s = generateFlowSignature(params)

        const response = await fetch(`${apiUrl}/payment/getStatus?${new URLSearchParams(params)}`)

        if (!response.ok) {
            throw new Error('Error getting payment status')
        }

        return await response.json()
    } catch (error) {
        console.error('Payment status error:', error)
        return null
    }
}
