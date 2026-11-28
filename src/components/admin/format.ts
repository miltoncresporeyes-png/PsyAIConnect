export { formatCLP, formatNumber, formatPercent } from '@/lib/format'

export function formatDateTime(value: string | Date | null | undefined): string {
    if (!value) return '—'
    return new Date(value).toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago',
    })
}

export function formatDate(value: string | Date | null | undefined): string {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Santiago',
    })
}

/** "hace 5 min", "hace 3 h", "hace 2 d". */
export function timeAgo(value: string | Date | null | undefined, now: Date = new Date()): string {
    if (!value) return 'nunca'
    const min = Math.max(0, Math.round((now.getTime() - new Date(value).getTime()) / 60000))
    if (min < 1) return 'hace instantes'
    if (min < 60) return `hace ${min} min`
    if (min < 60 * 24) return `hace ${Math.round(min / 60)} h`
    return `hace ${Math.round(min / 1440)} d`
}

/** 'YYYY-MM-DD' -> '27 nov' */
export function shortDay(day: string): string {
    const [, m, d] = day.split('-')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${Number(d)} ${months[Number(m) - 1]}`
}

export const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No asistió',
}

export const ROLE_LABELS: Record<string, string> = {
    PATIENT: 'Paciente',
    PROFESSIONAL: 'Profesional',
    ADMIN: 'Administrador',
}

export const TIER_LABELS: Record<string, string> = {
    STARTER: 'Inicial',
    PRO: 'PRO',
    PREMIUM: 'PREMIUM',
}

export const VERIFICATION_LABELS: Record<string, string> = {
    PENDING: 'Por verificar',
    VERIFIED: 'Verificado',
    REJECTED: 'Rechazado',
}
