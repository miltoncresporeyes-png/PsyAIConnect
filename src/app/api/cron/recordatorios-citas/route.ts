import { NextRequest, NextResponse } from 'next/server'
import { runReminderCycle } from '@/lib/appointmentPolicy'

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
        return NextResponse.json({ ok: true, ...result })
    } catch (error) {
        console.error('Reminder cycle error:', error)
        return NextResponse.json({ error: 'Error ejecutando recordatorios' }, { status: 500 })
    }
}
