import { z } from 'zod'
import { detectCrisis, screenMessage } from '@/lib/chat'

export const REVIEW_COMMENT_MAX = 500
export const REPLY_MAX = 500
/** El paciente puede editar su opinión durante 48 h. */
export const REVIEW_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000
/** Se invita a opinar 24 h después de la sesión; el enlace vence a los 14 días. */
export const INVITE_DELAY_MS = 24 * 60 * 60 * 1000
export const INVITE_REMINDER_MS = 3 * 24 * 60 * 60 * 1000
export const INVITE_EXPIRES_MS = 14 * 24 * 60 * 60 * 1000

const star = z.number().int().min(1).max(5)

export const createReviewSchema = z.object({
    appointmentId: z.string().min(1),
    rating: star,
    punctuality: star.optional(),
    clarity: star.optional(),
    booking: star.optional(),
    recommends: z.boolean().optional(),
    comment: z.string().max(REVIEW_COMMENT_MAX).optional(),
})

export const updateReviewSchema = createReviewSchema.omit({ appointmentId: true })

export const replySchema = z.object({ reply: z.string().trim().min(1).max(REPLY_MAX) })

// Contenido que no debe publicarse sin revisión: insultos, términos clínicos/diagnósticos y datos de terceros
const INSULT_RE = /\b(idiota|est[uú]pid[oa]|imb[eé]cil|inepto|charlat[aá]n|estafador|ladr[oó]n|mierda|maldit[oa]|p[uú]ta|concha|weon|weón|culiao|huev[oó]n)\b/i
const CLINICAL_RE =
    /\b(diagn[oó]stic|dep?resi[oó]n mayor|bipolar|esquizofreni|trastorno|tdah|tept|medicaci[oó]n|antidepresiv|receta|sertralina|fluoxetina|clonazepam|me recet[oó]|me diagnostic)/i

export type ModerationResult = { status: 'PUBLISHED' } | { status: 'PENDING_REVIEW'; reason: string }

/**
 * Filtro automático de comentarios (opiniones y respuestas). Sin comentario se publica directo.
 * Si hay algo dudoso queda en revisión del administrador; nunca se descarta en silencio.
 */
export function moderateComment(comment: string | null | undefined): ModerationResult {
    const text = (comment ?? '').trim()
    if (!text) return { status: 'PUBLISHED' }
    const screened = screenMessage(text)
    if (!screened.ok) return { status: 'PENDING_REVIEW', reason: 'Datos de contacto o enlaces' }
    if (detectCrisis(text)) return { status: 'PENDING_REVIEW', reason: 'Posible situación de crisis (revisar con prioridad)' }
    if (INSULT_RE.test(text)) return { status: 'PENDING_REVIEW', reason: 'Lenguaje ofensivo' }
    if (CLINICAL_RE.test(text)) return { status: 'PENDING_REVIEW', reason: 'Contenido clínico o de salud' }
    return { status: 'PUBLISHED' }
}

/** "Paciente verificado": las opiniones nunca exponen el nombre. */
export const REVIEW_AUTHOR_LABEL = 'Paciente verificado'

export const REMOVE_REASONS = [
    'Datos personales o de contacto',
    'Insultos o amenazas',
    'Contenido clínico o de salud',
    'Spam o contenido sin relación con el servicio',
    'Opinión sobre otra persona',
    'Dato falso comprobable',
] as const
