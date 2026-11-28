'use client'

import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pill, Spinner, type PillTone } from '@/components/admin/ui'
import { formatDateTime, formatNumber, timeAgo } from '@/components/admin/format'
import type { SystemHealth } from '@/lib/admin/health'

type Response = SystemHealth & {
    build: { environment: string | null; commit: string | null; branch: string | null; node: string }
}

const CRON_TEXT: Record<string, { tone: PillTone; text: string; help: string }> = {
    ok: { tone: 'ok', text: 'Funcionando', help: 'La última ejecución fue reciente y terminó bien.' },
    late: { tone: 'bad', text: 'Atrasado', help: 'Lleva más de 25 minutos sin ejecutarse. Revisa GitHub Actions (cron-recordatorios) y los secretos APP_URL / CRON_SECRET.' },
    error: { tone: 'bad', text: 'Con error', help: 'La última ejecución falló. Revisa el detalle y los registros de la aplicación.' },
    never: { tone: 'warn', text: 'Sin ejecuciones', help: 'Aún no hay latidos. Lanza el flujo manualmente desde GitHub Actions ("Run workflow").' },
}

export default function AdminSistemaPage() {
    const { data, error, loading, reload } = useAdminData<Response>('/api/admin/sistema')
    if (loading && !data) return <Spinner />
    if (error && !data) return <ErrorBox message={error} />
    if (!data) return null

    const cron = CRON_TEXT[data.cron.status]
    const result = data.cron.lastResult as { result?: Record<string, number> } | null
    const counters = result?.result ?? null

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Salud del sistema</h1>
                    <p className="text-sm text-slate-500">
                        Estado de los servicios que sostienen las reservas y las sesiones. Nunca se muestran valores secretos.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={reload}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 min-h-[44px] sm:min-h-0 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden /> Revisar de nuevo
                </button>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Base de datos">
                    <div className="flex items-center gap-3">
                        <Pill tone={data.database.ok ? 'ok' : 'bad'}>{data.database.ok ? 'Conectada' : 'Sin respuesta'}</Pill>
                        {data.database.latencyMs != null && <span className="text-sm text-slate-600">Respuesta en {data.database.latencyMs} ms</span>}
                    </div>
                </Card>

                <Card title="Cron de recordatorios" subtitle={`Debería ejecutarse cada ${data.cron.expectedEveryMin} minutos`}>
                    <div className="flex flex-wrap items-center gap-3">
                        <Pill tone={cron.tone}>{cron.text}</Pill>
                        <span className="text-sm text-slate-600">Última ejecución: {timeAgo(data.cron.lastRunAt)}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{cron.help}</p>
                    {data.cron.lastRunAt && (
                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(data.cron.lastRunAt)} · {formatNumber(data.cron.runCount)} ejecuciones registradas</p>
                    )}
                    {counters && (
                        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-4">
                            <div><dt className="text-slate-500">Recordatorios 24 h</dt><dd className="font-semibold text-slate-900">{counters.reminded24h ?? 0}</dd></div>
                            <div><dt className="text-slate-500">Recordatorios 2 h</dt><dd className="font-semibold text-slate-900">{counters.reminded2h ?? 0}</dd></div>
                            <div><dt className="text-slate-500">Horarios liberados</dt><dd className="font-semibold text-slate-900">{counters.released ?? 0}</dd></div>
                            <div><dt className="text-slate-500">Solicitudes caducadas</dt><dd className="font-semibold text-slate-900">{counters.expiredPending ?? 0}</dd></div>
                        </dl>
                    )}
                    {data.cron.lastError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{data.cron.lastError}</p>}
                </Card>

                <Card title="Google Meet" subtitle="Cuenta que crea una sala nueva por cada cita online">
                    <div className="flex flex-wrap items-center gap-3">
                        <Pill tone={data.meet.connected ? 'ok' : 'bad'}>{data.meet.connected ? 'Conectado' : 'Sin conectar'}</Pill>
                        {data.meet.accountEmail && <span className="text-sm text-slate-600">{data.meet.accountEmail}</span>}
                    </div>
                    {data.meet.connectedAt && <p className="mt-1 text-xs text-slate-500">Desde {formatDateTime(data.meet.connectedAt)}</p>}
                    {!data.meet.configured && <p className="mt-2 text-xs text-amber-800">Faltan GOOGLE_MEET_CLIENT_ID / GOOGLE_MEET_CLIENT_SECRET.</p>}
                    <Link href="/admin/salas" className="mt-3 inline-flex min-h-[44px] -my-3 items-center text-xs font-medium text-blue-700 hover:underline">
                        {data.meet.connected ? 'Gestionar la conexión' : 'Conectar la cuenta'} →
                    </Link>
                </Card>

                <Card title="Boletas electrónicas" subtitle="Cola de emisión">
                    <dl className="grid grid-cols-3 gap-2 text-center">
                        <div><dt className="text-[11px] text-slate-500">En cola</dt><dd className="text-lg font-semibold text-slate-900">{data.invoices.pending}</dd></div>
                        <div><dt className="text-[11px] text-slate-500">Con error</dt><dd className={`text-lg font-semibold ${data.invoices.failed > 0 ? 'text-red-700' : 'text-slate-900'}`}>{data.invoices.failed}</dd></div>
                        <div><dt className="text-[11px] text-slate-500">Revisión manual</dt><dd className={`text-lg font-semibold ${data.invoices.manualReview > 0 ? 'text-amber-800' : 'text-slate-900'}`}>{data.invoices.manualReview}</dd></div>
                    </dl>
                    <p className="mt-2 text-xs text-slate-500">La emisión automática al SII figura como «Próximamente» en los planes.</p>
                </Card>
            </div>

            <Card title="Configuración" subtitle="Solo se indica si cada ajuste existe y es válido">
                <ul className="divide-y divide-slate-100">
                    {data.config.map((c) => (
                        <li key={c.key} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{c.label}</p>
                                <p className="text-xs text-slate-500">{c.detail}</p>
                            </div>
                            <Pill tone={c.ok ? 'ok' : 'bad'}>{c.ok ? 'Correcto' : 'Revisar'}</Pill>
                        </li>
                    ))}
                    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Modo lista de espera (WAITLIST_MODE)</p>
                            <p className="text-xs text-slate-500">
                                {data.waitlistMode ? 'Activo: la API de reservas responde 404 al público.' : 'Apagado: las reservas están habilitadas.'}
                            </p>
                        </div>
                        <Pill tone={data.waitlistMode ? 'warn' : 'info'}>{data.waitlistMode ? 'Activo' : 'Apagado'}</Pill>
                    </li>
                </ul>
            </Card>

            <Card title="Versión desplegada">
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div><dt className="text-xs text-slate-500">Entorno</dt><dd className="font-medium">{data.build.environment || '—'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Commit</dt><dd className="font-mono text-xs font-medium">{data.build.commit || '—'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Rama</dt><dd className="font-medium">{data.build.branch || '—'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Node</dt><dd className="font-medium">{data.build.node}</dd></div>
                </dl>
            </Card>
        </div>
    )
}
