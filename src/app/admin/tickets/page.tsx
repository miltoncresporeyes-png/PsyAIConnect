'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pagination, Pill, SearchInput, SelectFilter, Spinner, Td, Th, useDebounced, type PillTone } from '@/components/admin/ui'
import { formatDateTime, formatNumber, timeAgo } from '@/components/admin/format'
import {
    TICKET_PRIORITY_LABELS,
    TICKET_STATUSES,
    TICKET_STATUS_LABELS,
    TICKET_TYPES,
    TICKET_TYPE_LABELS,
    type TicketPriorityValue,
    type TicketStatusValue,
    type TicketTypeValue,
} from '@/lib/tickets'

interface TicketRow {
    id: string
    number: number
    type: TicketTypeValue
    status: TicketStatusValue
    priority: TicketPriorityValue
    subject: string
    message: string
    contactName: string | null
    contactEmail: string | null
    userRole: string | null
    userId: string | null
    respondedAt: string | null
    createdAt: string
}

interface Response {
    items: TicketRow[]
    total: number
    page: number
    totalPages: number
    statusCounts: Record<string, number>
}

const STATUS_TONE: Record<TicketStatusValue, PillTone> = { NEW: 'info', IN_REVIEW: 'warn', RESOLVED: 'ok', DISCARDED: 'neutral' }
const PRIORITY_TONE: Record<TicketPriorityValue, PillTone> = { LOW: 'neutral', NORMAL: 'neutral', HIGH: 'bad' }
const ROLE_TEXT: Record<string, string> = { PATIENT: 'Paciente', PROFESSIONAL: 'Profesional' }

function TicketsInner() {
    const params = useSearchParams()
    const [q, setQ] = useState('')
    const [status, setStatus] = useState(params?.get('status') || '')
    const [type, setType] = useState('')
    const [priority, setPriority] = useState('')
    const [sort, setSort] = useState('recent')
    const [page, setPage] = useState(1)
    const debouncedQ = useDebounced(q)

    useEffect(() => setPage(1), [debouncedQ, status, type, priority, sort])

    const qs = new URLSearchParams({ page: String(page), sort })
    if (debouncedQ) qs.set('q', debouncedQ)
    if (status) qs.set('status', status)
    if (type) qs.set('type', type)
    if (priority) qs.set('priority', priority)
    const { data, error, loading } = useAdminData<Response>(`/api/admin/tickets?${qs.toString()}`)

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Tickets de soporte</h1>
                <p className="text-sm text-slate-500">
                    Problemas, sugerencias y consultas que envían los usuarios desde «Enviar feedback» y la página de soporte.
                </p>
            </header>

            {data && (
                <div className="flex flex-wrap gap-2">
                    {TICKET_STATUSES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(status === s ? '' : s)}
                            aria-pressed={status === s}
                            className={`rounded-full border px-3 py-2 sm:py-1 text-xs font-medium transition ${status === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            {TICKET_STATUS_LABELS[s]} <span className="tabular-nums opacity-70">{formatNumber(data.statusCounts[s] ?? 0)}</span>
                        </button>
                    ))}
                </div>
            )}

            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <SearchInput value={q} onChange={setQ} placeholder="Asunto, mensaje, correo o #número" />
                    <SelectFilter label="Tipo" value={type} onChange={setType} options={[{ value: '', label: 'Todos' }, ...TICKET_TYPES.map((t) => ({ value: t, label: TICKET_TYPE_LABELS[t] }))]} />
                    <SelectFilter label="Prioridad" value={priority} onChange={setPriority} options={[{ value: '', label: 'Todas' }, { value: 'HIGH', label: 'Alta' }, { value: 'NORMAL', label: 'Normal' }, { value: 'LOW', label: 'Baja' }]} />
                    <SelectFilter label="Orden" value={sort} onChange={setSort} options={[{ value: 'recent', label: 'Más recientes' }, { value: 'oldest', label: 'Más antiguos' }, { value: 'priority', label: 'Más urgentes primero' }]} />
                </div>
            </Card>

            {error && <ErrorBox message={error} />}

            <Card className="!p-0 overflow-hidden">
                {loading && !data ? (
                    <Spinner />
                ) : (
                    <div className={loading ? 'opacity-60' : ''}>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[820px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr><Th>#</Th><Th>Mensaje</Th><Th>De</Th><Th>Tipo</Th><Th>Estado</Th><Th>Recibido</Th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.items.map((t) => (
                                    <tr key={t.id} className="align-top hover:bg-slate-50/60">
                                        <Td className="whitespace-nowrap font-medium tabular-nums text-slate-500">#{t.number}</Td>
                                        <Td className="max-w-[360px]">
                                            <Link href={`/admin/tickets/${t.id}`} className="font-medium text-blue-700 hover:underline">{t.subject}</Link>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{t.message}</p>
                                        </Td>
                                        <Td>
                                            <p className="text-sm">{t.contactName || t.contactEmail || 'Anónimo'}</p>
                                            <p className="text-xs text-slate-500">{t.userRole ? ROLE_TEXT[t.userRole] ?? t.userRole : 'Visitante'}</p>
                                        </Td>
                                        <Td>
                                            {TICKET_TYPE_LABELS[t.type]}
                                            {t.priority === 'HIGH' && <span className="ml-1.5"><Pill tone={PRIORITY_TONE[t.priority]}>{TICKET_PRIORITY_LABELS[t.priority]}</Pill></span>}
                                        </Td>
                                        <Td>
                                            <Pill tone={STATUS_TONE[t.status]}>{TICKET_STATUS_LABELS[t.status]}</Pill>
                                            {t.respondedAt && <p className="mt-1 text-[11px] text-slate-500">Respondido</p>}
                                        </Td>
                                        <Td className="whitespace-nowrap text-xs text-slate-500" >
                                            <span title={formatDateTime(t.createdAt)}>{timeAgo(t.createdAt)}</span>
                                        </Td>
                                    </tr>
                                ))}
                                {data && data.items.length === 0 && (
                                    <tr><Td className="py-10 text-center text-slate-500">No hay tickets que coincidan con los filtros.</Td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <ul className="divide-y divide-slate-100 md:hidden">
                        {data?.items.map((t) => (
                            <li key={t.id}>
                                <Link href={`/admin/tickets/${t.id}`} className="block px-4 py-3 active:bg-slate-50">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold tabular-nums text-slate-500">#{t.number} · {TICKET_TYPE_LABELS[t.type]}</span>
                                        <Pill tone={STATUS_TONE[t.status]}>{TICKET_STATUS_LABELS[t.status]}</Pill>
                                    </div>
                                    <p className="mt-1 font-medium text-slate-900">{t.subject}</p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{t.message}</p>
                                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                        <span>{t.contactName || t.contactEmail || 'Anónimo'} · {t.userRole ? ROLE_TEXT[t.userRole] ?? t.userRole : 'Visitante'}</span>
                                        <span>· {timeAgo(t.createdAt)}</span>
                                        {t.priority === 'HIGH' && <Pill tone={PRIORITY_TONE[t.priority]}>{TICKET_PRIORITY_LABELS[t.priority]}</Pill>}
                                        {t.respondedAt && <span>· Respondido</span>}
                                    </p>
                                </Link>
                            </li>
                        ))}
                        {data && data.items.length === 0 && (
                            <li className="px-4 py-10 text-center text-sm text-slate-500">No hay tickets que coincidan con los filtros.</li>
                        )}
                    </ul>
                    </div>
                )}
            </Card>

            {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
        </div>
    )
}

export default function AdminTicketsPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <TicketsInner />
        </Suspense>
    )
}
