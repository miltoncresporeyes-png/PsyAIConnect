import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { baseUrl, layout } from '@/lib/appointmentPolicy'
import { formatCLP } from '@/lib/format'
import { PLANS } from '@/lib/plans'

/** Subconjunto del pago de Mercado Pago que usamos (API /v1/payments). */
export interface MercadoPagoPaymentLike {
    id?: number | string
    status?: string
    transaction_amount?: number
    external_reference?: string | null
    currency_id?: string
}

export type SubscriptionPaymentOutcome =
    | { handled: false; reason: 'not_subscription' | 'order_not_found' | 'amount_mismatch' | 'currency_mismatch' }
    | { handled: true; orderId: string; result: 'activated' | 'already_paid' | 'failed' | 'pending' | 'refunded' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function subscriptionOrderIdFrom(externalReference: string | null | undefined): string | null {
    return typeof externalReference === 'string' && externalReference.startsWith('sub_') ? externalReference.slice(4) : null
}

/**
 * Aplica un pago de Mercado Pago a su orden de suscripción. Idempotente: la webhook y la
 * verificación al volver del checkout pueden llegar en cualquier orden o repetirse.
 * Nunca confía en el cliente: el monto y la moneda deben coincidir con la orden.
 */
export async function applySubscriptionPayment(payment: MercadoPagoPaymentLike): Promise<SubscriptionPaymentOutcome> {
    const orderId = subscriptionOrderIdFrom(payment.external_reference)
    if (!orderId) return { handled: false, reason: 'not_subscription' }

    const order = await prisma.subscriptionOrder.findUnique({
        where: { id: orderId },
        include: { professional: { select: { id: true, user: { select: { email: true, name: true } } } } },
    })
    if (!order) return { handled: false, reason: 'order_not_found' }

    const paymentId = String(payment.id ?? '')
    const status = payment.status ?? ''

    if (status === 'approved') {
        if (Math.round(payment.transaction_amount ?? -1) !== order.amount) return { handled: false, reason: 'amount_mismatch' }
        if (payment.currency_id && payment.currency_id !== 'CLP') return { handled: false, reason: 'currency_mismatch' }
        if (order.status === 'PAID') return { handled: true, orderId, result: 'already_paid' }

        // Solo una de las llamadas concurrentes logra pasar la orden a PAID
        const activated = await prisma.$transaction(async (tx) => {
            const claimed = await tx.subscriptionOrder.updateMany({
                where: { id: order.id, status: { not: 'PAID' } },
                data: { status: 'PAID', paidAt: new Date(), externalPaymentId: paymentId || null },
            })
            if (claimed.count === 0) return false
            await tx.professional.update({
                where: { id: order.professionalId },
                data: { subscriptionTier: order.toTier, subscriptionEnds: order.newEnds, subscriptionCancelledAt: null },
            })
            return true
        })
        if (!activated) return { handled: true, orderId, result: 'already_paid' }

        await sendReceipt(order).catch((e) => console.error('[mercadopago] No se pudo enviar el comprobante:', e))
        return { handled: true, orderId, result: 'activated' }
    }

    if (status === 'rejected' || status === 'cancelled') {
        // Solo si la orden sigue pendiente: un pago aprobado nunca se revierte por un rechazo posterior
        await prisma.subscriptionOrder.updateMany({ where: { id: order.id, status: 'PENDING' }, data: { status: status === 'cancelled' ? 'CANCELLED' : 'FAILED' } })
        return { handled: true, orderId, result: 'failed' }
    }

    if (status === 'refunded' || status === 'charged_back') {
        // No se quita el plan automáticamente: lo revisa una persona
        await alertAdmin(order.id, status, paymentId).catch((e) => console.error('[mercadopago] No se pudo avisar al admin:', e))
        return { handled: true, orderId, result: 'refunded' }
    }

    return { handled: true, orderId, result: 'pending' }
}

async function sendReceipt(order: {
    amount: number
    months: number
    toTier: keyof typeof PLANS
    newEnds: Date
    professional: { user: { email: string; name: string | null } }
}) {
    const plan = PLANS[order.toTier]
    const ends = order.newEnds.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' })
    await sendEmail({
        to: order.professional.user.email,
        subject: 'Recibimos tu pago - PsyDoctor',
        html: layout(
            'Tu plan está activo',
            `<p>Hola ${esc(order.professional.user.name || '')}, recibimos tu pago de <strong>${formatCLP(order.amount)}</strong> por el plan <strong>${esc(plan.shortName)}</strong> (${order.months === 12 ? '12 meses' : '1 mes'}).</p>
<p>Tu plan está activo hasta el <strong>${esc(ends)}</strong>. Te avisaremos una semana antes de que venza.</p>
<p style="font-size:12px;color:#6b7280">Este correo es un comprobante de pago de tu suscripción. Si necesitas boleta o factura, escríbenos desde Soporte.</p>`,
            'Ver mi suscripción',
            `${baseUrl()}/dashboard/suscripcion`
        ),
    })
}

async function alertAdmin(orderId: string, status: string, paymentId: string) {
    await sendEmail({
        to: process.env.ADMIN_ALERT_EMAIL || 'contacto@psydoctor.cl',
        subject: `Mercado Pago: ${status === 'refunded' ? 'reembolso' : 'contracargo'} en una suscripción`,
        html: layout(
            'Revisión manual de una suscripción',
            `<p>Mercado Pago informó <strong>${esc(status)}</strong> para el pago <code>${esc(paymentId)}</code> de la orden <code>${esc(orderId)}</code>.</p>
<p>El plan del profesional <strong>no</strong> se modificó automáticamente. Revisa el caso y decide si corresponde quitar el plan.</p>`,
            'Ir a Suscripciones',
            `${baseUrl()}/admin/suscripciones`
        ),
    })
}
