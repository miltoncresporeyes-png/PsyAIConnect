/**
 * Reglas de seguridad del chat interno paciente-profesional.
 *
 * - Acceso: solo existe canal entre quienes tienen una cita CONFIRMADA o
 *   REALIZADA (la confirmacion ocurre al pagar).
 * - Privacidad: el contenido va cifrado y no se envia por correo.
 * - Plataforma: se bloquean datos de contacto (correo, telefono, enlaces) para
 *   que la relacion no salga del marketplace.
 * - Crisis: no se bloquea el mensaje; se muestran de inmediato las lineas de ayuda.
 */
import { prisma } from '@/lib/prisma'
import { decrypt, encrypt } from '@/lib/encryption'

export const MAX_MESSAGE_LENGTH = 2000
export const NOTIFY_THROTTLE_MS = 15 * 60 * 1000

/** Estados de cita que habilitan la conversacion. */
const CHAT_ENABLING_STATUSES = ['CONFIRMED', 'COMPLETED'] as const

export async function hasChatEnablingAppointment(patientUserId: string, professionalId: string): Promise<boolean> {
    const appointment = await prisma.appointment.findFirst({
        where: {
            patientId: patientUserId,
            professionalId,
            status: { in: [...CHAT_ENABLING_STATUSES] },
        },
        select: { id: true },
    })
    return appointment != null
}

const EMAIL_RE = /[A-Z0-9._%+-]+\s?(?:@|\(at\)|\[at\])\s?[A-Z0-9.-]+\.[A-Z]{2,}/i
const URL_RE = /(?:https?:\/\/|www\.)\S+/i
// Celular chileno (con o sin +56) o cualquier racha larga de digitos.
const CL_MOBILE_RE = /(?:\+?56[\s-]?)?\b9[\s-]?\d{4}[\s-]?\d{4}\b/
const LONG_DIGITS_RE = /\d{9,}/
const MESSAGING_APP_RE = /\b(whats\s?app|wsp|telegram|instagram|facebook|zoom|meet\.google)\b/i

export function screenMessage(text: string): { ok: true } | { ok: false; reason: string } {
    const compact = text.replace(/[\s.-]/g, '')
    if (EMAIL_RE.test(text) || URL_RE.test(text) || CL_MOBILE_RE.test(text) || LONG_DIGITS_RE.test(compact)) {
        return {
            ok: false,
            reason:
                'Por tu seguridad y para mantener la atención dentro de PsyDoctor, no se pueden compartir correos, teléfonos ni enlaces en el chat.',
        }
    }
    if (MESSAGING_APP_RE.test(text)) {
        return {
            ok: false,
            reason: 'Para mantener la atención dentro de PsyDoctor, no se pueden proponer otras plataformas de contacto.',
        }
    }
    return { ok: true }
}

const CRISIS_RE =
    /(suicid|quitarme la vida|quiero morir|matarme|acabar con (?:mi vida|todo)|no quiero vivir|hacerme da[ñn]o|autolesi|cortarme|me quiero morir)/i

export function detectCrisis(text: string): boolean {
    return CRISIS_RE.test(text)
}

export function encryptMessage(body: string): Buffer {
    return encrypt(body)
}

export function decryptMessage(data: Uint8Array | Buffer): string {
    try {
        return decrypt(Buffer.from(data))
    } catch {
        return '[mensaje no disponible]'
    }
}

/** Resuelve si la persona participa de la conversacion y con que rol. */
export async function getParticipation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            patient: { select: { id: true, name: true, email: true } },
            professional: {
                select: {
                    id: true,
                    userId: true,
                    slug: true,
                    profileImageUrl: true,
                    user: { select: { name: true, email: true } },
                },
            },
        },
    })
    if (!conversation) return null

    if (conversation.patientId === userId) return { conversation, role: 'PATIENT' as const }
    if (conversation.professional.userId === userId) return { conversation, role: 'PROFESSIONAL' as const }
    return null
}
