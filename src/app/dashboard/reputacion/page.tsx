'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Star } from 'lucide-react'
import { ReputationBadge } from '@/components/reputation/ReputationBadge'
import { formatPercent } from '@/lib/format'

interface Data {
    score: number | null
    count: number
    tier: string
    tierLabel: string
    attendanceRate: number | null
    responseHours: number | null
    isFounder: boolean
    next: { tier: string; label: string; minReviews: number; minScore: number; minAttendance?: number; maxResponseHours?: number } | null
    reviews: { id: string; rating: number; comment: string | null; reply: string | null; createdAt: string; reportStatus: string | null }[]
}

function Stars({ n }: { n: number }) {
    return (
        <span className="inline-flex gap-0.5" aria-label={`${n} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden />
            ))}
        </span>
    )
}

export default function ReputacionPage() {
    const [data, setData] = useState<Data | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [replying, setReplying] = useState<string | null>(null)
    const [text, setText] = useState('')
    const [saving, setSaving] = useState(false)
    const [replyError, setReplyError] = useState<string | null>(null)
    const [reporting, setReporting] = useState<string | null>(null)
    const [reportReason, setReportReason] = useState('')
    const [reportError, setReportError] = useState<string | null>(null)

    const load = useCallback(async () => {
        const res = await fetch('/api/profesional/reputacion')
        const json = await res.json().catch(() => ({}))
        if (!res.ok) setError(json.error || 'No se pudo cargar tu reputación')
        else setData(json)
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const sendReply = async (id: string) => {
        setSaving(true)
        setReplyError(null)
        try {
            const res = await fetch(`/api/opiniones/${id}/responder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: text }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo enviar la respuesta')
            setReplying(null)
            setText('')
            await load()
        } catch (err) {
            setReplyError(err instanceof Error ? err.message : 'No se pudo enviar la respuesta')
        } finally {
            setSaving(false)
        }
    }

    const sendReport = async (id: string) => {
        setSaving(true)
        setReportError(null)
        try {
            const res = await fetch(`/api/opiniones/${id}/reportar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reportReason }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo enviar el reporte')
            setReporting(null)
            setReportReason('')
            await load()
        } catch (err) {
            setReportError(err instanceof Error ? err.message : 'No se pudo enviar el reporte')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Volver
            </Link>
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Mi reputación</h1>
                <p className="text-sm text-slate-500">Las opiniones vienen de pacientes con sesiones completadas. Evalúan el servicio, no el resultado clínico.</p>
            </header>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {!data && !error && <Loader2 className="h-6 w-6 animate-spin text-teal-700" aria-label="Cargando" />}

            {data && (
                <>
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <ReputationBadge score={data.score} count={data.count} tier={data.tier} isFounder={data.isFounder} />
                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <div><dt className="text-xs text-slate-500">Nivel</dt><dd className="font-semibold text-slate-900">{data.tierLabel}</dd></div>
                            <div><dt className="text-xs text-slate-500">Opiniones (12 meses)</dt><dd className="font-semibold text-slate-900">{data.count}</dd></div>
                            <div><dt className="text-xs text-slate-500">Respuesta a solicitudes</dt><dd className="font-semibold text-slate-900">{data.responseHours === null ? '—' : `${data.responseHours < 1 ? '< 1' : Math.round(data.responseHours)} h`}</dd></div>
                            <div><dt className="text-xs text-slate-500">Asistencia propia</dt><dd className="font-semibold text-slate-900">{data.attendanceRate === null ? '—' : formatPercent(data.attendanceRate * 100, 0)}</dd></div>
                        </dl>
                        {data.next ? (
                            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                                Para llegar a <strong>{data.next.label}</strong>: {data.next.minReviews} opiniones o más, puntuación de {String(data.next.minScore).replace('.', ',')} o más
                                {data.next.minAttendance ? `, asistencia de ${Math.round(data.next.minAttendance * 100)} % o más` : ''}{data.next.maxResponseHours ? ` y responder las solicitudes en ${data.next.maxResponseHours} h o menos` : ''}. Cancelar con menos de 24 horas baja tu asistencia.
                            </p>
                        ) : (
                            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Tienes el nivel más alto. Mantén tu asistencia y tus respuestas.</p>
                        )}
                    </section>

                    <section aria-labelledby="mis-opiniones" className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 id="mis-opiniones" className="text-lg font-semibold text-slate-900">Tus opiniones</h2>
                        {data.reviews.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-600">Aún no hay opiniones. Se invita a los pacientes 24 horas después de cada sesión completada.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-100">
                                {data.reviews.map((r) => (
                                    <li key={r.id} className="space-y-2 py-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Stars n={r.rating} />
                                            <span className="text-xs text-slate-500">Paciente verificado · {new Date(r.createdAt).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        {r.comment && <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{r.comment}</p>}
                                        {r.reply ? (
                                            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><span className="block text-xs font-medium text-slate-500">Tu respuesta</span>{r.reply}</p>
                                        ) : replying === r.id ? (
                                            <div className="space-y-2">
                                                <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={3} aria-label="Tu respuesta" className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-600 focus:outline-none" placeholder="Agradece y responde solo sobre el servicio. No incluyas datos del paciente ni de salud." />
                                                {replyError && <p role="alert" className="text-xs text-red-700">{replyError}</p>}
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => sendReply(r.id)} disabled={saving || !text.trim()} className="min-h-[44px] rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50">
                                                        {saving ? 'Enviando…' : 'Publicar respuesta'}
                                                    </button>
                                                    <button type="button" onClick={() => setReplying(null)} className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm text-slate-700">Cancelar</button>
                                                </div>
                                                <p className="text-xs text-slate-500">Solo puedes responder una vez y no se puede editar.</p>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => { setReplying(r.id); setText(''); setReplyError(null) }} className="min-h-[44px] text-sm font-medium text-teal-700 hover:underline">
                                                Responder
                                            </button>
                                        )}

                                        {r.reportStatus === 'OPEN' ? (
                                            <p className="text-xs text-amber-800">Reportaste esta opinión; la estamos revisando.</p>
                                        ) : r.reportStatus === 'DISMISSED' ? (
                                            <p className="text-xs text-slate-500">Revisamos tu reporte y la opinión cumple las reglas, por lo que sigue publicada.</p>
                                        ) : reporting === r.id ? (
                                            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                                                <label htmlFor={`rep-${r.id}`} className="text-xs font-medium text-slate-700">¿Por qué rompe las reglas? (datos personales, contenido clínico, insultos o algo falso comprobable)</label>
                                                <textarea id={`rep-${r.id}`} value={reportReason} onChange={(e) => setReportReason(e.target.value)} maxLength={300} rows={3} className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-amber-500 focus:outline-none" />
                                                {reportError && <p role="alert" className="text-xs text-red-700">{reportError}</p>}
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => sendReport(r.id)} disabled={saving || reportReason.trim().length < 10} className="min-h-[44px] rounded-lg bg-amber-600 px-4 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">Enviar reporte</button>
                                                    <button type="button" onClick={() => setReporting(null)} className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm text-slate-700">Cancelar</button>
                                                </div>
                                                <p className="text-xs text-slate-500">Reportar no oculta la opinión: la revisa el equipo de PsyDoctor en 72 horas. Las opiniones negativas pero respetuosas no se retiran.</p>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => { setReporting(r.id); setReportReason(''); setReportError(null) }} className="ml-4 min-h-[44px] text-xs text-slate-500 hover:underline">
                                                Reportar
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </main>
    )
}
