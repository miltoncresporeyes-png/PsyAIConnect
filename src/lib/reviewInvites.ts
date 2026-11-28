import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { baseUrl, layout } from '@/lib/appointmentPolicy'
import { INVITE_DELAY_MS, INVITE_EXPIRES_MS, INVITE_REMINDER_MS } from '@/lib/reviews'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function sendInviteEmail(appointmentId: string, reminder: boolean): Promise<boolean> {
    const a = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: {
            id: true,
            patient: { select: { email: true, name: true, isActive: true } },
            professional: { select: { user: { select: { name: true } } } },
        },
    })
    if (!a?.patient.email || a.patient.isActive === false) return false
    const prof = esc(a.professional.user.name || 'tu profesional')
    const res = await sendEmail({
        to: a.patient.email,
        subject: reminder ? 'Tu opinión ayuda a otros pacientes' : '¿Cómo fue tu sesión en PsyDoctor?',
        html: layout(
            '¿Cómo fue tu sesión?',
            `<p>Tu sesión con <strong>${prof}</strong> ya terminó. Tu opinión ayuda a otras personas a elegir con confianza.</p>
<p>Son 30 segundos. Tu nombre no se muestra: aparecerás como <em>Paciente verificado</em>. Evalúa el servicio (puntualidad, trato, claridad); no incluyas datos de salud.</p>`,
            'Dejar mi opinión',
            `${baseUrl()}/opinar/${a.id}`
        ),
    })
    return Boolean(res.success)
}

export interface ReviewInviteResult {
    invited: number
    reminded: number
}

/**
 * Cron: invita a opinar 24 h después de una cita COMPLETED (una vez), recuerda a los 3 días
 * si no hubo opinión, y no envía nada después de los 14 días.
 */
export async function runReviewInvites(now = new Date()): Promise<ReviewInviteResult> {
    const result: ReviewInviteResult = { invited: 0, reminded: 0 }

    // 1) Nuevas invitaciones: citas completadas hace entre 24 h y 14 días, sin opinión ni invitación
    const candidates = await prisma.appointment.findMany({
        where: {
            status: 'COMPLETED',
            scheduledAt: { lte: new Date(now.getTime() - INVITE_DELAY_MS), gte: new Date(now.getTime() - INVITE_EXPIRES_MS) },
            review: { is: null },
            reviewInvite: { is: null },
        },
        select: { id: true, scheduledAt: true },
        take: 50,
    })
    for (const c of candidates) {
        const sent = await sendInviteEmail(c.id, false).catch(() => false)
        await prisma.reviewInvite.create({
            data: {
                appointmentId: c.id,
                sentAt: sent ? now : null,
                expiresAt: new Date(c.scheduledAt.getTime() + INVITE_EXPIRES_MS),
            },
        })
        if (sent) result.invited++
    }

    // 2) Recordatorios a los 3 días
    const due = await prisma.reviewInvite.findMany({
        where: {
            reminderAt: null,
            sentAt: { not: null, lte: new Date(now.getTime() - INVITE_REMINDER_MS) },
            expiresAt: { gt: now },
            appointment: { review: { is: null } },
        },
        select: { id: true, appointmentId: true },
        take: 50,
    })
    for (const d of due) {
        const sent = await sendInviteEmail(d.appointmentId, true).catch(() => false)
        await prisma.reviewInvite.update({ where: { id: d.id }, data: { reminderAt: now } })
        if (sent) result.reminded++
    }
    return result
}
