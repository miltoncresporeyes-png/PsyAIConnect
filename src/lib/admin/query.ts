/** Utilidades de parametros de consulta para las APIs del panel de administracion. */

export interface Pagination {
    page: number
    pageSize: number
    skip: number
}

export function parsePagination(sp: URLSearchParams, defaultSize = 25, maxSize = 100): Pagination {
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
    const pageSize = Math.min(maxSize, Math.max(1, parseInt(sp.get('pageSize') || String(defaultSize), 10) || defaultSize))
    return { page, pageSize, skip: (page - 1) * pageSize }
}

/** Texto de busqueda acotado y sin espacios sobrantes; null si esta vacio. */
export function parseSearch(sp: URLSearchParams, key = 'q'): string | null {
    const raw = (sp.get(key) || '').trim().slice(0, 80)
    return raw || null
}

/** Valor del parametro solo si pertenece a la lista permitida. */
export function parseEnum<T extends string>(sp: URLSearchParams, key: string, allowed: readonly T[]): T | null {
    const value = sp.get(key)
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : null
}

/** Fecha 'YYYY-MM-DD' (inicio del dia en hora local del servidor) o null. */
export function parseDate(sp: URLSearchParams, key: string, endOfDay = false): Date | null {
    const m = (sp.get(key) || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return null
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    if (endOfDay) d.setHours(23, 59, 59, 999)
    return d
}

export function pageMeta(total: number, p: Pagination) {
    return { total, page: p.page, pageSize: p.pageSize, totalPages: Math.max(1, Math.ceil(total / p.pageSize)) }
}
