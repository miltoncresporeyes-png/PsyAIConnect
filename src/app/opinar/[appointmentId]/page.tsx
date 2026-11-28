'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle2, Loader2, Star } from 'lucide-react'

interface FormData {
    appointmentId: string
    professionalName: string | null
    professionalSlug: string
    eligible: boolean
    reason: 'not_completed' | 'expired' | null
    review: {
        id: string
        rating: number
        punctuality: number | null
        clarity: number | null
        booking: number | null
        recommends: boolean | null
        comment: string | null
        status: string
        editableUntil: string
    } | null
}

const COMMENT_MAX = 500

function StarInput({ label, value, onChange, required = false }: { label: string; value: number; onChange: (n: number) => void; required?: boolean }) {
    return (
        <fieldset>
            <legend className="text-sm font-medium text-slate-800">
                {label} {required && <span className="text-red-500">*</span>}
            </legend>
            <div className="mt-1 flex gap-1" role="radiogroup" aria-label={label}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} de 5`}
                        onClick={() => onChange(value === n && !required ? 0 : n)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-100"
                    >
                        <Star className={`h-7 w-7 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden />
                    </button>
                ))}
            </div>
        </fieldset>
    )
}

export default function OpinarPage() {
    const { appointmentId } = useParams<{ appointmentId: string }>()
    const router = useRouter()
    const { status } = useSession()
    const [data, setData] = useState<FormData | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [rating, setRating] = useState(0)
    const [punctuality, setPunctuality] = useState(0)
    const [clarity, setClarity] = useState(0)
    const [booking, setBooking] = useState(0)
    const [recommends, setRecommends] = useState<boolean | null>(null)
    const [comment, setComment] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState<'PUBLISHED' | 'PENDING_REVIEW' | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') router.replace(`/login?callbackUrl=${encodeURIComponent(`/opinar/${appointmentId}`)}`)
    }, [status, router, appointmentId])

    useEffect(() => {
        if (status !== 'authenticated') return
        fetch(`/api/opiniones/cita/${appointmentId}`)
            .then(async (res) => {
                const json = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(json.error || 'No encontramos esta sesión')
                setData(json)
                if (json.review) {
                    setRating(json.review.rating)
                    setPunctuality(json.review.punctuality ?? 0)
                    setClarity(json.review.clarity ?? 0)
                    setBooking(json.review.booking ?? 0)
                    setRecommends(json.review.recommends)
                    setComment(json.review.comment ?? '')
                }
            })
            .catch((err) => setLoadError(err instanceof Error ? err.message : 'No se pudo cargar'))
            .finally(() => setLoading(false))
    }, [status, appointmentId])

    const editing = Boolean(data?.review)
    const canEdit = editing && data?.review ? new Date(data.review.editableUntil).getTime() > Date.now() : false

    const submit = async () => {
        if (rating < 1) {
            setError('Elige una puntuación general')
            return
        }
        setSaving(true)
        setError(null)
        const body = {
            ...(editing ? {} : { appointmentId }),
            rating,
            ...(punctuality ? { punctuality } : {}),
            ...(clarity ? { clarity } : {}),
            ...(booking ? { booking } : {}),
            ...(recommends !== null ? { recommends } : {}),
            ...(comment.trim() ? { comment: comment.trim() } : {}),
        }
        try {
            const res = await fetch(editing ? `/api/opiniones/${data!.review!.id}` : '/api/opiniones', {
                method: editing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo guardar tu opinión')
            setDone(json.status)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo guardar tu opinión')
        } finally {
            setSaving(false)
        }
    }

    const remove = async () => {
        if (!data?.review || !window.confirm('¿Eliminar tu opinión? Esta acción no se puede deshacer.')) return
        const res = await fetch(`/api/opiniones/${data.review.id}`, { method: 'DELETE' })
        if (res.ok) router.replace('/dashboard/citas')
        else setError('No se pudo eliminar tu opinión')
    }

    return (
        <main className="mx-auto w-full max-w-xl px-4 py-8">
            {loading || status === 'loading' ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-700" aria-label="Cargando" />
                </div>
            ) : loadError ? (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
            ) : done ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
                    <h1 className="mt-3 text-xl font-semibold text-slate-900">¡Gracias por tu opinión!</h1>
                    <p className="mt-2 text-sm text-slate-700">
                        {done === 'PENDING_REVIEW'
                            ? 'La revisaremos antes de publicarla para cuidar la privacidad de todas las personas.'
                            : 'Ya está publicada como "Paciente verificado". Tu nombre no se muestra.'}
                    </p>
                    <Link href="/dashboard/citas" className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-teal-700 px-5 text-sm font-medium text-white hover:bg-teal-800">
                        Volver a mis citas
                    </Link>
                </div>
            ) : data && !data.eligible && !editing ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                    <h1 className="text-lg font-semibold text-slate-900">No puedes opinar sobre esta sesión</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        {data.reason === 'expired' ? 'El plazo de 14 días para opinar terminó.' : 'Solo se pueden evaluar sesiones completadas.'}
                    </p>
                    <Link href="/dashboard/citas" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">Volver a mis citas</Link>
                </div>
            ) : data ? (
                <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <header>
                        <h1 className="text-xl font-semibold text-slate-900">{editing ? 'Tu opinión' : '¿Cómo fue tu sesión?'}</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Sesión con <strong>{data.professionalName || 'tu profesional'}</strong>. Aparecerás como <em>Paciente verificado</em>; tu nombre no se muestra.
                        </p>
                        {editing && !canEdit && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Ya pasó el plazo de 48 horas para editarla. Puedes eliminarla si lo deseas.</p>}
                    </header>

                    <StarInput label="Puntuación general" value={rating} onChange={setRating} required />

                    <div className="grid gap-4 sm:grid-cols-3">
                        <StarInput label="Puntualidad" value={punctuality} onChange={setPunctuality} />
                        <StarInput label="Trato y claridad" value={clarity} onChange={setClarity} />
                        <StarInput label="Facilidad de reserva" value={booking} onChange={setBooking} />
                    </div>

                    <fieldset>
                        <legend className="text-sm font-medium text-slate-800">¿Lo recomendarías?</legend>
                        <div className="mt-1 flex gap-2">
                            {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map((o) => (
                                <button key={o.l} type="button" aria-pressed={recommends === o.v} onClick={() => setRecommends(recommends === o.v ? null : o.v)} className={`min-h-[44px] rounded-lg border px-5 text-sm font-medium ${recommends === o.v ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-700'}`}>
                                    {o.l}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor="comment" className="text-sm font-medium text-slate-800">Comentario (opcional)</label>
                        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={COMMENT_MAX} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-600 focus:outline-none" placeholder="Cuenta cómo fue la puntualidad, el trato o la claridad…" />
                        <p className="mt-1 text-xs text-slate-500">
                            {comment.length}/{COMMENT_MAX}. Habla del servicio: no incluyas datos de salud, diagnósticos, teléfonos ni correos. Si lo incluyes, revisaremos tu opinión antes de publicarla.
                        </p>
                    </div>

                    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                    <div className="flex flex-wrap gap-3">
                        {(!editing || canEdit) && (
                            <button type="button" onClick={submit} disabled={saving || rating < 1} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {editing ? 'Guardar cambios' : 'Publicar opinión'}
                            </button>
                        )}
                        {editing && (
                            <button type="button" onClick={remove} className="min-h-[44px] rounded-lg border border-red-200 px-5 text-sm font-medium text-red-600 hover:bg-red-50">
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            ) : null}
        </main>
    )
}
