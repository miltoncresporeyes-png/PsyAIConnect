import { isWithinJoinWindow, normalizeMeetingUrl, redactMeetingLinks } from '@/lib/meetingLink'

describe('normalizeMeetingUrl', () => {
    it('acepta Meet, Zoom y Teams', () => {
        expect(normalizeMeetingUrl('https://meet.google.com/abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij')
        expect(normalizeMeetingUrl('meet.google.com/abc-defg-hij')).toBe('https://meet.google.com/abc-defg-hij')
        expect(normalizeMeetingUrl('https://us02web.zoom.us/j/123456789?pwd=x')).toContain('zoom.us/j/123456789')
        expect(normalizeMeetingUrl('https://teams.microsoft.com/l/meetup-join/abc')).not.toBeNull()
    })

    it('rechaza dominios ajenos, http, credenciales y enlaces sin sala', () => {
        expect(normalizeMeetingUrl('https://evil.com/abc')).toBeNull()
        expect(normalizeMeetingUrl('https://meet.google.com.evil.com/abc-defg-hij')).toBeNull()
        expect(normalizeMeetingUrl('http://meet.google.com/abc-defg-hij')).toBeNull()
        expect(normalizeMeetingUrl('https://user:pass@meet.google.com/abc-defg-hij')).toBeNull()
        expect(normalizeMeetingUrl('https://meet.google.com')).toBeNull()
        expect(normalizeMeetingUrl('')).toBeNull()
        expect(normalizeMeetingUrl('no es un enlace')).toBeNull()
    })
})

describe('isWithinJoinWindow', () => {
    const start = new Date('2026-12-01T15:00:00Z')
    it('abre 15 min antes y cierra 30 min despues del termino', () => {
        expect(isWithinJoinWindow(start, 50, new Date('2026-12-01T14:44:00Z'))).toBe(false)
        expect(isWithinJoinWindow(start, 50, new Date('2026-12-01T14:46:00Z'))).toBe(true)
        expect(isWithinJoinWindow(start, 50, new Date('2026-12-01T16:19:00Z'))).toBe(true)
        expect(isWithinJoinWindow(start, 50, new Date('2026-12-01T16:21:00Z'))).toBe(false)
    })
})

describe('redactMeetingLinks', () => {
    const apt = { videoLink: 'https://meet.google.com/x', professional: { meetingUrl: 'https://meet.google.com/y', id: 'p' } }
    it('oculta los enlaces al paciente y los mantiene para el profesional', () => {
        const patientView = redactMeetingLinks(apt, false)
        expect(patientView.videoLink).toBeNull()
        expect((patientView.professional as { meetingUrl: string | null }).meetingUrl).toBeNull()
        expect((patientView.professional as { id: string }).id).toBe('p')
        expect(redactMeetingLinks(apt, true)).toBe(apt)
    })
})
