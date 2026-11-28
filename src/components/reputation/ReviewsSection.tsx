import { Star } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { REVIEW_AUTHOR_LABEL } from '@/lib/reviews'
import { shouldShowScore } from '@/lib/reputation'
import { ReputationBadge } from './ReputationBadge'

const CRITERIA: { key: 'punctuality' | 'clarity' | 'booking'; label: string }[] = [
    { key: 'punctuality', label: 'Puntualidad' },
    { key: 'clarity', label: 'Trato y claridad' },
    { key: 'booking', label: 'Facilidad de reserva' },
]

function Stars({ n }: { n: number }) {
    return (
        <span className="inline-flex gap-0.5" aria-label={`${n} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden />
            ))}
        </span>
    )
}

/** Opiniones verificadas del perfil público (componente de servidor). */
export async function ReviewsSection({ professionalId }: { professionalId: string }) {
    const where = { professionalId, status: 'PUBLISHED' as const }
    const [professional, items, total, grouped, averages] = await Promise.all([
        prisma.professional.findUnique({
            where: { id: professionalId },
            select: { ratingScore: true, ratingCount: true, reputationTier: true, isFounder: true },
        }),
        prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { id: true, rating: true, comment: true, reply: true, createdAt: true },
        }),
        prisma.review.count({ where }),
        prisma.review.groupBy({ by: ['rating'], where, _count: { _all: true } }),
        prisma.review.aggregate({ where, _avg: { punctuality: true, clarity: true, booking: true } }),
    ])
    if (!professional) return null

    return (
        <section aria-labelledby="opiniones-titulo" className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 id="opiniones-titulo" className="text-lg font-semibold text-slate-900">Opiniones de pacientes</h2>
            <p className="mt-1 text-xs text-slate-500">Solo pacientes con una sesión completada. Evalúan el servicio, no el resultado clínico.</p>

            <div className="mt-4">
                <ReputationBadge score={professional.ratingScore} count={professional.ratingCount} tier={professional.reputationTier} isFounder={professional.isFounder} />
            </div>

            {total === 0 ? (
                <p className="mt-4 text-sm text-slate-600">Aún no tiene opiniones. Las primeras llegan después de sus sesiones completadas.</p>
            ) : (
                <>
                    {shouldShowScore(total) && (
                        <div className="mt-5 grid gap-6 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = grouped.find((g) => g.rating === stars)?._count._all ?? 0
                                    return (
                                        <div key={stars} className="flex items-center gap-2 text-xs text-slate-600">
                                            <span className="w-3 text-right">{stars}</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                                            </div>
                                            <span className="w-6 tabular-nums">{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <dl className="space-y-1.5 text-sm">
                                {CRITERIA.map((c) => {
                                    const v = averages._avg[c.key]
                                    return v ? (
                                        <div key={c.key} className="flex justify-between gap-3">
                                            <dt className="text-slate-600">{c.label}</dt>
                                            <dd className="font-medium text-slate-900">{v.toFixed(1).replace('.', ',')}</dd>
                                        </div>
                                    ) : null
                                })}
                            </dl>
                        </div>
                    )}

                    <ul className="mt-5 divide-y divide-slate-100">
                        {items.map((r) => (
                            <li key={r.id} className="py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Stars n={r.rating} />
                                    <span className="text-xs text-slate-500">
                                        {REVIEW_AUTHOR_LABEL} · {r.createdAt.toLocaleDateString('es-CL', { month: 'long', year: 'numeric', timeZone: 'America/Santiago' })}
                                    </span>
                                </div>
                                {r.comment && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{r.comment}</p>}
                                {r.reply && (
                                    <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                        <p className="text-xs font-medium text-slate-500">Respuesta del profesional</p>
                                        <p className="mt-1 whitespace-pre-wrap break-words">{r.reply}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    )
}
