import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logAdminAction } from '@/lib/adminLogs'
import { PAYMENT_METHODS, isPaymentMethodId } from '@/lib/paymentMethods'

export const dynamic = 'force-dynamic'

/** Catálogo de medios de pago con su estado global y cuántos profesionales lo usan. */
export async function GET() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error
    try {
        const [settings, professionals] = await Promise.all([
            prisma.paymentMethodSetting.findMany(),
            prisma.professional.findMany({ select: { acceptedPaymentMethods: true } }),
        ])
        const state = new Map(settings.map((s) => [s.methodId, s]))
        const usage = new Map<string, number>()
        for (const p of professionals) for (const m of Array.from(new Set(p.acceptedPaymentMethods))) usage.set(m, (usage.get(m) ?? 0) + 1)

        return NextResponse.json({
            items: PAYMENT_METHODS.map((m) => ({
                id: m.id,
                label: m.label,
                hint: m.hint,
                enabled: state.get(m.id)?.enabled ?? true,
                updatedAt: state.get(m.id)?.updatedAt ?? null,
                professionals: usage.get(m.id) ?? 0,
            })),
        })
    } catch (error) {
        console.error('[admin/medios-de-pago] GET error:', error)
        return NextResponse.json({ error: 'No se pudieron cargar los medios de pago' }, { status: 500 })
    }
}

const patchSchema = z.object({
    methodId: z.string().refine(isPaymentMethodId, 'Medio de pago no válido'),
    enabled: z.boolean(),
})

export async function PATCH(request: Request) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const parsed = patchSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    const { methodId, enabled } = parsed.data

    try {
        if (!enabled) {
            const otherDisabled = await prisma.paymentMethodSetting.count({ where: { enabled: false, methodId: { not: methodId } } })
            if (otherDisabled >= PAYMENT_METHODS.length - 1) {
                return NextResponse.json({ error: 'Debe quedar al menos un medio de pago activo' }, { status: 400 })
            }
        }
        await prisma.paymentMethodSetting.upsert({
            where: { methodId },
            create: { methodId, enabled, updatedBy: guard.adminId },
            update: { enabled, updatedBy: guard.adminId },
        })
        await logAdminAction({
            adminId: guard.adminId,
            adminName: guard.adminName ?? undefined,
            action: 'UPDATE_PAYMENT_METHOD',
            targetType: 'SYSTEM',
            targetId: methodId,
            targetName: PAYMENT_METHODS.find((m) => m.id === methodId)?.label ?? undefined,
            details: { enabled },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[admin/medios-de-pago] PATCH error:', error)
        return NextResponse.json({ error: 'No se pudo guardar el cambio' }, { status: 500 })
    }
}
