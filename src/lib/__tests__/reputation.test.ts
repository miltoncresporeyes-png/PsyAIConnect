import { attendanceRate, bayesianScore, computeTier, medianHours, reviewWeight, shouldShowScore } from '../reputation'
import { moderateComment } from '../reviews'

const now = new Date('2026-12-01T12:00:00Z')
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

describe('puntuación bayesiana', () => {
    it('sin opiniones no hay nota', () => {
        expect(bayesianScore([], now)).toBeNull()
    })
    it('una sola opinión de 5★ no supera a 40 de 4,8', () => {
        const one = bayesianScore([{ rating: 5, createdAt: daysAgo(1) }], now)!
        const many = bayesianScore(Array.from({ length: 40 }, () => ({ rating: 5, createdAt: daysAgo(1) })).map((r, i) => ({ ...r, rating: i < 32 ? 5 : 4 })), now)!
        expect(many).toBeGreaterThan(one)
    })
    it('las opiniones de más de 6 meses pesan la mitad y las de más de 12 no cuentan', () => {
        expect(reviewWeight(daysAgo(10), now)).toBe(1)
        expect(reviewWeight(daysAgo(200), now)).toBe(0.5)
        expect(reviewWeight(daysAgo(400), now)).toBe(0)
    })
})

describe('niveles', () => {
    it('Nuevo sin nota o con pocas opiniones', () => {
        expect(computeTier(0, null, null)).toBe('NEW')
        expect(computeTier(3, 4.9, 1)).toBe('NEW')
    })
    it('Confiable, Destacado y Excelencia según umbrales', () => {
        expect(computeTier(5, 4.4, null)).toBe('TRUSTED')
        expect(computeTier(15, 4.6, 0.96)).toBe('OUTSTANDING')
        expect(computeTier(40, 4.85, 0.98, 12)).toBe('EXCELLENCE')
    })
    it('mala asistencia impide subir de Confiable', () => {
        expect(computeTier(40, 4.9, 0.8)).toBe('TRUSTED')
    })
    it('Excelencia exige responder en 24 h o menos (y dato conocido)', () => {
        expect(computeTier(40, 4.85, 0.98, 30)).toBe('OUTSTANDING')
        expect(computeTier(40, 4.85, 0.98, null)).toBe('OUTSTANDING')
    })
    it('mediana de horas', () => {
        expect(medianHours([])).toBeNull()
        expect(medianHours([5, 1, 3])).toBe(3)
        expect(medianHours([1, 3, 5, 7])).toBe(4)
    })
    it('asistencia y visibilidad de la nota', () => {
        expect(attendanceRate(0, 0)).toBeNull()
        expect(attendanceRate(20, 1)).toBeCloseTo(0.95)
        expect(shouldShowScore(4)).toBe(false)
        expect(shouldShowScore(5)).toBe(true)
    })
})

describe('moderación automática', () => {
    it('publica sin comentario y comentarios limpios', () => {
        expect(moderateComment(undefined).status).toBe('PUBLISHED')
        expect(moderateComment('Muy puntual y clara en las explicaciones').status).toBe('PUBLISHED')
    })
    it('envía a revisión datos de contacto, insultos, crisis y contenido clínico', () => {
        expect(moderateComment('escríbeme a juan@correo.cl').status).toBe('PENDING_REVIEW')
        expect(moderateComment('es una idiota').status).toBe('PENDING_REVIEW')
        expect(moderateComment('a veces quiero morir').status).toBe('PENDING_REVIEW')
        expect(moderateComment('me diagnosticó bipolar').status).toBe('PENDING_REVIEW')
    })
})
