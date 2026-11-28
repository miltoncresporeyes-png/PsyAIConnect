'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pagination, Pill, SearchInput, SelectFilter, Spinner, Td, Th, useDebounced, type PillTone } from '@/components/admin/ui'
import { ROLE_LABELS, TIER_LABELS, VERIFICATION_LABELS, formatDate, formatNumber } from '@/components/admin/format'

interface UserRow {
    id: string
    name: string | null
    email: string
    role: string
    isActive: boolean
    createdAt: string
    noShowCount: number
    appointmentsAsPatient: number
    professional: { verificationStatus: string; isPublic: boolean; tier: string; appointments: number } | null
}

interface UsersResponse {
    items: UserRow[]
    total: number
    page: number
    totalPages: number
    summary: { all: number; patients: number; professionals: number; admins: number; banned: number }
}

const verificationTone: Record<string, PillTone> = { VERIFIED: 'ok', PENDING: 'warn', REJECTED: 'bad' }

function UsuariosInner() {
    const params = useSearchParams()
    const [q, setQ] = useState('')
    const [role, setRole] = useState(params?.get('role') || '')
    const [status, setStatus] = useState(params?.get('status') || '')
    const [verification, setVerification] = useState(params?.get('verification') || '')
    const [sort, setSort] = useState('recent')
    const [page, setPage] = useState(1)
    const debouncedQ = useDebounced(q)

    // Al cambiar un filtro se vuelve a la primera pagina
    useEffect(() => setPage(1), [debouncedQ, role, status, verification, sort])

    const qs = new URLSearchParams({ page: String(page), sort })
    if (debouncedQ) qs.set('q', debouncedQ)
    if (role) qs.set('role', role)
    if (status) qs.set('status', status)
    if (verification) qs.set('verification', verification)
    const { data, error, loading } = useAdminData<UsersResponse>(`/api/admin/users?${qs.toString()}`)

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
                {data && (
                    <p className="text-sm text-slate-500">
                        {formatNumber(data.summary.all)} en total · {formatNumber(data.summary.patients)} pacientes ·{' '}
                        {formatNumber(data.summary.professionals)} profesionales · {formatNumber(data.summary.admins)} administradores ·{' '}
                        {formatNumber(data.summary.banned)} desactivados
                    </p>
                )}
            </header>

            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <SearchInput value={q} onChange={setQ} placeholder="Nombre o correo" />
                    <SelectFilter label="Rol" value={role} onChange={setRole} options={[{ value: '', label: 'Todos' }, { value: 'PATIENT', label: 'Pacientes' }, { value: 'PROFESSIONAL', label: 'Profesionales' }, { value: 'ADMIN', label: 'Administradores' }]} />
                    <SelectFilter label="Estado" value={status} onChange={setStatus} options={[{ value: '', label: 'Todos' }, { value: 'active', label: 'Activos' }, { value: 'banned', label: 'Desactivados' }]} />
                    <SelectFilter label="Verificación" value={verification} onChange={setVerification} options={[{ value: '', label: 'Todas' }, { value: 'PENDING', label: 'Por verificar' }, { value: 'VERIFIED', label: 'Verificados' }, { value: 'REJECTED', label: 'Rechazados' }]} />
                    <SelectFilter label="Orden" value={sort} onChange={setSort} options={[{ value: 'recent', label: 'Más recientes' }, { value: 'oldest', label: 'Más antiguos' }, { value: 'name', label: 'Nombre (A-Z)' }]} />
                </div>
            </Card>

            {error && <ErrorBox message={error} />}

            <Card className="!p-0 overflow-hidden">
                {loading && !data ? (
                    <Spinner />
                ) : (
                    <div className={loading ? 'opacity-60' : ''}>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[760px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <Th>Usuario</Th>
                                    <Th>Rol</Th>
                                    <Th>Estado</Th>
                                    <Th>Citas</Th>
                                    <Th>Registro</Th>
                                    <Th />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.items.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60">
                                        <Td>
                                            <p className="font-medium text-slate-900">{u.name || 'Sin nombre'}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Pill tone={u.role === 'ADMIN' ? 'info' : 'neutral'}>{ROLE_LABELS[u.role] ?? u.role}</Pill>
                                                {u.professional && (
                                                    <>
                                                        <Pill tone={verificationTone[u.professional.verificationStatus] ?? 'neutral'}>
                                                            {VERIFICATION_LABELS[u.professional.verificationStatus]}
                                                        </Pill>
                                                        {u.professional.tier !== 'STARTER' && <Pill tone="info">{TIER_LABELS[u.professional.tier]}</Pill>}
                                                    </>
                                                )}
                                            </div>
                                        </Td>
                                        <Td>
                                            {u.isActive ? <Pill tone="ok">Activo</Pill> : <Pill tone="bad">Desactivado</Pill>}
                                            {u.noShowCount > 0 && <p className="mt-1 text-[11px] text-amber-800">{u.noShowCount} inasistencia(s)</p>}
                                        </Td>
                                        <Td className="tabular-nums">
                                            {u.professional ? `${formatNumber(u.professional.appointments)} atendidas/agendadas` : `${formatNumber(u.appointmentsAsPatient)} reservadas`}
                                        </Td>
                                        <Td className="whitespace-nowrap text-xs text-slate-500">{formatDate(u.createdAt)}</Td>
                                        <Td className="text-right">
                                            <Link href={`/admin/users/${u.id}`} className="text-xs font-medium text-blue-700 hover:underline">
                                                Ver detalle
                                            </Link>
                                        </Td>
                                    </tr>
                                ))}
                                {data && data.items.length === 0 && (
                                    <tr>
                                        <Td className="py-10 text-center text-slate-500" >
                                            No hay usuarios que coincidan con los filtros.
                                        </Td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <ul className="divide-y divide-slate-100 md:hidden">
                        {data?.items.map((u) => (
                            <li key={u.id}>
                                <Link href={`/admin/users/${u.id}`} className="block px-4 py-3 active:bg-slate-50">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-900">{u.name || 'Sin nombre'}</p>
                                            <p className="truncate text-xs text-slate-500">{u.email}</p>
                                        </div>
                                        {u.isActive ? <Pill tone="ok">Activo</Pill> : <Pill tone="bad">Desactivado</Pill>}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <Pill tone={u.role === 'ADMIN' ? 'info' : 'neutral'}>{ROLE_LABELS[u.role] ?? u.role}</Pill>
                                        {u.professional && (
                                            <Pill tone={verificationTone[u.professional.verificationStatus] ?? 'neutral'}>
                                                {VERIFICATION_LABELS[u.professional.verificationStatus]}
                                            </Pill>
                                        )}
                                        {u.professional && u.professional.tier !== 'STARTER' && <Pill tone="info">{TIER_LABELS[u.professional.tier]}</Pill>}
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        {u.professional ? `${formatNumber(u.professional.appointments)} citas` : `${formatNumber(u.appointmentsAsPatient)} reservas`} · registro {formatDate(u.createdAt)}
                                        {u.noShowCount > 0 ? ` · ${u.noShowCount} inasistencia(s)` : ''}
                                    </p>
                                </Link>
                            </li>
                        ))}
                        {data && data.items.length === 0 && (
                            <li className="px-4 py-10 text-center text-sm text-slate-500">No hay usuarios que coincidan con los filtros.</li>
                        )}
                    </ul>
                    </div>
                )}
            </Card>

            {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
        </div>
    )
}

export default function UsuariosPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <UsuariosInner />
        </Suspense>
    )
}
