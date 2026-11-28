import { Award, ShieldCheck, Star } from 'lucide-react'
import { TIER_LABELS, shouldShowScore, type ReputationTier } from '@/lib/reputation'

const TIER_STYLE: Record<ReputationTier, string> = {
    NEW: 'bg-slate-100 text-slate-700',
    TRUSTED: 'bg-sky-50 text-sky-800',
    OUTSTANDING: 'bg-emerald-50 text-emerald-800',
    EXCELLENCE: 'bg-amber-50 text-amber-900',
}

interface Props {
    score?: number | null
    count?: number | null
    tier?: string | null
    isFounder?: boolean | null
    /** Versión compacta para tarjetas de búsqueda. */
    compact?: boolean
}

/**
 * Nota y nivel de reputación. Con menos de 5 opiniones muestra "Nuevo en PsyDoctor"
 * (el promedio no es representativo) junto a la insignia de registro verificado.
 */
export function ReputationBadge({ score, count, tier, isFounder, compact = false }: Props) {
    const n = count ?? 0
    const level = (tier && tier in TIER_LABELS ? tier : 'NEW') as ReputationTier
    const showScore = shouldShowScore(n) && typeof score === 'number'

    return (
        <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
            {showScore ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900" aria-label={`Puntuación ${score!.toFixed(1)} de 5, ${n} opiniones`}>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    {score!.toFixed(1).replace('.', ',')}
                    <span className="text-xs font-normal text-slate-500">({n})</span>
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Nuevo en PsyDoctor
                </span>
            )}
            {showScore && level !== 'NEW' && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLE[level]}`}>
                    <Award className="h-3.5 w-3.5" aria-hidden /> {TIER_LABELS[level]}
                </span>
            )}
            {isFounder && (
                <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800">Fundador</span>
            )}
        </div>
    )
}
