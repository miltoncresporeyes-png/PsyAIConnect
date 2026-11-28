'use client'

import Link from 'next/link'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, KpiCard, Pill, Spinner, Td, Th, type PillTone } from '@/components/admin/ui'
import { TIER_LABELS, formatCLP, formatDate, formatDateTime, formatNumber } from '@/components/admin/format'

interface Response {
    summary: {
        activePaid: number
        expired: number
        cancelledRenewal: number
        expiring30d: number
        mrrEstimate: number
        paidThisMonth: number
        paidOrdersThisMonth: number
        paidAllTime: number
        paidOrdersAllTime: number
        ordersByStatus: Record<string, number>
    }
    subscriptions: { id: string; name: string | null; email: string; tier: string; storedTier: string; endsAt: string | null; daysLeft: number | null; cancelled: boolean; expired: boolean }[]
    orders: { id: string; kind: string; fromTier: string; toTier: string; months: number; amount: number; credit: number; status: string; createdAt: string; paidAt: string | null; name: string | null; email: string }[]
    founders: { id: string; nombreCompleto: string; email: string; profesion: string; numeroCupo: number | null; fechaInicioBeneficio: string | null; fechaFinBeneficio: string | null; daysLeft: number | null }[]
}

const orderTone: Record<string, PillTone> = { PAID: 'ok', PENDING: 'warn', FAILED: 'bad', CANCELLED: 'neutral' }
const orderLabel: Record<string, string> = { PAID: 'Pagada', PENDING: 'Pendiente', FAILED: 'Fallida', CANCELLED: 'Cancelada' }

function daysTone(days: number | null): PillTone {
    if (days == null) return 'neutral'
    if (days <= 7) return 'bad'
    if (days <= 30) return 'warn'
    return 'ok'
}

export default function AdminSuscripcionesPage() {
    const { data, error, loading } = useAdminData<Response>('/api/admin/suscripciones')
    if (loading && !data) return <Spinner />
    if (error && !data) return <ErrorBox message={error} />
    if (!data) return null
    const s = data.summary

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Suscripciones</h1>
                <p className="text-sm text-slate-500">
                    El ingreso de PsyDoctor es la suscripción de los profesionales: no hay comisión por sesión ni cobro al paciente.
                </p>
            </header>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard label="MRR estimado" value={formatCLP(s.mrrEstimate)} hint="Precio mensual de los planes vigentes" />
                <KpiCard label="Cobrado este mes" value={formatCLP(s.paidThisMonth)} hint={`${formatNumber(s.paidOrdersThisMonth)} órdenes pagadas`} />
                <KpiCard label="Suscripciones de pago" value={formatNumber(s.activePaid)} hint={`${formatNumber(s.cancelledRenewal)} con renovación cancelada`} />
                <KpiCard label="Vencen en 30 días" value={formatNumber(s.expiring30d)} hint={`${formatNumber(s.expired)} ya vencidas`} />
            </div>

            <Card title="Planes de pago" subtitle="Ordenados por fecha de vencimiento" className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead className="border-y border-slate-200 bg-slate-50">
                            <tr><Th>Profesional</Th><Th>Plan</Th><Th>Vence</Th><Th>Estado</Th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.subscriptions.map((p) => (
                                <tr key={p.id}>
                                    <Td><p className="font-medium text-slate-900">{p.name || 'Sin nombre'}</p><p className="text-xs text-slate-500">{p.email}</p></Td>
                                    <Td><Pill tone="info">{TIER_LABELS[p.storedTier] ?? p.storedTier}</Pill></Td>
                                    <Td className="whitespace-nowrap">{formatDate(p.endsAt)}</Td>
                                    <Td>
                                        {p.expired ? <Pill tone="bad">Vencida</Pill> : <Pill tone={daysTone(p.daysLeft)}>{p.daysLeft} día(s)</Pill>}
                                        {p.cancelled && !p.expired && <p className="mt-1 text-[11px] text-slate-500">Renovación cancelada</p>}
                                    </Td>
                                </tr>
                            ))}
                            {data.subscriptions.length === 0 && (
                                <tr><Td className="py-8 text-center text-slate-500">Aún no hay profesionales con plan de pago.</Td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Órdenes de pago recientes" subtitle={`${formatNumber(s.paidOrdersAllTime)} pagadas en total · ${formatCLP(s.paidAllTime)}`} className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                        <thead className="border-y border-slate-200 bg-slate-50">
                            <tr><Th>Fecha</Th><Th>Profesional</Th><Th>Detalle</Th><Th className="text-right">Monto</Th><Th>Estado</Th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.orders.map((o) => (
                                <tr key={o.id}>
                                    <Td className="whitespace-nowrap text-xs">{formatDateTime(o.paidAt || o.createdAt)}</Td>
                                    <Td><p className="font-medium text-slate-900">{o.name || o.email}</p></Td>
                                    <Td className="text-xs text-slate-600">
                                        {o.kind === 'UPGRADE' ? 'Cambio' : 'Renovación'} {TIER_LABELS[o.fromTier]} → {TIER_LABELS[o.toTier]} · {o.months === 12 ? '12 meses (anual)' : `${o.months} mes`}
                                        {o.credit > 0 && ` · crédito ${formatCLP(o.credit)}`}
                                    </Td>
                                    <Td className="text-right tabular-nums">{formatCLP(o.amount)}</Td>
                                    <Td><Pill tone={orderTone[o.status] ?? 'neutral'}>{orderLabel[o.status] ?? o.status}</Pill></Td>
                                </tr>
                            ))}
                            {data.orders.length === 0 && (
                                <tr><Td className="py-8 text-center text-slate-500">Aún no hay órdenes de pago.</Td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Programa Fundadores" subtitle="12 meses sin costo para los primeros 20 profesionales" action={<Link href="/admin/fundadores" className="text-xs font-medium text-blue-700 hover:underline">Gestionar postulaciones</Link>} className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead className="border-y border-slate-200 bg-slate-50">
                            <tr><Th>Cupo</Th><Th>Fundador</Th><Th>Inicio</Th><Th>Fin del beneficio</Th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.founders.map((f) => (
                                <tr key={f.id}>
                                    <Td className="tabular-nums">{f.numeroCupo ?? '—'}</Td>
                                    <Td><p className="font-medium text-slate-900">{f.nombreCompleto}</p><p className="text-xs text-slate-500">{f.profesion} · {f.email}</p></Td>
                                    <Td className="whitespace-nowrap">{formatDate(f.fechaInicioBeneficio)}</Td>
                                    <Td className="whitespace-nowrap">
                                        {formatDate(f.fechaFinBeneficio)} {f.daysLeft != null && <Pill tone={daysTone(f.daysLeft)}>{f.daysLeft} día(s)</Pill>}
                                    </Td>
                                </tr>
                            ))}
                            {data.founders.length === 0 && (
                                <tr><Td className="py-8 text-center text-slate-500">Aún no hay fundadores aprobados.</Td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
