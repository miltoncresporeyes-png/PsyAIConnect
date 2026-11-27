/**
 * Reglas anti no-show (Fase 1).
 *
 * Flujo: el paciente solicita (PENDING, acepta politica) -> el profesional acepta
 * (CONFIRMED) -> 24h antes el paciente debe reconfirmar -> si no reconfirma, el
 * horario se libera unas horas antes -> si no se conecta, el profesional marca
 * NO_SHOW con evidencia y sube la reputacion negativa del paciente.
 *
 * PsyDoctor no intermedia el pago en esta etapa: el cobro lo coordina el profesional.
 */
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { appointmentToEvent, buildGoogleCalendarUrl } from '@/lib/calendarLinks'

/** Un paciente nuevo (sin sesiones completadas) solo puede tener esta cantidad de citas futuras activas. */
export const MAX_UPCOMING_FOR_NEW_PATIENT = 1
/** Desde esta cantidad de inasistencias se bloquean nuevas reservas. */
export const NO_SHOW_BLOCK_THRESHOLD = 3
/** Desde esta cantidad se advierte al profesional al aceptar la cita. */
export const NO_SHOW_WARN_THRESHOLD = 2
/** Horas antes de la cita en que se pide reconfirmar. */
export const RECONFIRM_WINDOW_HOURS = 24
/** Si no hay reconfirmacion, el horario se libera a estas horas de la cita. */
export const AUTO_RELEASE_HOURS = 3
/** Minutos que el profesional debe esperar antes de poder marcar inasistencia. */
export const NO_SHOW_WAIT_MINUTES = 15
/** Si el profesional no responde y faltan menos de estas horas, la solicitud caduca. */
export const PENDING_EXPIRE_HOURS = 2

const HOUR = 60 * 60 * 1000

function baseUrl() {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

function fmtDate(d: Date) {
    const s = d.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'America/Santiago',
    })
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function fmtTime(d: Date) {
    return d.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Santiago',
    })
}

