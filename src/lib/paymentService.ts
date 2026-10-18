import { prisma } from '@/lib/prisma'
import { createPaymentOrder as createFlowOrder } from '@/lib/flow'
import { createMercadoPagoPreference, isMercadoPagoConfigured } from '@/lib/mercadopago'
import { createWebpayTransaction } from '@/lib/transbank'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal'
import { calculateCommission } from '@/lib/payment'
import { PaymentProvider } from '@/generated/client'

export interface CreatePaymentSessionParams {
    appointmentId: string
    provider: PaymentProvider
    baseUrl: string
    patientEmail: string
    patientName: string
    professionalName: string
    amount: number
    subscriptionTier: 'STARTER' | 'PRO' | 'PREMIUM'
}

export interface PaymentSessionResult {
    success: boolean
    paymentId: string
    paymentUrl: string
    provider: PaymentProvider
    externalOrderId?: string
    externalToken?: string
    error?: string
}

export async function createMultiProviderPaymentSession(
    params: CreatePaymentSessionParams
): Promise<PaymentSessionResult> {
    const {
        appointmentId,
        provider,
        baseUrl,
        patientEmail,
        patientName,
        professionalName,
        amount,
        subscriptionTier,
    } = params

    // 1. Calculate platform commission
    const { commission, netAmount } = calculateCommission(amount, subscriptionTier)

    // 2. Upsert Payment row with target provider
    const payment = await prisma.payment.upsert({
        where: { appointmentId },
        create: {
            appointmentId,
            amount,
            commission,
            netAmount,
            status: 'PENDING',
            provider,
        },
        update: {
            amount,
            commission,
            netAmount,
            status: 'PENDING',
            provider,
        },
    })

    try {
        let paymentUrl = ''
        let externalOrderId: string | undefined
        let externalToken: string | undefined

        switch (provider) {
            case 'MERCADOPAGO': {
                if (!isMercadoPagoConfigured()) {
                    throw new Error('Mercado Pago no está configurado con MERCADOPAGO_ACCESS_TOKEN.')
                }
                const pref = await createMercadoPagoPreference({
                    title: `Sesión con ${professionalName}`,
                    unitPrice: amount,
                    payerEmail: patientEmail,
                    payerName: patientName,
                    externalReference: appointmentId,
                    backUrls: {
                        success: `${baseUrl}/cita/${appointmentId}/exito?provider=MERCADOPAGO`,
                        failure: `${baseUrl}/cita/${appointmentId}/confirmar?error=payment_failed`,
                        pending: `${baseUrl}/cita/${appointmentId}/exito?provider=MERCADOPAGO&status=pending`,
                    },
                    notificationUrl: `${baseUrl}/api/pagos/mercadopago/webhook`,
                })
                paymentUrl = pref.initPoint
                externalToken = pref.id
                break
            }

            case 'TRANSBANK': {
                const returnUrl = `${baseUrl}/api/pagos/transbank/commit?appointmentId=${appointmentId}`
                const buyOrder = appointmentId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 26)
                const sessionId = `sess-${Date.now()}`

                const tbk = await createWebpayTransaction({
                    buyOrder,
                    sessionId,
                    amount,
                    returnUrl,
                })
                paymentUrl = `${tbk.url}?token_ws=${tbk.token}`
                externalToken = tbk.token
                externalOrderId = buyOrder
                break
            }

            case 'PAYPAL': {
                if (!isPayPalConfigured()) {
                    throw new Error('PayPal no está configurado con PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.')
                }
                const order = await createPayPalOrder({
                    appointmentId,
                    amountClp: amount,
                    description: `Sesión con ${professionalName}`,
                    returnUrl: `${baseUrl}/api/pagos/paypal/capture?appointmentId=${appointmentId}`,
                    cancelUrl: `${baseUrl}/cita/${appointmentId}/confirmar?error=paypal_cancelled`,
                })
                paymentUrl = order.approveUrl
                externalOrderId = order.orderId
                break
            }

            case 'FLOW':
            default: {
                const flowOrder = await createFlowOrder({
                    commerceOrder: appointmentId,
                    subject: `Sesión con ${professionalName}`,
                    amount,
                    email: patientEmail,
                    urlConfirmation: `${baseUrl}/api/pagos/webhook`,
                    urlReturn: `${baseUrl}/cita/${appointmentId}/exito`,
                    optional: JSON.stringify({ appointmentId }),
                })
                paymentUrl = flowOrder.url
                externalToken = flowOrder.token
                externalOrderId = flowOrder.flowOrder.toString()
                break
            }
        }

        // 3. Update payment record with gateway references
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                externalOrderId: externalOrderId || null,
                externalToken: externalToken || null,
                flowToken: provider === 'FLOW' ? externalToken : null,
                flowOrderId: provider === 'FLOW' ? externalOrderId : null,
            },
        })

        return {
            success: true,
            paymentId: payment.id,
            paymentUrl,
            provider,
            externalOrderId,
            externalToken,
        }
    } catch (error: any) {
        console.error(`Error procesando sesión de pago con ${provider}:`, error)
        return {
            success: false,
            paymentId: payment.id,
            paymentUrl: '',
            provider,
            error: error.message || 'Error al iniciar la sesión de pago',
        }
    }
}
