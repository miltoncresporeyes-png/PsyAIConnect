'use client'

import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { useAdminData } from '@/components/admin/useAdminData'
import { AlertList, BarList, Card, CHART_COLORS, ErrorBox, KpiCard, LineChart, Pill, Spinner } from '@/components/admin/ui'
import { formatCLP, formatDateTime, formatNumber, formatPercent, timeAgo } from '@/components/admin/format'
import type { Overview } from '@/lib/admin/metrics'

export default function AdminDashboardPage() {
    const { data, error, loading, reload } = useAdminData<Overview>('/api/admin/overview')

    if (loading && !data) return <Spinner />
    if (error && !data) return <ErrorBox message={error} />
    if (!data) return null

    const { users, professionals, appointments: a, revenue, founders, waitlist, tickets, health, alerts } = data
    const cronTone = health.cron.status === 'ok' ? 'ok' : health.cron.status === 'never' ? 'warn' : 'bad'
    const cronText = { ok: 'Cron al día', late: 'Cron atrasado', error: 'Cron con error', never: 'Cron sin ejecutar' }[health.cron.status]

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Resumen de la plataforma</h1>
                    <p className="text-sm text-slate-500">
                        Actualizado {formatDateTime(data.generatedAt)} · últimos 30 días salvo indicación
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Pill tone={cronTone}>{cronText}</Pill>
                    <Pill tone={health.meet.connected ? 'ok' : 'bad'}>{health.meet.connected ? 'Meet conectado' : 'Meet sin conectar'}</Pill>
                    <button
                        type="button"
                        onClick={reload}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 min-h-[44px] sm:min-h-0 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden /> Actualizar
                    </button>
                </div>
            </header>

            {error && <ErrorBox message={error} />}

            <Card title="Requiere atención" subtitle="Alertas calculadas con los datos y la salud del sistema">
                <AlertList alerts={alerts} />
            </Card>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard label="Usuarios" value={formatNumber(users.total)} hint={`${formatNumber(users.new30d)} nuevos en 30 días`} delta={users.new30dChange} href="/admin/usuarios" />
                <KpiCard label="Profesionales visibles" value={formatNumber(professionals.visible)} hint={`${formatNumber(professionals.verified)} verificados · ${formatNumber(professionals.pending)} por verificar`} href="/admin/usuarios?role=PROFESSIONAL" />
                <KpiCard label="Citas próximos 7 días" value={formatNumber(a.upcoming7d)} hint={`${formatNumber(a.pendingAcceptance)} esperando aceptación`} href="/admin/citas?status=CONFIRMED" />
                <KpiCard label="MRR estimado" value={formatCLP(revenue.mrrEstimate)} hint={`${formatNumber(revenue.paidSubscriptions)} suscripciones de pago`} href="/admin/suscripciones" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Nuevos usuarios por día" subtitle="Registros de los últimos 30 días">
                    <LineChart
                        ariaLabel={`Nuevos usuarios por día: ${users.new30d} en los últimos 30 días`}
                        series={[{ name: 'Registros', color: CHART_COLORS.s1, points: users.signupsDaily }]}
                    />
                </Card>
                <Card title="Citas por día" subtitle="Solicitudes creadas y sesiones realizadas">
                    <LineChart
                        ariaLabel="Citas creadas y completadas por día en los últimos 30 días"
                        series={[
                            { name: 'Solicitadas', color: CHART_COLORS.s1, points: a.createdDaily },
                            { name: 'Completadas', color: CHART_COLORS.s2, points: a.completedDaily },
                        ]}
                    />
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Embudo de citas" subtitle="Solicitudes de los últimos 30 días">
                    <BarList
                        rows={[
                            { label: 'Solicitadas', value: a.funnel.requested },
                            { label: 'Aceptadas por el profesional', value: a.funnel.accepted },
                            { label: 'Sesiones completadas', value: a.funnel.completed },
                        ]}
                    />
                    <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                        <div>
                            <dt className="text-[11px] text-slate-500">Aceptación</dt>
                            <dd className="text-sm font-semibold text-slate-900">{formatPercent(a.acceptanceRate)}</dd>
                        </div>
                        <div>
                            <dt className="text-[11px] text-slate-500">Realización</dt>
                            <dd className="text-sm font-semibold text-slate-900">{formatPercent(a.completionRate)}</dd>
                        </div>
                        <div>
                            <dt className="text-[11px] text-slate-500">Inasistencia</dt>
                            <dd className="text-sm font-semibold text-slate-900">{formatPercent(a.noShowRate)}</dd>
                        </div>
                    </dl>
                </Card>

                <Card title="Profesionales" subtitle="Estado de verificación y planes">
                    <BarList
                        base={professionals.total}
                        rows={[
                            { label: 'Verificados', value: professionals.verified },
                            { label: 'Por verificar', value: professionals.pending },
                            { label: 'Rechazados', value: professionals.rejected },
                        ]}
                    />
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs">
                        <Pill tone="neutral">Inicial {professionals.byTier.STARTER}</Pill>
                        <Pill tone="info">PRO {professionals.byTier.PRO}</Pill>
                        <Pill tone="info">PREMIUM {professionals.byTier.PREMIUM}</Pill>
                    </div>
                    {professionals.verifiedWithoutAvailability > 0 && (
                        <p className="mt-3 text-xs text-amber-800">
                            {professionals.verifiedWithoutAvailability} verificado(s) sin horarios configurados.
                        </p>
                    )}
                </Card>

                <Card title="Ingresos por suscripción" subtitle="Solo suscripciones: PsyDoctor no cobra por sesión">
                    <dl className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <dt className="text-xs text-slate-500">Cobrado este mes</dt>
                            <dd className="text-lg font-semibold text-slate-900 tabular-nums">{formatCLP(revenue.paidThisMonth)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <dt className="text-xs text-slate-500">Órdenes pagadas este mes</dt>
                            <dd className="text-sm font-medium text-slate-900">{formatNumber(revenue.paidOrdersThisMonth)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <dt className="text-xs text-slate-500">Vencen en 30 días</dt>
                            <dd className="text-sm font-medium text-slate-900">{formatNumber(revenue.expiringSoonCount)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <dt className="text-xs text-slate-500">Fundadores aprobados</dt>
                            <dd className="text-sm font-medium text-slate-900">
                                {formatNumber(founders.approved)} <span className="text-slate-400">· {founders.pending} pendientes</span>
                            </dd>
                        </div>
                    </dl>
                    <Link href="/admin/suscripciones" className="mt-4 inline-flex min-h-[44px] -my-3 items-center text-xs font-medium text-blue-700 hover:underline">
                        Ver suscripciones →
                    </Link>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Feedback de usuarios" subtitle="Tickets de soporte, sugerencias y consultas">
                    <dl className="grid grid-cols-3 gap-2 text-center">
                        <div><dt className="text-[11px] text-slate-500">Nuevos</dt><dd className={`text-2xl font-semibold tabular-nums ${tickets.new > 0 ? 'text-sky-700' : 'text-slate-900'}`}>{formatNumber(tickets.new)}</dd></div>
                        <div><dt className="text-[11px] text-slate-500">En revisión</dt><dd className="text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(tickets.inReview)}</dd></div>
                        <div><dt className="text-[11px] text-slate-500">Últimos 7 días</dt><dd className="text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(tickets.last7d)}</dd></div>
                    </dl>
                    {tickets.highPriorityOpen > 0 && (
                        <p className="mt-3 text-xs text-red-700">{tickets.highPriorityOpen} de prioridad alta abierto(s).</p>
                    )}
                    <Link href="/admin/tickets" className="mt-4 inline-flex min-h-[44px] -my-3 items-center text-xs font-medium text-blue-700 hover:underline">
                        Ver tickets →
                    </Link>
                </Card>
                <Card className="lg:col-span-2" title="Estado de las citas" subtitle="Creadas en los últimos 30 días">
                    <BarList
                        rows={[
                            { label: 'Pendientes', value: a.byStatus['PENDING'] ?? 0 },
                            { label: 'Confirmadas', value: a.byStatus['CONFIRMED'] ?? 0 },
                            { label: 'Completadas', value: a.byStatus['COMPLETED'] ?? 0 },
                            { label: 'Canceladas', value: a.byStatus['CANCELLED'] ?? 0 },
                            { label: 'No asistió', value: a.byStatus['NO_SHOW'] ?? 0 },
                        ]}
                        base={Math.max(1, a.created30d)}
                    />
                    <p className="mt-3 text-xs text-slate-500">
                        Online {formatNumber(a.modality.online)} · Presencial {formatNumber(a.modality.inPerson)}
                    </p>
                </Card>

                <Card title="Embudo de captación" subtitle="Lista de espera y registros">
                    <dl className="space-y-3 text-sm">
                        <div className="flex items-baseline justify-between"><dt className="text-slate-500">Pacientes en lista de espera</dt><dd className="font-medium text-slate-900">{formatNumber(waitlist.patients)}</dd></div>
                        <div className="flex items-baseline justify-between"><dt className="text-slate-500">Profesionales en lista de espera</dt><dd className="font-medium text-slate-900">{formatNumber(waitlist.professionals)}</dd></div>
                        <div className="flex items-baseline justify-between"><dt className="text-slate-500">Otros registros de interés</dt><dd className="font-medium text-slate-900">{formatNumber(waitlist.entries)}</dd></div>
                        <div className="flex items-baseline justify-between"><dt className="text-slate-500">Pacientes registrados</dt><dd className="font-medium text-slate-900">{formatNumber(users.byRole.patients)}</dd></div>
                        <div className="flex items-baseline justify-between"><dt className="text-slate-500">Cuentas desactivadas</dt><dd className="font-medium text-slate-900">{formatNumber(users.banned)}</dd></div>
                    </dl>
                    <p className="mt-3 text-xs text-slate-500">
                        Último latido del cron: {timeAgo(health.cron.lastRunAt)} ·{' '}
                        <Link href="/admin/sistema" className="font-medium text-blue-700 hover:underline">salud del sistema</Link>
                    </p>
                </Card>
            </div>
        </div>
    )
}
