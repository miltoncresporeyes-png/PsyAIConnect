import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMercadoPagoPreference, isMercadoPagoConfigured } from '@/lib/mercadopago'
import { PLANS, getEffectiveTier, isPlanTier, quoteSubscription } from '@/lib/plans'

export const dynamic = 'force-dynamic'

async function getProfessional(userId: string) {
    return prisma.professional.findUnique({
        where: { userId },
        select: {
            id: true,
            subscriptionTier: true,
            subscriptionEnds: true,
            subscriptionCancelledAt: true,
            user: { select: { email: true, name: true } },
        },
    })
}

/** Estado de la suscripcion + historial de cobros. */
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (session.user.role !== 'PROFESSIONAL') {
        return NextResponse.json({ error: 'Solo para profesionales' }, { status: 403 })
    }

    const professional = await getProfessional(session.user.id)
    if (!professional) return NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 })

    const tier = getEffectiveTier(professional)
    const orders = await prisma.subscriptionOrder.findMany({
        where: { professionalId: professional.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
            id: true,
            kind: true,
            fromTier: true,
            toTier: true,
            months: true,
            amount: true,
            status: true,
            createdAt: true,
            paidAt: true,
        },
    })

    return NextResponse.json({
        tier,
        storedTier: professional.subscriptionTier,
        ends: professional.subscriptionEnds,
        expired:
            professional.subscriptionTier !== 'STARTER' && tier === 'STARTER',
        cancelledAt: professional.subscriptionCancelledAt,
        paymentsEnabled: isMercadoPagoConfigured(),
        orders,
    })
}

const bodySchema = z.object({
    action: z.enum(['checkout', 'cancel', 'reactivate']),
    tier: z.string().optional(),
    // Solo ciclo mensual (1) o anual (12 meses pagando 10)
    months: z.union([z.literal(1), z.literal(12)]).optional(),
})

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (session.user.role !== 'PROFESSIONAL') {
        return NextResponse.json({ error: 'Solo para profesionales' }, { status: 403 })
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const professional = await getProfessional(session.user.id)
    if (!professional) return NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 })

    const { action } = parsed.data
    const currentTier = getEffectiveTier(professional)

    // Dar de baja la renovacion: el plan sigue activo hasta su fecha de termino.
    if (action === 'cancel') {
        if (currentTier === 'STARTER') {
            return NextResponse.json({ error: 'Tu plan actual no tiene una renovación que cancelar.' }, { status: 400 })
        }
        await prisma.professional.update({
            where: { id: professional.id },
            data: { subscriptionCancelledAt: new Date() },
        })
        return NextResponse.json({
            success: true,
            message: 'Listo: no se renovará tu plan. Mantienes sus beneficios hasta la fecha de término.',
        })
    }

    if (action === 'reactivate') {
        await prisma.professional.update({
            where: { id: professional.id },
            data: { subscriptionCancelledAt: null },
        })
        return NextResponse.json({ success: true, message: 'Tu plan seguirá vigente y podrás renovarlo.' })
    }

    // checkout: renovar o escalar
    const targetTier = parsed.data.tier
    if (!isPlanTier(targetTier) || targetTier === 'STARTER') {
        return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }
    const months = parsed.data.months ?? 1

    if (!isMercadoPagoConfigured()) {
        return NextResponse.json(
            { error: 'Los pagos de suscripción aún no están habilitados. Escríbenos y lo gestionamos contigo.' },
            { status: 503 }
        )
    }

    const quote = quoteSubscription({
        currentTier,
        currentEnds: professional.subscriptionEnds,
        targetTier,
        months,
    })
    if (!quote) {
        return NextResponse.json(
            {
                error:
                    'Para cambiar a un plan menor, cancela la renovación y contrata el nuevo plan cuando termine tu período vigente.',
            },
            { status: 400 }
        )
    }

    const order = await prisma.subscriptionOrder.create({
        data: {
            professionalId: professional.id,
            kind: quote.kind,
            fromTier: currentTier,
            toTier: targetTier,
            months,
            amount: quote.amount,
            credit: quote.credit,
            newEnds: quote.newEnds,
        },
    })

    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    try {
        const preference = await createMercadoPagoPreference({
            title: `Suscripción PsyDoctor ${PLANS[targetTier].shortName} (${months === 12 ? '12 meses, pagas 10' : '1 mes'})`,
            unitPrice: quote.amount,
            payerEmail: professional.user.email,
            payerName: professional.user.name || 'Profesional',
            externalReference: `sub_${order.id}`,
            backUrls: {
                success: `${baseUrl}/dashboard/suscripcion?pago=ok`,
                failure: `${baseUrl}/dashboard/suscripcion?pago=error`,
                pending: `${baseUrl}/dashboard/suscripcion?pago=pendiente`,
            },
            notificationUrl: `${baseUrl}/api/pagos/mercadopago/webhook`,
        })

        await prisma.subscriptionOrder.update({
            where: { id: order.id },
            data: { preferenceId: preference.id },
        })

        const useSandbox = process.env.NODE_ENV !== 'production' && preference.sandboxInitPoint
        return NextResponse.json({
            success: true,
            checkoutUrl: useSandbox ? preference.sandboxInitPoint : preference.initPoint,
            amount: quote.amount,
        })
    } catch (error) {
        console.error('[suscripcion] Error creando preferencia de Mercado Pago:', error)
        await prisma.subscriptionOrder.update({ where: { id: order.id }, data: { status: 'FAILED' } })
        return NextResponse.json({ error: 'No pudimos iniciar el pago. Inténtalo de nuevo.' }, { status: 502 })
    }
}
