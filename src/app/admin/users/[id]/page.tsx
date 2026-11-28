'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Ban, KeyRound, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pill, Spinner, Td, Th, type PillTone } from '@/components/admin/ui'
import { ROLE_LABELS, STATUS_LABELS, TIER_LABELS, VERIFICATION_LABELS, formatCLP, formatDate, formatDateTime, formatNumber } from '@/components/admin/format'

interface UserDetail {
    id: string
    email: string
    name: string | null
    phone: string | null
    role: string
    createdAt: string
    isActive: boolean
    adminNotes: string | null
    noShowCount: number
    patientProfile: { region: string | null; comuna: string | null } | null
    professional: {
        rut: string | null
        licenseNumber: string | null
        professionalType: string
        specialties: string[]
        verificationStatus: string
        isPublic: boolean
        subscriptionTier: string
        subscriptionEnds: string | null
        sessionPrice: number
        sessionDuration: number
        slug: string
    } | null
    professionalStats: { total: number; completed: number; noShow: number; upcoming: number } | null
    professionalAppointments: { id: string; scheduledAt: string; status: string; modality: string; patientName: string | null }[]
    appointments: {
        id: string
        scheduledAt: string
        status: string
        modality: string
        professionalName: string | null
        payment: { amount: number; status: string } | null
    }[]
    history: { id: string; action: string; adminName: string | null; details: Record<string, unknown> | null; createdAt: string }[]
}

const statusTone: Record<string, PillTone> = { COMPLETED: 'ok', CONFIRMED: 'info', PENDING: 'warn', CANCELLED: 'neutral', NO_SHOW: 'bad' }
const ACTION_LABELS: Record<string, string> = {
    BAN_USER: 'Desactivó la cuenta',
    UNBAN_USER: 'Reactivó la cuenta',
    RESET_PASSWORD: 'Envió restablecimiento de contraseña',
    UPDATE_NOTES: 'Actualizó las notas internas',
    SET_ROLE: 'Cambió el rol',
    APPROVE_PROFESSIONAL: 'Aprobó al profesional',
    REJECT_PROFESSIONAL: 'Rechazó al profesional',
}