function layout(title: string, body: string, ctaLabel?: string, ctaUrl?: string) {
    const cta =
        ctaLabel && ctaUrl
            ? `<p style="margin:24px 0"><a href="${ctaUrl}" style="background:#0f766e;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">${ctaLabel}</a></p>`
            : ''
    return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
<h2 style="color:#0f766e">${title}</h2>${body}${cta}
<p style="font-size:12px;color:#6b7280;margin-top:32px">PsyDoctor · Si necesitas ayuda escribe a contacto@psydoctor.cl</p></div>`
}

async function loadAppointment(id: string) {
    return prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: { select: { name: true, email: true, noShowCount: true } },
            professional: { include: { user: { select: { name: true, email: true } } } },
        },
    })
}

export async function notifyProfessionalNewRequest(appointmentId: string) {
    const a = await loadAppointment(appointmentId)
    if (!a?.professional.user.email) return
    const when = `${fmtDate(a.scheduledAt)} a las ${fmtTime(a.scheduledAt)} hrs`
    await sendEmail({
        to: a.professional.user.email,
        subject: 'Nueva solicitud de cita en PsyDoctor',
        html: layout(
            'Tienes una nueva solicitud de cita',
            `<p><strong>${a.patient.name || 'Un paciente'}</strong> solicitó una sesión para <strong>${when}</strong>.</p>
<p>Acepta o rechaza la solicitud para liberar o confirmar ese horario. Si no respondes antes de la hora, la solicitud caduca.</p>`,
            'Revisar solicitud',
            `${baseUrl()}/dashboard/citas`
        ),
    })
}

export async function notifyPatientDecision(appointmentId: string, accepted: boolean, reason?: string) {
    const a = await loadAppointment(appointmentId)
    if (!a?.patient.email) return
    const prof = a.professional.user.name || 'tu profesional'
    const when = `${fmtDate(a.scheduledAt)} a las ${fmtTime(a.scheduledAt)} hrs`
    if (accepted) {
        const calendarUrl = buildGoogleCalendarUrl(
            appointmentToEvent({
                appointmentId: a.id,
                scheduledAt: a.scheduledAt,
                durationMin: a.duration,
                modality: a.modality,
                otherPartyName: a.professional.user.name,
                baseUrl: baseUrl(),
                officeAddress: a.professional.officeAddress,
            })
        )
        await sendEmail({
            to: a.patient.email,
            subject: 'Tu cita fue confirmada',
            html: layout(
                'Cita confirmada',
                `<p><strong>${prof}</strong> aceptó tu cita del <strong>${when}</strong>.</p>
<p>El pago lo coordinas directamente con el profesional. Te enviaremos un recordatorio 24 horas antes y te pediremos reconfirmar tu asistencia.</p>
<p><a href="${calendarUrl}" style="color:#0f766e">Agregar a Google Calendar</a></p>`,
                'Ver mis citas',
                `${baseUrl()}/dashboard/citas`
            ),
        })
    } else {
        await sendEmail({
            to: a.patient.email,
            subject: 'Tu solicitud de cita no pudo ser aceptada',
            html: layout(
                'Solicitud no aceptada',
                `<p><strong>${prof}</strong> no pudo atender la sesión del <strong>${when}</strong>${reason ? `: ${reason}` : '.'}</p>
<p>Puedes elegir otro horario u otro profesional.</p>`,
                'Buscar otro horario',
                `${baseUrl()}/buscar`
            ),
        })
    }
}

/** Reconfirmacion no requerida si la cita se acepta con menos de 24h de anticipacion. */
export function needsReconfirmation(scheduledAt: Date, now = new Date()) {
    return scheduledAt.getTime() - now.getTime() > RECONFIRM_WINDOW_HOURS * HOUR
}

/** Un paciente puede marcarse inasistente solo pasados NO_SHOW_WAIT_MINUTES desde la hora de inicio. */
export function canMarkNoShow(scheduledAt: Date, now = new Date()) {
    return now.getTime() >= scheduledAt.getTime() + NO_SHOW_WAIT_MINUTES * 60 * 1000
}

export interface ReminderCycleResult {
    reminded24h: number
    reminded2h: number
    released: number
    expiredPending: number
}

/** Ciclo periodico (cron): recordatorios, liberacion de horarios sin reconfirmar y caducidad de solicitudes. */
export async function runReminderCycle(now = new Date()): Promise<ReminderCycleResult> {
    const result: ReminderCycleResult = { reminded24h: 0, reminded2h: 0, released: 0, expiredPending: 0 }
    const url = `${baseUrl()}/dashboard/citas`

    // 1) Solicitudes sin respuesta del profesional que ya estan muy cerca
    const stalePending = await prisma.appointment.findMany({
        where: { status: 'PENDING', scheduledAt: { lt: new Date(now.getTime() + PENDING_EXPIRE_HOURS * HOUR) } },
        select: { id: true },
    })
    for (const { id } of stalePending) {
        await prisma.appointment.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: now,
                cancelledBy: 'SYSTEM',
                cancellationReason: 'El profesional no respondió a tiempo',
            },
        })
        await notifyPatientDecision(id, false, 'no alcanzó a responder la solicitud').catch(() => {})
        result.expiredPending++
    }

    // 2) Liberar horarios sin reconfirmacion
    const toRelease = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            patientReconfirmedAt: null,
            scheduledAt: { gt: now, lt: new Date(now.getTime() + AUTO_RELEASE_HOURS * HOUR) },
        },
        select: { id: true },
    })
    for (const { id } of toRelease) {
        await prisma.appointment.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: now,
                cancelledBy: 'SYSTEM',
                cancellationReason: 'Sin reconfirmación del paciente',
            },
        })
        const a = await loadAppointment(id)
        if (a) {
            const when = `${fmtDate(a.scheduledAt)} a las ${fmtTime(a.scheduledAt)} hrs`
            await sendEmail({
                to: a.patient.email,
                subject: 'Tu cita fue liberada por falta de reconfirmación',
                html: layout(
                    'Cita liberada',
                    `<p>Tu cita del <strong>${when}</strong> con ${a.professional.user.name || 'tu profesional'} se liberó porque no la reconfirmaste.</p>`,
                    'Reservar nuevamente',
                    `${baseUrl()}/buscar`
                ),
            }).catch(() => {})
            if (a.professional.user.email) {
                await sendEmail({
                    to: a.professional.user.email,
                    subject: 'Horario liberado en tu agenda',
                    html: layout(
                        'Horario liberado',
                        `<p>El paciente no reconfirmó la cita del <strong>${when}</strong>, por lo que el horario quedó disponible nuevamente.</p>`
                    ),
                }).catch(() => {})
            }
        }
        result.released++
    }

    // 3) Recordatorio de 24h (con reconfirmacion)
    const due24 = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            reminder24hSentAt: null,
            scheduledAt: { gt: now, lte: new Date(now.getTime() + RECONFIRM_WINDOW_HOURS * HOUR) },
        },
        select: { id: true, patientReconfirmedAt: true },
    })
    for (const { id, patientReconfirmedAt } of due24) {
        const a = await loadAppointment(id)
        if (!a) continue
        const when = `${fmtDate(a.scheduledAt)} a las ${fmtTime(a.scheduledAt)} hrs`
        await sendEmail({
            to: a.patient.email,
            subject: patientReconfirmedAt ? 'Recordatorio de tu cita de mañana' : 'Reconfirma tu cita',
            html: layout(
                patientReconfirmedAt ? 'Tu cita es pronto' : 'Reconfirma tu asistencia',
                `<p>Tienes una sesión con <strong>${a.professional.user.name || 'tu profesional'}</strong>: <strong>${when}</strong>.</p>
${
    patientReconfirmedAt
        ? ''
        : `<p>Para mantener tu horario debes reconfirmar. Si no lo haces, el horario se liberará ${AUTO_RELEASE_HOURS} horas antes de la cita.</p>`
}`,
                patientReconfirmedAt ? 'Ver mi cita' : 'Reconfirmar asistencia',
                url
            ),
        }).catch(() => {})
        await prisma.appointment.update({ where: { id }, data: { reminder24hSentAt: now } })
        result.reminded24h++
    }

    // 4) Recordatorio de 2h con enlace a la sala
    const due2 = await prisma.appointment.findMany({
        where: {
            status: 'CONFIRMED',
            reminder2hSentAt: null,
            patientReconfirmedAt: { not: null },
            scheduledAt: { gt: now, lte: new Date(now.getTime() + 2 * HOUR) },
        },
        select: { id: true, modality: true },
    })
    for (const { id, modality } of due2) {
        const a = await loadAppointment(id)
        if (!a) continue
        const link = modality === 'ONLINE' ? `${baseUrl()}/dashboard/citas/${id}` : url
        await sendEmail({
            to: a.patient.email,
            subject: 'Tu cita comienza en 2 horas',
            html: layout(
                'Tu sesión comienza pronto',
                `<p>Hoy a las <strong>${fmtTime(a.scheduledAt)} hrs</strong> tienes sesión con ${a.professional.user.name || 'tu profesional'}.</p>
<p>Conéctate unos minutos antes. Si no te conectas, el profesional podrá registrar tu inasistencia.</p>`,
                modality === 'ONLINE' ? 'Unirme a la sesión' : 'Ver mi cita',
                link
            ),
        }).catch(() => {})
        await prisma.appointment.update({ where: { id }, data: { reminder2hSentAt: now } })
        result.reminded2h++
    }

    return result
}
