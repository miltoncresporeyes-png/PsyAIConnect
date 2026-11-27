/**
 * Enlaces para agregar una cita al calendario (Google Calendar y archivo .ics).
 * No requiere OAuth ni permisos: es un enlace de plantilla / un archivo que el usuario importa.
 *
 * Privacidad: el evento NO incluye el motivo de consulta ni el enlace privado de la videollamada
 * (ese se entrega solo dentro de PsyDoctor, en la ventana de la cita).
 */

export interface CalendarEventInput {
    appointmentId: string
    title: string
    start: Date
    durationMin: number
    /** Texto del evento (sin datos clinicos). */
    description: string
    /** Direccion si es presencial; vacio si es online. */
    location?: string
}

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

/** Fecha en formato UTC compacto: 20261127T014200Z */
export function toCalendarDate(d: Date): string {
    return (
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
        `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
    )
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
    const end = new Date(event.start.getTime() + event.durationMin * 60000)
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${toCalendarDate(event.start)}/${toCalendarDate(end)}`,
        details: event.description,
    })
    if (event.location) params.set('location', event.location)
    return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Escapa texto segun RFC 5545. */
function icsEscape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Pliega lineas a 75 octetos como pide RFC 5545 (aprox. por caracteres). */
function fold(line: string): string {
    if (line.length <= 73) return line
    const parts: string[] = []
    let rest = line
    parts.push(rest.slice(0, 73))
    rest = rest.slice(73)
    while (rest.length > 0) {
        parts.push(' ' + rest.slice(0, 72))
        rest = rest.slice(72)
    }
    return parts.join('\r\n')
}

export function buildIcs(event: CalendarEventInput, now = new Date()): string {
    const end = new Date(event.start.getTime() + event.durationMin * 60000)
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PsyDoctor//Citas//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${event.appointmentId}@psydoctor.cl`,
        `DTSTAMP:${toCalendarDate(now)}`,
        `DTSTART:${toCalendarDate(event.start)}`,
        `DTEND:${toCalendarDate(end)}`,
        `SUMMARY:${icsEscape(event.title)}`,
        `DESCRIPTION:${icsEscape(event.description)}`,
        ...(event.location ? [`LOCATION:${icsEscape(event.location)}`] : []),
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Tu sesión comienza en 30 minutos',
        'TRIGGER:-PT30M',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ]
    return lines.map(fold).join('\r\n') + '\r\n'
}

/** Arma el evento de una cita para quien la ve (paciente o profesional). */
export function appointmentToEvent(args: {
    appointmentId: string
    scheduledAt: Date
    durationMin: number
    modality: string
    otherPartyName: string | null
    baseUrl: string
    officeAddress?: string | null
}): CalendarEventInput {
    const who = (args.otherPartyName || '').trim().split(/\s+/)[0]
    const detailUrl = `${args.baseUrl.replace(/\/$/, '')}/dashboard/citas/${args.appointmentId}`
    const online = args.modality === 'ONLINE'
    return {
        appointmentId: args.appointmentId,
        title: who ? `Sesión PsyDoctor con ${who}` : 'Sesión PsyDoctor',
        start: args.scheduledAt,
        durationMin: args.durationMin,
        description:
            (online
                ? `Sesión online. Conéctate desde PsyDoctor (se habilita 15 minutos antes): ${detailUrl}`
                : `Sesión presencial. Detalle de la cita: ${detailUrl}`) +
            '\nReprograma o cancela con al menos 24 horas de anticipación.',
        location: online ? undefined : args.officeAddress || undefined,
    }
}
