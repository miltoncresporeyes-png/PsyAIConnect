'use client'

import { useEffect, useState } from 'react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pagination, SearchInput, SelectFilter, Spinner, Td, Th, useDebounced } from '@/components/admin/ui'
import { formatDateTime } from '@/components/admin/format'

interface LogRow {
    id: string
    adminName: string | null
    action: string
    targetType: string
    targetName: string | null
    targetEmail: string | null
    details: Record<string, unknown> | null
    createdAt: string
}

interface Response {
    items: LogRow[]
    total: number
    page: number
    totalPages: number
    actions: { action: string; count: number }[]
}

const ACTION_LABELS: Record<string, string> = {
    APPROVE_PROFESSIONAL: 'Aprobó a un profesional',
    REJECT_PROFESSIONAL: 'Rechazó a un profesional',
    BAN_USER: 'Desactivó una cuenta',
    UNBAN_USER: 'Reactivó una cuenta',
    RESET_PASSWORD: 'Envió restablecimiento de contraseña',
    UPDATE_NOTES: 'Actualizó notas internas',
    SET_ROLE: 'Cambió un rol',
    CONNECT_GOOGLE_MEET: 'Conectó la cuenta de Google Meet',
    DISCONNECT_GOOGLE_MEET: 'Desconectó la cuenta de Google Meet',
    UPDATE_TICKET: 'Gestionó un ticket de soporte',
}

function describe(row: LogRow): string {
    const d = row.details
    if (row.action === 'SET_ROLE' && d) return `${String(d.from)} → ${String(d.to)}`
    if (row.action === 'UPDATE_NOTES' && d?.notesLength != null) return `${String(d.notesLength)} caracteres`
    if (row.action === 'UPDATE_TICKET' && d?.changes) return String(d.changes)
    return ''
}

export default function AdminAuditoriaPage() {
    const [q, setQ] = useState('')
    const [action, setAction] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [page, setPage] = useState(1)
    const debouncedQ = useDebounced(q)
    useEffect(() => setPage(1), [debouncedQ, action, from, to])

    const qs = new URLSearchParams({ page: String(page) })
    if (debouncedQ) qs.set('q', debouncedQ)
    if (action) qs.set('action', action)
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const { data, error, loading } = useAdminData<Response>(`/api/admin/auditoria?${qs.toString()}`)

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Auditoría</h1>
                <p className="text-sm text-slate-500">Registro de las acciones de los administradores. No contiene datos clínicos.</p>
            </header>

            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <SearchInput value={q} onChange={setQ} placeholder="Administrador o persona afectada" />
                    <SelectFilter
                        label="Acción"
                        value={action}
                        onChange={setAction}
                        options={[{ value: '', label: 'Todas' }, ...(data?.actions ?? []).map((a) => ({ value: a.action, label: `${ACTION_LABELS[a.action] ?? a.action} (${a.count})` }))]}
                    />
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Desde
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900" />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Hasta
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900" />
                    </label>
                </div>
            </Card>

            {error && <ErrorBox message={error} />}

            <Card className="!p-0 overflow-hidden">
                {loading && !data ? (
                    <Spinner />
                ) : (
                    <div className={loading ? 'opacity-60' : ''}>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[720px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr><Th>Cuándo</Th><Th>Administrador</Th><Th>Acción</Th><Th>Afectado</Th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.items.map((r) => (
                                    <tr key={r.id}>
                                        <Td className="whitespace-nowrap text-xs">{formatDateTime(r.createdAt)}</Td>
                                        <Td>{r.adminName || 'Administrador'}</Td>
                                        <Td>
                                            {ACTION_LABELS[r.action] ?? r.action}
                                            {describe(r) && <span className="ml-1.5 text-xs text-slate-500">({describe(r)})</span>}
                                        </Td>
                                        <Td>
                                            {r.targetType === 'SYSTEM' ? (
                                                <span className="text-slate-500">Sistema{r.targetEmail ? ` · ${r.targetEmail}` : ''}</span>
                                            ) : (
                                                <>
                                                    <p className="font-medium text-slate-900">{r.targetName || 'Sin nombre'}</p>
                                                    <p className="text-xs text-slate-500">{r.targetEmail}</p>
                                                </>
                                            )}
                                        </Td>
                                    </tr>
                                ))}
                                {data && data.items.length === 0 && (
                                    <tr><Td className="py-10 text-center text-slate-500">No hay acciones registradas con esos filtros.</Td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <ul className="divide-y divide-slate-100 md:hidden">
                        {data?.items.map((r) => (
                            <li key={r.id} className="px-4 py-3">
                                <p className="text-sm font-medium text-slate-900">
                                    {ACTION_LABELS[r.action] ?? r.action}
                                    {describe(r) && <span className="ml-1.5 text-xs font-normal text-slate-500">({describe(r)})</span>}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">{r.adminName || 'Administrador'} · {formatDateTime(r.createdAt)}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {r.targetType === 'SYSTEM'
                                        ? `Sistema${r.targetEmail ? ` · ${r.targetEmail}` : ''}`
                                        : `${r.targetName || 'Sin nombre'}${r.targetEmail ? ` · ${r.targetEmail}` : ''}`}
                                </p>
                            </li>
                        ))}
                        {data && data.items.length === 0 && (
                            <li className="px-4 py-10 text-center text-sm text-slate-500">No hay acciones registradas con esos filtros.</li>
                        )}
                    </ul>
                    </div>
                )}
            </Card>

            {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
        </div>
    )
}
