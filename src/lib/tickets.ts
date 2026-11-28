/**
 * Tickets de feedback (problemas, sugerencias, consultas). Modulo puro: lo usan el cliente, las APIs y el panel.
 */
import { z } from 'zod'

export const TICKET_TYPES = ['PROBLEM', 'SUGGESTION', 'QUESTION', 'OTHER'] as const
export const TICKET_STATUSES = ['NEW', 'IN_REVIEW', 'RESOLVED', 'DISCARDED'] as const
export const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH'] as const

export type TicketTypeValue = (typeof TICKET_TYPES)[number]
export type TicketStatusValue = (typeof TICKET_STATUSES)[number]
export type TicketPriorityValue = (typeof TICKET_PRIORITIES)[number]

export const TICKET_TYPE_LABELS: Record<TicketTypeValue, string> = {
    PROBLEM: 'Problema',
    SUGGESTION: 'Sugerencia',
    QUESTION: 'Consulta',
    OTHER: 'Otro',
}

export const TICKET_TYPE_HINTS: Record<TicketTypeValue, string> = {
    PROBLEM: 'Algo no funciona o se ve mal',
    SUGGESTION: 'Una idea para mejorar PsyDoctor',
    QUESTION: 'Tengo una duda',
    OTHER: 'Otro tipo de comentario',
}

export const TICKET_STATUS_LABELS: Record<TicketStatusValue, string> = {
    NEW: 'Nuevo',
    IN_REVIEW: 'En revisión',
    RESOLVED: 'Resuelto',
    DISCARDED: 'Descartado',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriorityValue, string> = {
    LOW: 'Baja',
    NORMAL: 'Normal',
    HIGH: 'Alta',
}

export const SUBJECT_MIN = 4
export const SUBJECT_MAX = 120
export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 3000
export const RESPONSE_MAX = 3000
export const NOTES_MAX = 3000

/** Aviso que se muestra en el formulario: el feedback no es un canal para datos clinicos. */
export const SENSITIVE_DATA_NOTICE =
    'No incluyas datos clínicos ni de salud (diagnósticos, notas de sesión) ni contraseñas. Si es una urgencia, usa las líneas de ayuda: no es un canal de emergencias.'

/** Quita caracteres de control (conserva saltos de linea y tabulaciones) y limita saltos de linea seguidos. */
export function cleanText(input: string): string {
    return input
        .replace(/\r\n/g, '\n')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/\n{4,}/g, '\n\n\n')
        .trim()
}

/** Solo la ruta de la pagina (sin dominio, parametros ni fragmento): los parametros pueden traer datos personales. */
export function sanitizePagePath(value: string | null | undefined): string | null {
    if (!value) return null
    try {
        const url = value.startsWith('/') ? new URL(value, 'https://x.invalid') : new URL(value)
        const path = url.pathname.slice(0, 200)
        return path.startsWith('/') ? path : null
    } catch {
        return null
    }
}

export const createTicketSchema = z.object({
    type: z.enum(TICKET_TYPES, { errorMap: () => ({ message: 'Elige el tipo de mensaje' }) }),
    subject: z
        .string()
        .trim()
        .min(SUBJECT_MIN, `El asunto debe tener al menos ${SUBJECT_MIN} caracteres`)
        .max(SUBJECT_MAX, `El asunto no puede superar los ${SUBJECT_MAX} caracteres`),
    message: z
        .string()
        .trim()
        .min(MESSAGE_MIN, `Cuéntanos un poco más (mínimo ${MESSAGE_MIN} caracteres)`)
        .max(MESSAGE_MAX, `El mensaje no puede superar los ${MESSAGE_MAX} caracteres`),
    email: z.string().trim().email('Ingresa un correo válido').max(160).optional().or(z.literal('')),
    name: z.string().trim().max(80).optional(),
    pageUrl: z.string().max(400).optional(),
    /** Campo trampa para bots: las personas no lo ven y debe llegar vacio. */
    website: z.string().max(200).optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>

export const updateTicketSchema = z
    .object({
        status: z.enum(TICKET_STATUSES).optional(),
        priority: z.enum(TICKET_PRIORITIES).optional(),
        adminNotes: z.string().max(NOTES_MAX).nullable().optional(),
        adminResponse: z.string().max(RESPONSE_MAX).nullable().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'No hay cambios que guardar' })

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
