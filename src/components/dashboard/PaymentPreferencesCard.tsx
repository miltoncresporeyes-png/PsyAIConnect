'use client'

import { useEffect, useState } from 'react'
import { Wallet, Check, Loader2, Edit2 } from 'lucide-react'
import {
    PAYMENT_METHODS,
    PAYMENT_NOTES_MAX_LENGTH,
    paymentMethodLabels,
} from '@/lib/paymentMethods'

/** Formas de pago preferidas del profesional (se muestran en su perfil publico y al reservar). */
export function PaymentPreferencesCard() {
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [methods, setMethods] = useState<string[]>([])
    const [notes, setNotes] = useState('')
    const [disabledIds, setDisabledIds] = useState<string[]>([])
    const [draftMethods, setDraftMethods] = useState<string[]>([])
    const [draftNotes, setDraftNotes] = useState('')
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

    useEffect(() => {
        let active = true
        fetch('/api/profesional/formas-de-pago')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!active || !data) return
                setMethods(data.methods ?? [])
                setNotes(data.notes ?? '')
                setDisabledIds(data.disabled ?? [])
            })
            .finally(() => active && setLoading(false))
        return () => {
            active = false
        }
    }, [])

    const startEditing = () => {
        setDraftMethods(methods)
        setDraftNotes(notes)
        setMessage(null)
        setEditing(true)
    }

    const toggle = (id: string) =>
        setDraftMethods((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))

    const save = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/profesional/formas-de-pago', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ methods: draftMethods, notes: draftNotes }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'No se pudo guardar')
            setMethods(data.methods)
            setNotes(data.notes)
            setEditing(false)
            setMessage({ type: 'ok', text: 'Formas de pago actualizadas' })
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar' })
        } finally {
            setSaving(false)
        }
    }

    const labels = paymentMethodLabels(methods)

    return (
        <div className="card p-6" id="formas-de-pago">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Formas de pago</h2>
                        <p className="text-xs text-slate-500">
                            Tú defines cómo cobrar. PsyDoctor no intermedia los pagos por ahora.
                        </p>
                    </div>
                </div>
                {!editing && !loading && (
                    <button
                        type="button"
                        onClick={startEditing}
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                )}
            </div>

            {message && (
                <p
                    role={message.type === 'error' ? 'alert' : 'status'}
                    className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                        message.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                    }`}
                >
                    {message.text}
                </p>
            )}

            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            ) : editing ? (
                <div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {PAYMENT_METHODS.filter((m) => !disabledIds.includes(m.id)).map((m) => {
                            const checked = draftMethods.includes(m.id)
                            return (
                                <label
                                    key={m.id}
                                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                                        checked ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggle(m.id)}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-900">{m.label}</span>
                                        <span className="block text-xs text-slate-500">{m.hint}</span>
                                    </span>
                                </label>
                            )
                        })}
                    </div>

                    <label className="block mt-4">
                        <span className="text-sm font-medium text-slate-700">Indicaciones de pago (opcional)</span>
                        <textarea
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            maxLength={PAYMENT_NOTES_MAX_LENGTH}
                            rows={3}
                            placeholder="Ej: Pago por transferencia hasta 24 horas antes de la sesión. Te envío los datos al confirmar la cita."
                            className="input mt-1 min-h-[80px]"
                        />
                        <span className="block text-xs text-slate-500 mt-1">
                            Es público: no incluyas números de cuenta, correos, teléfonos ni enlaces. Los datos de pago los compartes con el paciente cuando confirmas la cita. ({draftNotes.length}/{PAYMENT_NOTES_MAX_LENGTH})
                        </span>
                    </label>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving || draftMethods.length === 0}
                            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : labels.length > 0 ? (
                <div>
                    <div className="flex flex-wrap gap-2">
                        {labels.map((label) => (
                            <span
                                key={label}
                                className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-100"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                    {notes && <p className="mt-3 text-sm text-slate-600 leading-relaxed">{notes}</p>}
                </div>
            ) : (
                <p className="text-sm text-slate-600">
                    Aún no indicas cómo prefieres cobrar. Agrégalo para que tus pacientes sepan cómo pagarte.
                </p>
            )}
        </div>
    )
}

export default PaymentPreferencesCard