export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data, error, loading, reload } = useAdminData<UserDetail>(id ? `/api/admin/users/${id}` : null)
    const [notes, setNotes] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
    const [newRole, setNewRole] = useState('')

    if (loading && !data) return <Spinner />
    if (error && !data) return <ErrorBox message={error} />
    if (!data) return null

    const act = async (body: Record<string, unknown>, confirmText?: string) => {
        if (confirmText && !confirm(confirmText)) return
        setBusy(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo completar la acción')
            setMessage({ type: 'ok', text: json.message || 'Listo' })
            reload()
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error' })
        } finally {
            setBusy(false)
        }
    }

    const notesValue = notes ?? data.adminNotes ?? ''
    const pro = data.professional

    return (
        <div className="space-y-4">
            <Link href="/admin/usuarios" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Usuarios
            </Link>

            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{data.name || 'Sin nombre'}</h1>
                    <p className="text-sm text-slate-500">{data.email}{data.phone ? ` · ${data.phone}` : ''}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Pill tone={data.role === 'ADMIN' ? 'info' : 'neutral'}>{ROLE_LABELS[data.role] ?? data.role}</Pill>
                        {data.isActive ? <Pill tone="ok">Activo</Pill> : <Pill tone="bad">Desactivado</Pill>}
                        {data.noShowCount > 0 && <Pill tone="warn">{data.noShowCount} inasistencia(s)</Pill>}
                        <span className="text-xs text-slate-500">Registrado el {formatDate(data.createdAt)}</span>
                    </div>
                </div>
            </header>

            {message && (
                <p role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </p>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {pro && (
                        <Card title="Perfil profesional" action={<Link href={`/profesional/${pro.slug}`} target="_blank" className="text-xs font-medium text-blue-700 hover:underline">Ver perfil público</Link>}>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div><dt className="text-xs text-slate-500">Verificación</dt><dd><Pill tone={pro.verificationStatus === 'VERIFIED' ? 'ok' : pro.verificationStatus === 'PENDING' ? 'warn' : 'bad'}>{VERIFICATION_LABELS[pro.verificationStatus]}</Pill></dd></div>
                                <div><dt className="text-xs text-slate-500">Visible en el buscador</dt><dd className="font-medium">{pro.isPublic ? 'Sí' : 'No'}</dd></div>
                                <div><dt className="text-xs text-slate-500">Plan</dt><dd className="font-medium">{TIER_LABELS[pro.subscriptionTier] ?? pro.subscriptionTier}{pro.subscriptionEnds ? ` · hasta ${formatDate(pro.subscriptionEnds)}` : ''}</dd></div>
                                <div><dt className="text-xs text-slate-500">Sesión</dt><dd className="font-medium">{formatCLP(pro.sessionPrice)} · {pro.sessionDuration} min</dd></div>
                                <div><dt className="text-xs text-slate-500">RUT</dt><dd className="font-medium">{pro.rut || '—'}</dd></div>
                                <div><dt className="text-xs text-slate-500">Registro Superintendencia</dt><dd className="font-medium">{pro.licenseNumber || '—'}</dd></div>
                                <div className="col-span-2"><dt className="text-xs text-slate-500">Especialidades</dt><dd className="font-medium">{pro.specialties.length ? pro.specialties.join(', ') : '—'}</dd></div>
                            </dl>
                            {data.professionalStats && (
                                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 text-center">
                                    {[
                                        ['Citas', data.professionalStats.total],
                                        ['Completadas', data.professionalStats.completed],
                                        ['Inasistencias', data.professionalStats.noShow],
                                        ['Próximas', data.professionalStats.upcoming],
                                    ].map(([label, value]) => (
                                        <div key={label as string}>
                                            <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatNumber(value as number)}</p>
                                            <p className="text-[11px] text-slate-500">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    <Card title={pro ? 'Citas del profesional (últimas 20)' : 'Citas como paciente (últimas 20)'} className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px]">
                                <thead className="border-y border-slate-200 bg-slate-50">
                                    <tr><Th>Fecha</Th><Th>{pro ? 'Paciente' : 'Profesional'}</Th><Th>Modalidad</Th><Th>Estado</Th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(pro
                                        ? data.professionalAppointments.map((a) => ({ id: a.id, scheduledAt: a.scheduledAt, who: a.patientName, status: a.status, modality: a.modality }))
                                        : data.appointments.map((a) => ({ id: a.id, scheduledAt: a.scheduledAt, who: a.professionalName, status: a.status, modality: a.modality }))
                                    ).map((a) => (
                                        <tr key={a.id}>
                                            <Td className="whitespace-nowrap">{formatDateTime(a.scheduledAt)}</Td>
                                            <Td>{a.who || '—'}</Td>
                                            <Td>{a.modality === 'ONLINE' ? 'Online' : 'Presencial'}</Td>
                                            <Td><Pill tone={statusTone[a.status] ?? 'neutral'}>{STATUS_LABELS[a.status] ?? a.status}</Pill></Td>
                                        </tr>
                                    ))}
                                    {(pro ? data.professionalAppointments : data.appointments).length === 0 && (
                                        <tr><Td className="py-8 text-center text-slate-500">Sin citas registradas.</Td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Notas internas" subtitle="Solo las ven los administradores">
                        <textarea
                            value={notesValue}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
                            placeholder="Observaciones, contexto de soporte, acuerdos…"
                        />
                        <button
                            type="button"
                            disabled={busy || notes === null}
                            onClick={() => act({ action: 'updateNotes', adminNotes: notesValue })}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2.5 sm:py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                            <Save className="h-3.5 w-3.5" aria-hidden /> Guardar notas
                        </button>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card title="Acciones">
                        <div className="space-y-2">
                            {data.isActive ? (
                                <button type="button" disabled={busy} onClick={() => act({ action: 'ban' }, '¿Desactivar esta cuenta? No podrá iniciar sesión.')}
                                    className="flex w-full items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">
                                    <Ban className="h-4 w-4" aria-hidden /> Desactivar cuenta
                                </button>
                            ) : (
                                <button type="button" disabled={busy} onClick={() => act({ action: 'unban' })}
                                    className="flex w-full items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                                    <RotateCcw className="h-4 w-4" aria-hidden /> Reactivar cuenta
                                </button>
                            )}
                            <button type="button" disabled={busy} onClick={() => act({ action: 'resetPassword' }, '¿Enviar un correo para restablecer la contraseña?')}
                                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                <KeyRound className="h-4 w-4" aria-hidden /> Restablecer contraseña
                            </button>
                        </div>
                    </Card>

                    <Card title="Rol" subtitle="El cambio surte efecto cuando la persona vuelve a iniciar sesión">
                        <div className="flex items-center gap-2">
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                aria-label="Nuevo rol"
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 sm:py-1.5 text-sm"
                            >
                                <option value="">Rol actual: {ROLE_LABELS[data.role] ?? data.role}</option>
                                {(['PATIENT', 'PROFESSIONAL', 'ADMIN'] as const).filter((r) => r !== data.role).map((r) => (
                                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={busy || !newRole}
                                onClick={() => act({ action: 'setRole', role: newRole }, `¿Cambiar el rol a ${ROLE_LABELS[newRole]}? ${newRole === 'ADMIN' ? 'Tendrá acceso total al panel de administración.' : ''}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2.5 sm:py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Aplicar
                            </button>
                        </div>
                    </Card>

                    <Card title="Historial de acciones">
                        {data.history.length === 0 ? (
                            <p className="text-xs text-slate-500">Sin acciones de administradores sobre esta cuenta.</p>
                        ) : (
                            <ul className="space-y-3">
                                {data.history.map((h) => (
                                    <li key={h.id} className="text-xs">
                                        <p className="font-medium text-slate-900">{ACTION_LABELS[h.action] ?? h.action}</p>
                                        <p className="text-slate-500">
                                            {h.adminName || 'Administrador'} · {formatDateTime(h.createdAt)}
                                            {h.action === 'SET_ROLE' && h.details ? ` · ${String(h.details.from)} → ${String(h.details.to)}` : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
