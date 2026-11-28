/**
 * Reputación de profesionales (estilo "nivel de vendedor"). Lógica pura, sin BD.
 * Los umbrales viven aquí para ajustarlos con datos reales durante el primer mes.
 */

export type ReputationTier = 'NEW' | 'TRUSTED' | 'OUTSTANDING' | 'EXCELLENCE'

export const REPUTATION_CONFIG = {
    /** Promedio de referencia y peso del a priori del promedio bayesiano. */
    priorMean: 4.3,
    priorWeight: 5,
    /** Con menos opiniones que esto se muestra "Nuevo en PsyDoctor" en vez de la nota. */
    minReviewsToShow: 5,
    /** Ventana de cálculo y opiniones "antiguas" (pesan la mitad). */
    windowDays: 365,
    oldAfterDays: 180,
    tiers: {
        TRUSTED: { minReviews: 5, minScore: 4.3 },
        OUTSTANDING: { minReviews: 15, minScore: 4.6, minAttendance: 0.95 },
        EXCELLENCE: { minReviews: 40, minScore: 4.8, minAttendance: 0.97, maxResponseHours: 24 },
    },
} as const

export const TIER_LABELS: Record<ReputationTier, string> = {
    NEW: 'Nuevo',
    TRUSTED: 'Confiable',
    OUTSTANDING: 'Destacado',
    EXCELLENCE: 'Excelencia',
}

export interface RatingInput {
    rating: number
    createdAt: Date
}

const DAY = 24 * 60 * 60 * 1000

/** Peso de una opinión: 1 reciente, 0,5 si tiene más de 6 meses, 0 fuera de la ventana. */
export function reviewWeight(createdAt: Date, now = new Date()): number {
    const age = now.getTime() - createdAt.getTime()
    if (age > REPUTATION_CONFIG.windowDays * DAY) return 0
    return age > REPUTATION_CONFIG.oldAfterDays * DAY ? 0.5 : 1
}

/**
 * Promedio bayesiano ponderado: evita que 1 opinión de 5★ supere a 40 de 4,8.
 * Devuelve null si no hay opiniones dentro de la ventana.
 */
export function bayesianScore(reviews: readonly RatingInput[], now = new Date()): number | null {
    let sum = 0
    let weight = 0
    for (const r of reviews) {
        const w = reviewWeight(r.createdAt, now)
        sum += r.rating * w
        weight += w
    }
    if (weight === 0) return null
    const { priorMean, priorWeight } = REPUTATION_CONFIG
    return (priorWeight * priorMean + sum) / (priorWeight + weight)
}

/** Nivel según cantidad de opiniones vigentes, nota y asistencia del profesional (0..1). */
export function computeTier(count: number, score: number | null, attendance: number | null, responseHours: number | null = null): ReputationTier {
    if (score === null) return 'NEW'
    const t = REPUTATION_CONFIG.tiers
    const att = attendance ?? 1
    // Excelencia exige responder a las solicitudes en 24 h o menos (con dato conocido)
    const fastEnough = responseHours !== null && responseHours <= t.EXCELLENCE.maxResponseHours
    if (count >= t.EXCELLENCE.minReviews && score >= t.EXCELLENCE.minScore && att >= t.EXCELLENCE.minAttendance && fastEnough) return 'EXCELLENCE'
    if (count >= t.OUTSTANDING.minReviews && score >= t.OUTSTANDING.minScore && att >= t.OUTSTANDING.minAttendance) return 'OUTSTANDING'
    if (count >= t.TRUSTED.minReviews && score >= t.TRUSTED.minScore) return 'TRUSTED'
    return 'NEW'
}

/**
 * Asistencia del profesional: 1 − (cancelaciones propias con menos de 24 h) / citas gestionadas.
 * Sin citas devuelve null.
 */
export function attendanceRate(managed: number, lateCancellationsByProfessional: number): number | null {
    if (managed <= 0) return null
    return Math.max(0, 1 - lateCancellationsByProfessional / managed)
}

/** Mediana (en horas) de una lista de tiempos de respuesta; null si no hay datos. */
export function medianHours(values: readonly number[]): number | null {
    if (values.length === 0) return null
    const s = [...values].sort((a, b) => a - b)
    const mid = Math.floor(s.length / 2)
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** ¿Se muestra la nota? Con pocas opiniones se muestra "Nuevo en PsyDoctor". */
export function shouldShowScore(count: number): boolean {
    return count >= REPUTATION_CONFIG.minReviewsToShow
}
