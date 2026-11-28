import { sendEmail } from '@/lib/email'
import { TICKET_TYPE_LABELS, type TicketTypeValue } from '@/lib/tickets'

function esc(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

/**
 * Avisa a los administradores de un ticket nuevo. El texto del usuario se escapa y se acorta
 * (el detalle completo se lee en el panel, donde corresponde). Nunca lanza.
 */
export async function notifyAdminsNewTicket(ticket: {
    id: string
    number: number
    type: TicketTypeValue
    subject: string
    message: string
    contactEmail: string | null
    userRole: string | null
}) {
    try {
        const to = process.env.ADMIN_ALERT_EMAIL || 'contacto@psydoctor.cl'
        const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
        const preview = ticket.message.length > 400 ? `${ticket.message.slice(0, 400)}…` : ticket.message
        const who = ticket.contactEmail ? esc(ticket.contactEmail) : 'sin correo'
        const role = ticket.userRole === 'PROFESSIONAL' ? 'Profesional' : ticket.userRole === 'PATIENT' ? 'Paciente' : 'Visitante'

        await sendEmail({
            to,
            subject: `Nuevo ticket #${ticket.number} (${TICKET_TYPE_LABELS[ticket.type]}): ${ticket.subject.slice(0, 80)}`,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
<h2 style="color:#0f766e">Nuevo ticket #${ticket.number}</h2>
<p><strong>${esc(TICKET_TYPE_LABELS[ticket.type])}</strong> · ${role} · ${who}</p>
<p style="font-size:16px"><strong>${esc(ticket.subject)}</strong></p>
<p style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px">${esc(preview)}</p>
<p><a href="${base}/admin/tickets/${ticket.id}" style="background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Abrir en el panel</a></p>
</div>`,
        })
    } catch (error) {
        console.error('[tickets] no se pudo avisar a los administradores:', error)
    }
}
