import { prisma } from '@/lib/prisma'
import { sendPlanExpiringEmail } from '@/lib/email'

const DAY = 24 * 60 * 60 * 1000
export const PLAN_REMINDER_DAYS = 7

const PLAN_LABELS: Record<string, string> = { PRO: 'Pro', PREMIUM: 'Premium' }

/**
 * Avisa por correo a los profesionales con plan de pago que vence dentro de
 * PLAN_REMINDER_DAYS dias. Se envia una sola vez por fecha de vencimiento
 * (renewalReminderFor); si renuevan y cambia la fecha, se vuelve a armar.
 */
export async function runPlanExpiryReminders(now = new Date()): Promise<{ sent: number; failed: number }> {
    const horizon = new Date(now.getTime() + PLAN_REMINDER_DAYS * DAY)
    const candidates = await prisma.professional.findMany({
        where: {
            isActive: true,
            subscriptionTier: { not: 'STARTER' },
            subscriptionEnds: { gt: now, lte: horizon },
        },
        select: {
            id: true,
            subscriptionTier: true,
            subscriptionEnds: true,
            subscriptionCancelledAt: true,
            renewalReminderFor: true,
            user: { select: { name: true, email: true, isActive: true } },
        },
    })

    let sent = 0
    let failed = 0
    for (const p of candidates) {
        const ends = p.subscriptionEnds
        if (!ends || !p.user?.email || !p.user.isActive) continue
        if (p.renewalReminderFor && p.renewalReminderFor.getTime() === ends.getTime()) continue

        const res = await sendPlanExpiringEmail(
            p.user.email,
            p.user.name || '',
            PLAN_LABELS[p.subscriptionTier] ?? p.subscriptionTier,
            ends,
            Boolean(p.subscriptionCancelledAt)
        ).catch(() => ({ success: false }))

        if (res.success) {
            await prisma.professional.update({ where: { id: p.id }, data: { renewalReminderFor: ends } })
            sent++
        } else {
            failed++ // se reintenta en el siguiente ciclo
        }
    }
    return { sent, failed }
}
