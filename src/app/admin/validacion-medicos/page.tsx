'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ExternalLink, FileText, Loader2, X, XCircle } from 'lucide-react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pill, Spinner, Td, Th } from '@/components/admin/ui'
import { formatDate } from '@/components/admin/format'

interface Professional {
    id: string
    userId: string
    name: string | null
    email: string
    rut: string | null
    licenseNumber: string | null
    licensePdfUrl: string | null
    professionalType: string
    specialties: string[]
    createdAt: string
}

const TYPE_LABELS: Record<string, string> = {
    PSYCHOLOGIST: 'Psicólogo',
    PSYCHIATRIST: 'Psiquiatra',
    CLINICAL_PSYCHOLOGIST: 'Psicólogo Clínico',
    THERAPIST: 'Terapeuta',
    COUNSELOR: 'Consejero',
    OTHER: 'Otro',
}

const ACTION_BTN = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white disabled:opacity-50 sm:min-h-0 sm:py-1.5'

function LicenseLink({ p }: { p: Professional }) {
    if (p.licensePdfUrl) {
        return (
            <a href={p.licensePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                <FileText className="h-4 w-4" aria-hidden /> Ver PDF <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
        )
    }
    return <span className="text-sm text-slate-500">{p.licenseNumber ? `Lic: ${p.licenseNumber}` : '—'}</span>
}

export default function ValidacionMedicosPage() {
    const { data, error, loading, reload } = useAdminData<Professional[]>('/api/admin/pending-professionals')
    const [processing, setProcessing] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [rejecting, setRejecting] = useState<Professional | null>(null)
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (!rejecting) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setRejecting(null)
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [rejecting])

    const send = async (professionalId: string, body: Record<string, string>) => {
        setProcessing(professionalId)
        setActionError(null)
        try {
            const res = await fetch('/api/admin/verify-professional', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ professionalId, ...body }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo completar la acción')
            return true
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'No se pudo completar la acción')
            return false
        } finally {
            setProcessing(null)
        }
    }

    const approve = async (p: Professional) => {
        if (await send(p.id, { action: 'approve' })) reload()
    }

    const reject = async () => {
        if (!rejecting || !reason.trim()) return
        if (await send(rejecting.id, { action: 'reject', rejectionReason: reason.trim() })) {
            setRejecting(null)
            setReason('')
            reload()
        }
    }

    const list = data ?? []

    const actions = (p: Professional) => (
        <div className="flex gap-2">
            <button type="button" onClick={() => approve(p)} disabled={processing === p.id} className={`${ACTION_BTN} bg-emerald-600 hover:bg-emerald-700`}>
                {processing === p.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle className="h-4 w-4" aria-hidden />} Aprobar
            </button>
            <button type="button" onClick={() => { setRejecting(p); setReason('') }} disabled={processing === p.id} className={`${ACTION_BTN} bg-red-600 hover:bg-red-700`}>
                <XCircle className="h-4 w-4" aria-hidden /> Rechazar
            </button>
        </div>
    )

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Validación de profesionales</h1>
                    <p className="text-sm text-slate-500">Revisa el título y el registro antes de aprobar.</p>
                </div>
                {list.length > 0 && <Pill tone="warn">{list.length} pendiente{list.length !== 1 ? 's' : ''}</Pill>}
            </header>

            {error && <ErrorBox message={error} />}
            {actionError && <ErrorBox message={actionError} />}

            {loading && !data ? (
                <Spinner />
            ) : list.length === 0 ? (
                <Card>
                    <p className="py-6 text-center text-sm text-slate-500">Todo al día: no hay profesionales pendientes de validación.</p>
                </Card>
            ) : (
                <Card className="!p-0 overflow-hidden">
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[820px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <Th>Profesional</Th>
                                    <Th>RUT</Th>
                                    <Th>Tipo</Th>
                                    <Th>Registro</Th>
                                    <Th>Título</Th>
                                    <Th />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {list.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/60">
                                        <Td>
                                            <p className="font-medium text-slate-900">{p.name || 'Sin nombre'}</p>
                                            <p className="text-xs text-slate-500">{p.email}</p>
                                        </Td>
                                        <Td className="font-mono text-xs">{p.rut || '—'}</Td>
                                        <Td><Pill tone="info">{TYPE_LABELS[p.professionalType] ?? p.professionalType}</Pill></Td>
                                        <Td className="whitespace-nowrap text-xs text-slate-500">{formatDate(p.createdAt)}</Td>
                                        <Td><LicenseLink p={p} /></Td>
                                        <Td className="text-right">{actions(p)}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <ul className="divide-y divide-slate-100 md:hidden">
                        {list.map((p) => (
                            <li key={p.id} className="space-y-2 px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-slate-900">{p.name || 'Sin nombre'}</p>
                                        <p className="truncate text-xs text-slate-500">{p.email}</p>
                                    </div>
                                    <Pill tone="info">{TYPE_LABELS[p.professionalType] ?? p.professionalType}</Pill>
                                </div>
                                <p className="text-xs text-slate-500">
                                    RUT {p.rut || '—'} · registro {formatDate(p.createdAt)}
                                </p>
                                <LicenseLink p={p} />
                                {actions(p)}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {rejecting && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && setRejecting(null)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="reject-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 id="reject-title" className="text-lg font-semibold text-slate-900">Rechazar profesional</h2>
                            <button type="button" aria-label="Cerrar" onClick={() => setRejecting(null)} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="mb-4 rounded-lg bg-slate-50 p-3">
                            <p className="font-medium text-slate-900">{rejecting.name || 'Sin nombre'}</p>
                            <p className="text-sm text-slate-500">{rejecting.email}</p>
                        </div>
                        <label htmlFor="rejectionReason" className="mb-1 block text-sm font-medium text-slate-700">
                            Motivo del rechazo <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="rejectionReason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="Ej: documentación incompleta, título no válido…"
                            className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm focus:border-red-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">Este motivo se envía al profesional por correo.</p>
                        <div className="mt-4 flex gap-3">
                            <button type="button" onClick={() => setRejecting(null)} className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50">
                                Cancelar
                            </button>
                            <button type="button" onClick={reject} disabled={!reason.trim() || processing === rejecting.id} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                                {processing === rejecting.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />} Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
