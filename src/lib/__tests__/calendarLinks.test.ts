import { appointmentToEvent, buildGoogleCalendarUrl, buildIcs, toCalendarDate } from '@/lib/calendarLinks'

const base = {
    appointmentId: 'abc123',
    scheduledAt: new Date('2026-11-27T01:42:00Z'),
    durationMin: 50,
    modality: 'ONLINE',
    otherPartyName: 'pedro pablo mero',
    baseUrl: 'https://psydoctor.cl/',
}

describe('calendarLinks', () => {
    it('formatea fechas en UTC compacto', () => {
        expect(toCalendarDate(new Date('2026-11-27T01:42:05Z'))).toBe('20261127T014205Z')
    })

    it('arma el evento sin datos clinicos ni enlace de la videollamada', () => {
        const ev = appointmentToEvent(base)
        expect(ev.title).toBe('Sesión PsyDoctor con pedro')
        expect(ev.description).toContain('https://psydoctor.cl/dashboard/citas/abc123')
        expect(ev.description).not.toMatch(/meet\.google|zoom\.us/i)
        expect(ev.location).toBeUndefined()
    })

    it('usa la direccion solo si es presencial', () => {
        const ev = appointmentToEvent({ ...base, modality: 'IN_PERSON', officeAddress: 'Av. Providencia 123' })
        expect(ev.location).toBe('Av. Providencia 123')
    })

    it('genera el enlace de Google Calendar con inicio y termino', () => {
        const url = new URL(buildGoogleCalendarUrl(appointmentToEvent(base)))
        expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render')
        expect(url.searchParams.get('action')).toBe('TEMPLATE')
        expect(url.searchParams.get('dates')).toBe('20261127T014200Z/20261127T023200Z')
    })

    it('genera un .ics valido con escapes y saltos CRLF', () => {
        const ics = buildIcs(
            { ...appointmentToEvent(base), description: 'Línea 1; con coma, y\nsalto' },
            new Date('2026-11-26T00:00:00Z')
        )
        expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
        expect(ics).toContain('UID:abc123@psydoctor.cl')
        expect(ics).toContain('DTSTART:20261127T014200Z')
        expect(ics).toContain('DTEND:20261127T023200Z')
        expect(ics).toContain('\;')
        expect(ics).toContain('\n')
        expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    })
})
