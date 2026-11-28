'use client'

import { useState } from 'react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pill, Spinner } from '@/components/admin/ui'
import { formatDateTime, formatNumber } from '@/components/admin/format'

interface MethodRow {
    id: string
    label: string
    hint: string
    enabled: boolean
    updatedAt: string | null
    professionals: number
}

export default function MediosDePagoPage() {
    const { data, error, loading, reload } = useAdminData<{ items: MethodRow[] }>('/api/admin/medios-de-pago')
    const [busy, setBusy] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const toggle = async (m: MethodRow) => {
        if (m.enabled && !window.confirm(`¿Desactivar "${m.label}"? Dejará de ofrecerse y de mostrarse a los pacientes.`)) return
        setBusy(m.id)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/medios-de-pago', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ methodId: m.id, enabled: !m.enabled }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo guardar')
            reload()
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Error al guardar')
        } finally {
            setBusy(null)
        }
    }

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Medios de pago</h1>
                <p className="text-sm text-slate-500">
                    Define qué medios pueden ofrecer los profesionales. Un medio inactivo deja de elegirse y de mostrarse a los pacientes; la
                    elección guardada por cada profesional se conserva por si lo reactivas.
                </p>
            </header>

            {error && <ErrorBox message={error} />}
            {message && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {message}
                </p>
            )}

            {loading && !data ? (
                <Spinner />
            ) : (
                <Card className="!p-0 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {data?.items.map((m) => (
                            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-slate-900">{m.label}</p>
                                        <Pill tone={m.enabled ? 'ok' : 'neutral'}>{m.enabled ? 'Activo' : 'Inactivo'}</Pill>
                                    </div>
                                    <p className="text-xs text-slate-500">{m.hint}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {formatNumber(m.professionals)} profesional(es) lo tienen elegido
                                        {m.updatedAt ? ` · cambiado ${formatDateTime(m.updatedAt)}` : ''}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={m.enabled}
                                    aria-label={`${m.enabled ? 'Desactivar' : 'Activar'} ${m.label}`}
                                    disabled={busy === m.id}
                                    onClick={() => toggle(m)}
                                    className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50 ${m.enabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${m.enabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    )
}
