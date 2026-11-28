import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMercadoPagoPayment } from '@/lib/mercadopago'
import { sendAppointmentConfirmationEmail } from '@/lib/email'
import { verifyMercadoPagoSignature } from '@/lib/mercadopagoWebhook'
import { applySubscriptionPayment, subscriptionOrderIdFrom } from '@/lib/subscriptionPayments'

export const dynamic = 'force-dynamic'

/**
 * Mercado Pago IPN / Webhook Handler
 * Documentation: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const topic = searchParams.get('topic') || searchParams.get('type')
        const id = searchParams.get('id') || searchParams.get('data.id')

        let body: any = {}
        try {
            body = await request.json()
        } catch {
            // body may be empty on simple query string notifications
        }

        const paymentId = id || body?.data?.id || (body?.type === 'payment' ? body?.data?.id : null)

        if (!paymentId) {
            return NextResponse.json({ received: true })
        }

        // Firma de la notificación (secreto del webhook). Si no hay secreto se procesa igual porque el
        // estado del pago siempre se consulta a la API de Mercado Pago, pero se deja advertencia.
        const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
        if (webhookSecret) {
            const valid = verifyMercadoPagoSignature({
                xSignature: request.headers.get('x-signature'),
                xRequestId: request.headers.get('x-request-id'),
                dataId: searchParams.get('data.id') || (body?.data?.id != null ? String(body.data.id) : null),
                secret: webhookSecret,
            })
            if (!valid) {
                console.error('[mercadopago] Firma de webhook inválida')
                return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
            }
        } else if (process.env.NODE_ENV === 'production') {
            console.warn('[mercadopago] MERCADOPAGO_WEBHOOK_SECRET no está definido: las notificaciones no se validan por firma')
        }

        // Consult payment details directly from Mercado Pago API
        const mpPayment = await getMercadoPagoPayment(paymentId.toString())

        // Cobro de suscripción profesional (external_reference = "sub_<orderId>"): cualquier estado
        if (subscriptionOrderIdFrom(mpPayment.external_reference)) {
            const outcome = await applySubscriptionPayment({ ...mpPayment, id: mpPayment.id ?? paymentId })
            if (!outcome.handled) console.warn('[mercadopago] Pago de suscripción no aplicado:', outcome.reason, paymentId)
            return NextResponse.json({ status: 'ok' })
        }

        if (mpPayment.status === 'approved') {
            const externalReference = mpPayment.external_reference // appointmentId

            if (externalReference) {
                const payment = await prisma.payment.findFirst({
                    where: { appointmentId: externalReference },
                    include: {
                        appointment: {
                            include: {
                                patient: true,
                                professional: { include: { user: true } },
                            },
                        },
                    },
                })

                if (payment && payment.status !== 'COMPLETED') {
                    await prisma.$transaction([
                        prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: 'COMPLETED',
                                paidAt: new Date(),
                                externalOrderId: paymentId.toString(),
                            },
                        }),
                        prisma.appointment.update({
                            where: { id: payment.appointmentId },
                            data: { status: 'CONFIRMED' },
                        }),
                    ])

                    try {
                        const scheduledDate = new Date(payment.appointment.scheduledAt)
                        const dateStr = scheduledDate.toLocaleDateString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })
                        const timeStr = scheduledDate.toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        const modality = payment.appointment.modality === 'ONLINE' ? 'Videollamada' : 'Presencial'

                        await sendAppointmentConfirmationEmail(
                            payment.appointment.patient.email,
                            payment.appointment.patient.name || 'Paciente',
                            payment.appointment.professional.user.name || 'Profesional',
                            dateStr,
                            timeStr,
                            modality,
                            payment.appointment.videoLink || undefined
                        )
                    } catch (emailErr) {
                        console.error('Error enviando email tras pago Mercado Pago:', emailErr)
                    }
                }
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('Error en webhook de Mercado Pago:', error)
        // 500: Mercado Pago reintenta con espera creciente (el procesamiento es idempotente)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
