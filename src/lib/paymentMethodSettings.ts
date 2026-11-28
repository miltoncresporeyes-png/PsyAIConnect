import { prisma } from '@/lib/prisma'

/** IDs de medios de pago que el administrador dejó inactivos. Ante un error de BD, no oculta nada. */
export async function getDisabledPaymentMethodIds(): Promise<Set<string>> {
    try {
        const rows = await prisma.paymentMethodSetting.findMany({ where: { enabled: false }, select: { methodId: true } })
        return new Set(rows.map((r) => r.methodId))
    } catch {
        return new Set()
    }
}
