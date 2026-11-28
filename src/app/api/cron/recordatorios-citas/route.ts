import { NextRequest, NextResponse } from 'next/server'
import { runReminderCycle } from '@/lib/appointmentPolicy'
import { runPlanExpiryReminders } from '@/lib/subscriptionReminders'
import { runReviewInvites } from '@/lib/reviewInvites'
import { recomputeAllReputations } from '@/lib/reputationSync'
import { recordHeartbeat } from '@/lib/admin/heartbeat'

export const dynamic = 'force-dynamic'

/**
 * Cron (cada 10-15 min): recordatorios 24h y 2h, liberacion de horarios sin
 * reconfirmar y caducidad de solicitudes sin respuesta del profesional.
 * Autorizacion: header `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    if (process.env.NODE_ENV === 'production' && !cronSecret) {
        return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 })
    }
    if (cronSecret && req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        const result = await runReminderCycle()
        // Un fallo de este aviso no debe frenar los recordatorios de citas
        // Opiniones: invitaciones y recálculo de niveles (un fallo no frena los recordatorios)
        const reviews = await (async () => {
            try {
                return { ...(await runReviewInvites()), recomputed: await recomputeAllReputations() }
            } catch (err) {
                console.error('Review cycle error:', err)
                return { invited: 0, reminded: 0, recomputed: 0, failed: 1 }
            }
        })()
        const planReminders = await runPlanExpiryReminders().catch((err) => {
            console.error('Plan expiry reminders error:', err)
            return { sent: 0, failed: 1 }
        })
        await recordHeartbeat('cron-recordatorios', 'ok', { result: { ...result, planReminders, reviews } })
        return NextResponse.json({ ok: true, ...result, planReminders, reviews })
    } catch (error) {
        console.error('Reminder cycle error:', error)
        await recordHeartbeat('cron-recordatorios', 'error', {
            error: error instanceof Error ? error.message : String(error),
        })
        return NextResponse.json({ error: 'Error ejecutando recordatorios' }, { status: 500 })
    }
}
