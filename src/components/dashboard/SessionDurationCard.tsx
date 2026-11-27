'use client'

import { useEffect, useState } from 'react'
import { Clock, Check, Loader2 } from 'lucide-react'
import { SESSION_DURATION_OPTIONS } from '@/lib/sessionDuration'

/** Duración de la sesión del profesional: define los bloques de horario que ve el paciente al reservar. */
export function SessionDurationCard() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState<number | null>(null)
    const [value, setValue] = useState<number>(50)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

    useEffect(() => {
        let active = true
        fetch('/api/profesional/duracion')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!active || !data) return
                setSaved(data.duration)
                setValue(data.duration)
            })
            .finally(() => active && setLoading(false))
        return () => {
            active = false
        }
    }, [])

    const save = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/profesional/duracion', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration: value }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'No se pudo guardar')
            setSaved(data.duration)
            setMessage({
                type: 'ok',
                text:
                    data.upcomingKeepOldDuration > 0
                        ? `Guardado. Tus ${data.upcomingKeepOldDuration} citas ya agendadas conservan su duración original.`
                        : 'Duración guardada',
            })
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="card p-6" id="duracion-sesion">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center text-violet-700">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Duración de la sesión</h2>
                    <p className="text-xs text-slate-500">
                        Define el largo de cada bloque de horario que ven tus pacientes al reservar.
                    </p>
                </div>
            </div>

            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            ) : (
                <>
                    <div role="radiogroup" aria-label="Duración de la sesión" className="flex flex-wrap gap-2">
                        {SESSION_DURATION_OPTIONS.map((m) => (
                            <button
                                key={m}
                                type="button"
                                role="radio"
                                aria-checked={value === m}
                                onClick={() => setValue(m)}
                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                    value === m
                                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {m} min
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        Ejemplo: con 50 minutos y una ventana de 09:00 a 13:00, el paciente verá 09:00, 09:50, 10:40 y
                        11:30. Los horarios se calculan desde la hora de inicio de cada ventana de tu disponibilidad.
                    </p>

                    {message && (
                        <p
                            role={message.type === 'error' ? 'alert' : 'status'}
                            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                                message.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                            }`}
                        >
                            {message.text}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={save}
                        disabled={saving || value === saved}
                        className="btn-primary mt-4 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Guardar duración
                    </button>
                </>
            )}
        </div>
    )
}

export default SessionDurationCard
