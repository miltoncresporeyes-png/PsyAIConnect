import { generateSlots } from '@/lib/slots'

const day = new Date(2026, 11, 1) // 1 dic 2026, 00:00 local
const past = new Date(2026, 10, 1)
const at = (h: number, m = 0) => new Date(2026, 11, 1, h, m)

describe('generateSlots', () => {
    const windows = [{ startTime: '09:00', endTime: '13:00' }]

    it('usa bloques de la duración real (50 min)', () => {
        expect(generateSlots({ day, windows, durationMin: 50, busy: [], now: past })).toEqual([
            '09:00',
            '09:50',
            '10:40',
            '11:30',
        ])
    })

    it('con 60 min salen bloques horarios y el último debe caber', () => {
        expect(generateSlots({ day, windows, durationMin: 60, busy: [], now: past })).toEqual([
            '09:00',
            '10:00',
            '11:00',
            '12:00',
        ])
    })

    it('con 45 min no ofrece un bloque que se pase del término de la ventana', () => {
        const slots = generateSlots({
            day,
            windows: [{ startTime: '09:00', endTime: '10:30' }],
            durationMin: 45,
            busy: [],
            now: past,
        })
        expect(slots).toEqual(['09:00', '09:45'])
    })

    it('un horario ocupado no aparece y los libres sí', () => {
        const busy = [{ scheduledAt: at(9, 50), duration: 50 }]
        const slots = generateSlots({ day, windows, durationMin: 50, busy, now: past })
        expect(slots).not.toContain('09:50')
        expect(slots).toContain('10:40')
        expect(slots).toContain('11:30')
    })

    it('descarta horarios que ya pasaron cuando la fecha es hoy', () => {
        expect(generateSlots({ day, windows, durationMin: 50, busy: [], now: at(10, 0) })).toEqual(['10:40', '11:30'])
    })

    it('combina varias ventanas del día en orden', () => {
        const two = [
            { startTime: '15:00', endTime: '16:40' },
            { startTime: '09:00', endTime: '09:50' },
        ]
        expect(generateSlots({ day, windows: two, durationMin: 50, busy: [], now: past })).toEqual([
            '09:00',
            '15:00',
            '15:50',
        ])
    })
})
