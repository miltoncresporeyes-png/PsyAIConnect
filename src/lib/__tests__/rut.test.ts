import { cleanRut, computeRutCheckDigit, formatRut, isValidRut } from '@/lib/rut'

describe('rut', () => {
    describe('computeRutCheckDigit (módulo 11)', () => {
        it.each([
            ['12345678', '5'],
            ['11111111', '1'],
            ['76086428', '5'],
            ['10000013', 'K'],
            ['0', '0'],
        ])('cuerpo %s -> dígito %s', (body, dv) => {
            expect(computeRutCheckDigit(body)).toBe(dv)
        })
    })

    describe('isValidRut', () => {
        it('acepta RUT válidos con y sin formato', () => {
            expect(isValidRut('12.345.678-5')).toBe(true)
            expect(isValidRut('12345678-5')).toBe(true)
            expect(isValidRut('123456785')).toBe(true)
            expect(isValidRut('11.111.111-1')).toBe(true)
        })

        it('acepta dígito verificador K en mayúscula o minúscula', () => {
            expect(isValidRut('10.000.013-K')).toBe(true)
            expect(isValidRut('10000013-k')).toBe(true)
        })

        it('rechaza dígito verificador incorrecto', () => {
            expect(isValidRut('12.345.678-9')).toBe(false)
            expect(isValidRut('12.345.678-K')).toBe(false)
            expect(isValidRut('10.000.013-0')).toBe(false)
        })

        it('rechaza largos y formatos imposibles', () => {
            expect(isValidRut('')).toBe(false)
            expect(isValidRut('1-9')).toBe(false)
            expect(isValidRut('123-4')).toBe(false)
            expect(isValidRut('1234567890-1')).toBe(false)
            expect(isValidRut('abcdefgh-1')).toBe(false)
        })
    })

    describe('formatRut / cleanRut', () => {
        it('formatea con puntos y guion', () => {
            expect(formatRut('123456785')).toBe('12.345.678-5')
            expect(formatRut('12345678k')).toBe('12.345.678-K')
            expect(formatRut('7654321-6')).toBe('7.654.321-6')
        })

        it('limpia símbolos y normaliza la K', () => {
            expect(cleanRut(' 12.345.678-k ')).toBe('12345678K')
        })
    })
})
