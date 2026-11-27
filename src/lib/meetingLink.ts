/**
 * Enlace de videollamada propio del profesional (Google Meet, Zoom o Teams).
 *
 * - Se valida contra una lista de dominios para evitar enlaces maliciosos o de phishing.
 * - Es privado: se entrega al paciente solo a traves de POST /api/citas/[id]/unirse,
 *   dentro de la ventana de la cita. Nunca se incluye en listados ni en el perfil publico.
 */

const ALLOWED_HOSTS = ['meet.google.com', 'zoom.us', 'teams.microsoft.com', 'teams.live.com']

export const MEETING_PROVIDERS_LABEL = 'Google Meet, Zoom o Microsoft Teams'

function isAllowedHost(host: string): boolean {
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
}

/** Devuelve el enlace normalizado (https, sin credenciales ni fragmentos) o null si no es valido. */
export function normalizeMeetingUrl(input: string | null | undefined): string | null {
    const raw = (input ?? '').trim()
    if (!raw) return null
    let url: URL
    try {
        url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    } catch {
        return null
    }
    if (url.protocol !== 'https:' || url.username || url.password) return null
    const host = url.hostname.toLowerCase()
    if (!isAllowedHost(host)) return null
    if (url.pathname.length < 2) return null // exige una sala concreta, no solo el dominio
    url.hash = ''
    return url.toString()
}

/** Ventana en la que se puede entrar a la sesion: 15 min antes hasta 30 min despues del termino. */
export const JOIN_OPENS_MINUTES_BEFORE = 15
export const JOIN_CLOSES_MINUTES_AFTER_END = 30

export function isWithinJoinWindow(scheduledAt: Date, durationMin: number, now = new Date()): boolean {
    const opens = scheduledAt.getTime() - JOIN_OPENS_MINUTES_BEFORE * 60000
    const closes = scheduledAt.getTime() + (durationMin + JOIN_CLOSES_MINUTES_AFTER_END) * 60000
    return now.getTime() >= opens && now.getTime() <= closes
}

/**
 * Quita el enlace de reunion de una cita antes de enviarla a quien no es el profesional.
 * Acepta cualquier objeto de cita con `professional` y `videoLink` opcionales.
 */
export function redactMeetingLinks<T extends { videoLink?: string | null; professional?: unknown }>(
    appointment: T,
    viewerIsProfessional: boolean
): T {
    if (viewerIsProfessional) return appointment
    const copy: T = { ...appointment, videoLink: null }
    if (copy.professional && typeof copy.professional === 'object') {
        copy.professional = { ...(copy.professional as Record<string, unknown>), meetingUrl: null }
    }
    return copy
}
