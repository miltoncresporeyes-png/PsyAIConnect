import { prisma } from '@/lib/prisma'
import { getConnectionStatus } from '@/lib/googleMeet'
import { isWaitlistMode } from '@/lib/waitlistGuard'
import { cronStatus, type CronStatus } from '@/lib/admin/series'
import { getHeartbeat } from '@/lib/admin/heartbeat'

export interface ConfigCheck {
    key: string
    label: string
    ok: boolean
    detail: string
}

export interface SystemHealth {
    database: { ok: boolean; latencyMs: number | null }
    cron: {
        status: CronStatus
        lastRunAt: string | null
        lastStatus: string | null
        lastResult: unknown
        lastError: string | null
        runCount: number
        expectedEveryMin: number
    }
    meet: { configured: boolean; connected: boolean; accountEmail: string | null; connectedAt: string | null }
    invoices: { pending: number; failed: number; manualReview: number }
    config: ConfigCheck[]
    waitlistMode: boolean
}

/** Revisa la configuracion SIN exponer valores secretos: solo si existen y si son validos. */
export function checkConfig(env: NodeJS.ProcessEnv = process.env): ConfigCheck[] {
    const baseUrl = env.NEXTAUTH_URL || ''
    let host = ''
    try {
        host = baseUrl ? new URL(baseUrl).host : ''
    } catch {
        host = ''
    }
    // Se valida sobre el entorno recibido (no sobre process.env) para poder probarlo y no mezclar fuentes
    const encryptionKey = env.ENCRYPTION_KEY || ''
    const encryptionOk = /^[0-9a-fA-F]{64}$/.test(encryptionKey)
    const mercadoPagoOk = Boolean(env.MERCADOPAGO_ACCESS_TOKEN)

    return [
        {
            key: 'NEXTAUTH_URL',
            label: 'Dominio de la aplicación (NEXTAUTH_URL)',
            ok: baseUrl.startsWith('https://') || baseUrl.startsWith('http://localhost'),
            detail: host ? `Dominio: ${host}` : 'No está definida',
        },
        {
            key: 'NEXTAUTH_SECRET',
            label: 'Secreto de sesión (NEXTAUTH_SECRET)',
            ok: Boolean(env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length >= 32),
            detail: env.NEXTAUTH_SECRET ? 'Definido' : 'No está definido',
        },
        {
            key: 'ENCRYPTION_KEY',
            label: 'Cifrado de datos clínicos (ENCRYPTION_KEY)',
            ok: encryptionOk,
            detail: encryptionOk ? 'Válida' : encryptionKey ? 'Debe tener 64 caracteres hexadecimales' : 'No está definida',
        },
        {
            key: 'RESEND_API_KEY',
            label: 'Correo transaccional (RESEND_API_KEY)',
            ok: Boolean(env.RESEND_API_KEY && !env.RESEND_API_KEY.startsWith('re_...') && env.RESEND_API_KEY.trim() !== ''),
            detail: env.RESEND_API_KEY ? 'Definida' : 'No está definida: los correos no se envían',
        },
        {
            key: 'GOOGLE_MEET',
            label: 'Credenciales de Google Meet',
            ok: Boolean(env.GOOGLE_MEET_CLIENT_ID && env.GOOGLE_MEET_CLIENT_SECRET),
            detail: env.GOOGLE_MEET_CLIENT_ID && env.GOOGLE_MEET_CLIENT_SECRET ? 'Definidas' : 'Faltan GOOGLE_MEET_CLIENT_ID/SECRET',
        },
        {
            key: 'CRON_SECRET',
            label: 'Clave del cron (CRON_SECRET)',
            ok: Boolean(env.CRON_SECRET && env.CRON_SECRET.length >= 24),
            detail: env.CRON_SECRET ? 'Definida' : 'No está definida: el cron responde error 500 en producción',
        },
        {
            key: 'MERCADOPAGO',
            label: 'Pagos de suscripción (Mercado Pago)',
            ok: mercadoPagoOk,
            detail: mercadoPagoOk ? 'Configurado' : 'Sin configurar: no se pueden cobrar suscripciones',
        },
        {
            key: 'MERCADOPAGO_WEBHOOK_SECRET',
            label: 'Firma de notificaciones de Mercado Pago',
            ok: Boolean(env.MERCADOPAGO_WEBHOOK_SECRET),
            detail: env.MERCADOPAGO_WEBHOOK_SECRET
                ? 'Definida: las notificaciones se validan por firma'
                : 'Sin definir: las notificaciones se procesan sin validar firma (el estado del pago igual se consulta a Mercado Pago)',
        },
    ]
}

export async function getSystemHealth(now: Date = new Date()): Promise<SystemHealth> {
    // Base de datos: una consulta trivial con su latencia
    let database: SystemHealth['database'] = { ok: false, latencyMs: null }
    try {
        const t0 = Date.now()
        await prisma.$queryRaw`SELECT 1`
        database = { ok: true, latencyMs: Date.now() - t0 }
    } catch {
        database = { ok: false, latencyMs: null }
    }

    const [heartbeat, meet, invoiceGroups] = await Promise.all([
        getHeartbeat('cron-recordatorios').catch(() => null),
        getConnectionStatus().catch(() => ({ configured: false, connected: false, accountEmail: null, connectedAt: null })),
        prisma.invoiceQueue.groupBy({ by: ['status'], _count: { _all: true } }).catch(() => []),
    ])

    const invoiceCount = (status: string) =>
        invoiceGroups.find((g) => g.status === status)?._count._all ?? 0

    return {
        database,
        cron: {
            status: cronStatus(heartbeat, now),
            lastRunAt: heartbeat?.lastRunAt.toISOString() ?? null,
            lastStatus: heartbeat?.lastStatus ?? null,
            lastResult: heartbeat?.lastResult ?? null,
            lastError: heartbeat?.lastError ?? null,
            runCount: heartbeat?.runCount ?? 0,
            expectedEveryMin: 10,
        },
        meet: {
            configured: meet.configured,
            connected: meet.connected,
            accountEmail: meet.accountEmail,
            connectedAt: meet.connectedAt ? new Date(meet.connectedAt).toISOString() : null,
        },
        invoices: {
            pending: invoiceCount('PENDING') + invoiceCount('PROCESSING'),
            failed: invoiceCount('FAILED'),
            manualReview: invoiceCount('MANUAL_REVIEW'),
        },
        config: checkConfig(),
        waitlistMode: isWaitlistMode(),
    }
}
