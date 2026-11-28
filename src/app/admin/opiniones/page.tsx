'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, KpiCard, Pagination, Pill, SelectFilter, Spinner, type PillTone } from '@/components/admin/ui'
import { formatDateTime, formatNumber } from '@/components/admin/format'

interface ReviewRow {
    id: string
    rating: number
    comment: string | null
    status: 'PUBLISHED' | 'PENDING_REVIEW' | 'REMOVED'
    flagReason: string | null
    removedReason: string | null
    reply: string | null
    createdAt: string
    reports: { id: string; reason: string; createdAt: string }[]
    patient: { name: string | null; email: string }
    professional: { id: string; slug: string; user: { name: string | null } }
}

interface Response {
    items: ReviewRow[]
    total: number
    page: number
    totalPages: number
    summary: { pending: number; reported: number; published: number; removed: number; average: number | null }
    removeReasons: string[]
}

const STATUS_LABEL: Record<ReviewRow['status'], string> = { PUBLISHED: 'Publicada', PENDING_REVIEW: 'Por revisar', REMOVED: 'Retirada' }
const STATUS_TONE: Record<ReviewRow['status'], PillTone> = { PUBLISHED: 'ok', PENDING_REVIEW: 'warn', REMOVED: 'bad' }
const BTN = 'inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-sm font-medium sm:min-h-0 sm:py-1.5'

function Stars({ n }: { n: number }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${n} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden />
            ))}
        </span>
    )
}

export default function OpinionesAdminPage() {
    const [status, setStatus] = useState('PENDING_REVIEW')
    const [page, setPage] = useState(1)
    const { data, error, loading, reload } = useAdminData<Response>(`/api/admin/opiniones?status=${status}&page=${page}`)
    const [busy, setBusy] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [removing, setRemoving] = useState<ReviewRow | null>(null)
    const [reason, setReason] = useState('')

    const act = async (id: string, body: Record<string, string>) => {
        setBusy(id)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/opiniones', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...body }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo guardar')
            setRemoving(null)
            setReason('')
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
                <h1 className="text-2xl font-semibold text-slate-900">Opiniones</h1>
                <p className="text-sm text-slate-500">
                    Solo se retiran las que rompen las reglas (datos personales, insultos, contenido clínico, spam). Las negativas no se ocultan.
                </p>
            </header>

            {data && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <KpiCard label="Por revisar" value={formatNumber(data.summary.pending)} />
                    <KpiCard label="Reportadas" value={formatNumber(data.summary.reported)} />
                    <KpiCard label="Publicadas" value={formatNumber(data.summary.published)} />
                    <KpiCard label="Retiradas" value={formatNumber(data.summary.removed)} />
                    <KpiCard label="Promedio global" value={data.summary.average ? data.summary.average.toFixed(2).replace('.', ',') : '—'} />
                </div>
            )}

            <Card>
                <SelectFilter
                    label="Estado"
                    value={status}
                    onChange={(v) => {
                        setStatus(v)
                        setPage(1)
                    }}
                    options={[
                        { value: 'PENDING_REVIEW', label: 'Por revisar' },
                        { value: 'REPORTED', label: 'Reportadas por el profesional' },
                        { value: 'PUBLISHED', label: 'Publicadas' },
                        { value: 'REMOVED', label: 'Retiradas' },
                    ]}
                />
            </Card>

            {error && <ErrorBox message={error} />}
            {message && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {message}
                </p>
            )}

            {loading && !data ? (
                <Spinner />
            ) : data && data.items.length === 0 ? (
                <Card>
                    <p className="py-6 text-center text-sm text-slate-500">No hay opiniones en este estado.</p>
                </Card>
            ) : (
                <ul className="space-y-3">
                    {data?.items.map((r) => (
                        <li key={r.id}>
                            <Card>
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Stars n={r.rating} />
                                            <Pill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Pill>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Sobre{' '}
                                            <Link href={`/profesional/${r.professional.slug}`} className="font-medium text-blue-700 hover:underline">
                                                {r.professional.user.name || 'profesional'}
                                            </Link>{' '}
                                            · de {r.patient.name || r.patient.email} · {formatDateTime(r.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {r.comment ? (
                                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-800">{r.comment}</p>
                                ) : (
                                    <p className="mt-3 text-sm italic text-slate-400">Sin comentario</p>
                                )}
                                {r.flagReason && r.status === 'PENDING_REVIEW' && (
                                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Motivo de la revisión: {r.flagReason}</p>
                                )}
                                {r.reports.map((rep) => (
                                    <p key={rep.id} className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                        Reporte del profesional ({formatDateTime(rep.createdAt)}): {rep.reason}
                                    </p>
                                ))}
                                {r.removedReason && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">Retirada: {r.removedReason}</p>}
                                {r.reply && <p className="mt-2 border-l-2 border-slate-200 pl-3 text-xs text-slate-600">Respuesta del profesional: {r.reply}</p>}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {r.reports.length > 0 && (
                                        <button type="button" disabled={busy === r.id} onClick={() => act(r.id, { action: 'dismiss-report' })} className={`${BTN} border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50`}>
                                            Mantener publicada
                                        </button>
                                    )}
                                    {r.status === 'PENDING_REVIEW' && (
                                        <button type="button" disabled={busy === r.id} onClick={() => act(r.id, { action: 'approve' })} className={`${BTN} bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50`}>
                                            Publicar
                                        </button>
                                    )}
                                    {r.status !== 'REMOVED' && (
                                        <button type="button" disabled={busy === r.id} onClick={() => { setRemoving(r); setReason('') }} className={`${BTN} border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50`}>
                                            Retirar
                                        </button>
                                    )}
                                    {r.status === 'REMOVED' && (
                                        <button type="button" disabled={busy === r.id} onClick={() => act(r.id, { action: 'restore' })} className={`${BTN} border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50`}>
                                            Restaurar
                                        </button>
                                    )}
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}

            {removing && data && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && setRemoving(null)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="remove-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
                        <h2 id="remove-title" className="text-lg font-semibold text-slate-900">Retirar opinión</h2>
                        <p className="mt-1 text-sm text-slate-500">Se registra el motivo en la auditoría. Elige uno o escribe el tuyo.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {data.removeReasons.map((m) => (
                                <button key={m} type="button" onClick={() => setReason(m)} className={`rounded-full border px-3 py-1.5 text-xs ${reason === m ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={200} aria-label="Motivo del retiro" className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-red-500 focus:outline-none" />
                        <div className="mt-4 flex gap-3">
                            <button type="button" onClick={() => setRemoving(null)} className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-4 text-sm text-slate-700">Cancelar</button>
                            <button type="button" disabled={reason.trim().length < 3 || busy === removing.id} onClick={() => act(removing.id, { action: 'remove', reason: reason.trim() })} className="min-h-[44px] flex-1 rounded-lg bg-red-600 px-4 text-sm font-medium text-white disabled:opacity-50">
                                Retirar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
