/**
 * Utilidades puras para series de tiempo y tasas del panel de administracion.
 * Los dias se manejan como 'YYYY-MM-DD' en hora de Chile (America/Santiago).
 */

export const CHILE_TZ = 'America/Santiago'

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CHILE_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

/** 'YYYY-MM-DD' del instante dado, en hora de Chile. */
export function chileDay(date: Date): string {
    return dayFormatter.format(date)
}

/** Ultimos N dias (el ultimo es hoy), en orden ascendente. */
export function lastNDays(n: number, now: Date = new Date()): string[] {
    const days: string[] = []
    for (let i = n - 1; i >= 0; i--) {
        days.push(chileDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)))
    }
    return days
}

export interface SeriesPoint {
    date: string
    value: number
}

/** Completa con ceros los dias sin datos. */
export function fillSeries(rows: { day: string; n: number }[], days: string[]): SeriesPoint[] {
    const byDay = new Map(rows.map((r) => [r.day, Number(r.n)]))
    return days.map((date) => ({ date, value: byDay.get(date) ?? 0 }))
}

/** Porcentaje (0-100) con decimales; null si el total es 0. */
export function pct(part: number, total: number, digits = 1): number | null {
    if (!total) return null
    const f = Math.pow(10, digits)
    return Math.round((part / total) * 100 * f) / f
}

/** Variacion porcentual entre dos periodos; null si el anterior es 0. */
export function change(current: number, previous: number): number | null {
    if (!previous) return null
    return Math.round(((current - previous) / previous) * 1000) / 10
}

export function sum(points: SeriesPoint[]): number {
    return points.reduce((acc, p) => acc + p.value, 0)
}

export type CronStatus = 'ok' | 'late' | 'error' | 'never'

/**
 * Estado de una tarea programada segun su ultimo latido.
 * `expectedEveryMin`: cada cuantos minutos deberia correr; se considera atrasada tras 2.5 periodos.
 */
export function cronStatus(
    heartbeat: { lastRunAt: Date; lastStatus: string } | null,
    now: Date = new Date(),
    expectedEveryMin = 10
): CronStatus {
    if (!heartbeat) return 'never'
    const ageMin = (now.getTime() - heartbeat.lastRunAt.getTime()) / 60000
    if (ageMin > expectedEveryMin * 2.5) return 'late'
    return heartbeat.lastStatus === 'ok' ? 'ok' : 'error'
}
