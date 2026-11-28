'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pagination, Pill, SearchInput, SelectFilter, Spinner, Td, Th, useDebounced, type PillTone } from '@/components/admin/ui'
import { STATUS_LABELS, formatDateTime, formatNumber } from '@/components/admin/format'

interface AppointmentRow {
    id: string
    scheduledAt: string
    duration: number
    modality: string
    status: string
    cancelledBy: 'SYSTEM' | 'USER' | null
    cancellationReason: string | null
    reconfirmed: boolean
    acceptedByProfessional: boolean
    patientJoined: boolean
    professionalJoined: boolean
    completed: boolean
    noShow: boolean
    hasRoom: boolean
    patient: { id: string; name: string | null; email: string }
    professional: { id: string; userId: string; name: string | null }
}

interface Response {
    items: AppointmentRow[]
    total: number
    page: number
    totalPages: number
    statusCounts: Record<string, number>
}

const statusTone: Record<string, PillTone> = { COMPLETED: 'ok', CONFIRMED: 'info', PENDING: 'warn', CANCELLED: 'neutral', NO_SHOW: 'bad' }

function CitasInner() {
    const params = useSearchParams()
    const [q, setQ] = useState('')
    const [status, setStatus] = useState(params?.get('status') || '')
    const [modality, setModality] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [order, setOrder] = useState('desc')
    const [page, setPage] = useState(1)
    const debouncedQ = useDebounced(q)

    useEffect(() => setPage(1), [debouncedQ, status, modality, from, to, order])

    const qs = new URLSearchParams({ page: String(page), order })
    if (debouncedQ) qs.set('q', debouncedQ)
    if (status) qs.set('status', status)
    if (modality) qs.set('modality', modality)
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const { data, error, loading } = useAdminData<Response>(`/api/admin/citas?${qs.toString()}`)

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Citas</h1>
                <p className="text-sm text-slate-500">
                    Operación de reservas y sesiones. No se muestran motivos de consulta ni enlaces de sala.
                </p>
            </header>

            {data && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setStatus(status === key ? '' : key)}
                            aria-pressed={status === key}
                            className={`rounded-full border px-3 py-2 sm:py-1 text-xs font-medium transition ${status === key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            {label} <span className="tabular-nums opacity-70">{formatNumber(data.statusCounts[key] ?? 0)}</span>
                        </button>
                    ))}
                </div>
            )}

            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <SearchInput value={q} onChange={setQ} placeholder="Paciente o profesional (nombre o correo)" />
                    <SelectFilter label="Modalidad" value={modality} onChange={setModality} options={[{ value: '', label: 'Todas' }, { value: 'ONLINE', label: 'Online' }, { value: 'IN_PERSON', label: 'Presencial' }]} />
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Desde
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900" />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Hasta
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900" />
                    </label>
                    <SelectFilter label="Orden" value={order} onChange={setOrder} options={[{ value: 'desc', label: 'Más recientes primero' }, { value: 'asc', label: 'Más antiguas primero' }]} />
                </div>
            </Card>

            {error && <ErrorBox message={error} />}

            <Card className="!p-0 overflow-hidden">
                {loading && !data ? (
                    <Spinner />
                ) : (
                    <div className={loading ? 'opacity-60' : ''}>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[900px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr><Th>Fecha</Th><Th>Paciente</Th><Th>Profesional</Th><Th>Modalidad</Th><Th>Estado</Th><Th>Seguimiento</Th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.items.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50/60 align-top">
                                        <Td className="whitespace-nowrap">
                                            {formatDateTime(a.scheduledAt)}
                                            <p className="text-xs text-slate-500">{a.duration} min</p>
                                        </Td>
                                        <Td>
                                            <Link href={`/admin/users/${a.patient.id}`} className="font-medium text-blue-700 hover:underline">{a.patient.name || a.patient.email}</Link>
                                        </Td>
                                        <Td>
                                            <Link href={`/admin/users/${a.professional.userId}`} className="font-medium text-blue-700 hover:underline">{a.professional.name || 'Profesional'}</Link>
                                        </Td>
                                        <Td>{a.modality === 'ONLINE' ? 'Online' : 'Presencial'}</Td>
                                        <Td>
                                            <Pill tone={statusTone[a.status] ?? 'neutral'}>{STATUS_LABELS[a.status] ?? a.status}</Pill>
                                            {a.status === 'CANCELLED' && (
                                                <p className="mt-1 max-w-[200px] text-[11px] text-slate-500">
                                                    {a.cancelledBy === 'SYSTEM' ? 'Automática: ' : ''}{a.cancellationReason || 'Sin motivo'}
                                                </p>
                                            )}
                                        </Td>
                                        <Td>
                                            <ul className="space-y-0.5 text-[11px] text-slate-600">
                                                <li>{a.acceptedByProfessional ? '✓ Aceptada por el profesional' : '— Sin aceptar'}</li>
                                                {a.status !== 'PENDING' && <li>{a.reconfirmed ? '✓ Paciente reconfirmó' : '— Sin reconfirmar'}</li>}
                                                {a.modality === 'ONLINE' && a.status !== 'PENDING' && a.status !== 'CANCELLED' && (
                                                    <li>
                                                        {a.hasRoom ? 'Sala creada' : 'Sala aún no creada'} · paciente {a.patientJoined ? 'ingresó' : 'sin ingresar'} · profesional {a.professionalJoined ? 'ingresó' : 'sin ingresar'}
                                                    </li>
                                                )}
                                                {a.noShow && <li className="text-red-700">Inasistencia registrada</li>}
                                            </ul>
                                        </Td>
                                    </tr>
                                ))}
                                {data && data.items.length === 0 && (
                                    <tr><Td className="py-10 text-center text-slate-500">No hay citas que coincidan con los filtros.</Td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <ul className="divide-y divide-slate-100 md:hidden">
                        {data?.items.map((a) => (
                            <li key={a.id} className="px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{formatDateTime(a.scheduledAt)}</p>
                                        <p className="text-xs text-slate-500">{a.duration} min · {a.modality === 'ONLINE' ? 'Online' : 'Presencial'}</p>
                                    </div>
                                    <Pill tone={statusTone[a.status] ?? 'neutral'}>{STATUS_LABELS[a.status] ?? a.status}</Pill>
                                </div>
                                <p className="mt-2 text-sm text-slate-700">
                                    <Link href={`/admin/users/${a.patient.id}`} className="font-medium text-blue-700 hover:underline">{a.patient.name || a.patient.email}</Link>
                                    <span className="text-slate-400"> con </span>
                                    <Link href={`/admin/users/${a.professional.userId}`} className="font-medium text-blue-700 hover:underline">{a.professional.name || 'Profesional'}</Link>
                                </p>
                                <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                                    <li>{a.acceptedByProfessional ? '✓ Aceptada por el profesional' : '— Sin aceptar'}</li>
                                    {a.status !== 'PENDING' && <li>{a.reconfirmed ? '✓ Paciente reconfirmó' : '— Sin reconfirmar'}</li>}
                                    {a.modality === 'ONLINE' && a.status !== 'PENDING' && a.status !== 'CANCELLED' && (
                                        <li>{a.hasRoom ? 'Sala creada' : 'Sala aún no creada'} · paciente {a.patientJoined ? 'ingresó' : 'sin ingresar'} · profesional {a.professionalJoined ? 'ingresó' : 'sin ingresar'}</li>
                                    )}
                                    {a.status === 'CANCELLED' && <li>{a.cancelledBy === 'SYSTEM' ? 'Automática: ' : ''}{a.cancellationReason || 'Sin motivo'}</li>}
                                    {a.noShow && <li className="text-red-700">Inasistencia registrada</li>}
                                </ul>
                            </li>
                        ))}
                        {data && data.items.length === 0 && (
                            <li className="px-4 py-10 text-center text-sm text-slate-500">No hay citas que coincidan con los filtros.</li>
                        )}
                    </ul>
                    </div>
                )}
            </Card>

            {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
        </div>
    )
}

export default function AdminCitasPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <CitasInner />
        </Suspense>
    )
}
