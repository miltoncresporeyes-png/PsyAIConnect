import { firstFreeSlot, founderBenefitEnd } from '../founders'

describe('founders', () => {
    it('asigna el primer cupo libre y reutiliza huecos', () => {
        expect(firstFreeSlot([])).toBe(1)
        expect(firstFreeSlot([1, 2, 4])).toBe(3)
        expect(firstFreeSlot([null, 2])).toBe(1)
    })
    it('devuelve null con los 20 cupos ocupados', () => {
        expect(firstFreeSlot(Array.from({ length: 20 }, (_, i) => i + 1))).toBeNull()
    })
    it('el beneficio dura 12 meses', () => {
        expect(founderBenefitEnd(new Date('2026-11-27T10:00:00Z')).toISOString()).toBe('2027-11-27T10:00:00.000Z')
    })
})
