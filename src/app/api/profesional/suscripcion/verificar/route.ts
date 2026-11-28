import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMercadoPagoPayment } from '@/lib/mercadopago'
import { applySubscriptionPayment, subscriptionOrderIdFrom } from '@/lib/subscriptionPayments'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({ paymentId: z.string().regex(/^\d{3,20}$/) })

/**
 * Al volver del checkout, el profesional confirma su pago sin esperar al webhook.
 * Consulta el pago a Mercado Pago y lo aplica con la misma lógica (idempotente) de la notificación.
 */
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (session.user.role !== 'PROFESSIONAL') return NextResponse.json({ error: 'Solo para profesionales' }, { status: 403 })

    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Pago no válido' }, { status: 400 })

    const professional = await prisma.professional.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    if (!professional) return NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 })

    try {
        const payment = await getMercadoPagoPayment(parsed.data.paymentId)
        const orderId = subscriptionOrderIdFrom(payment.external_reference)
        const order = orderId ? await prisma.subscriptionOrder.findUnique({ where: { id: orderId }, select: { professionalId: true } }) : null
        // Solo pagos de las propias órdenes
        if (!order || order.professionalId !== professional.id) {
            return NextResponse.json({ error: 'Ese pago no corresponde a tu cuenta' }, { status: 404 })
        }

        const outcome = await applySubscriptionPayment({ ...payment, id: payment.id ?? parsed.data.paymentId })
        return NextResponse.json({ success: true, result: outcome.handled ? outcome.result : outcome.reason })
    } catch (error) {
        console.error('[suscripcion] verificar error:', error)
        return NextResponse.json({ error: 'No pudimos confirmar el pago ahora. Se activará solo cuando Mercado Pago lo notifique.' }, { status: 502 })
    }
}
