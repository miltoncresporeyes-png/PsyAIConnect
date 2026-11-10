/**
 * Utilidades de RUT chileno. Sin dependencias, para usar igual en cliente y
 * servidor.
 */

/** Deja solo dígitos y K, en mayúscula. "12.345.678-k" -> "12345678K". */
export function cleanRut(value: string): string {
    return value.replace(/[^0-9kK]/g, '').toUpperCase()
}

/** Dígito verificador por módulo 11 para el cuerpo numérico del RUT. */
export function computeRutCheckDigit(body: string): string {
    let sum = 0
    let factor = 2
    for (let i = body.length - 1; i >= 0; i--) {
        sum += Number(body[i]) * factor
        factor = factor === 7 ? 2 : factor + 1
    }
    const remainder = 11 - (sum % 11)
    if (remainder === 11) return '0'
    if (remainder === 10) return 'K'
    return String(remainder)
}

/**
 * Valida largo, formato y dígito verificador (módulo 11).
 * Acepta el RUT con o sin puntos y guion. El cuerpo debe tener 7 u 8 dígitos,
 * que es el rango de personas naturales.
 */
export function isValidRut(value: string): boolean {
    const clean = cleanRut(value)
    if (clean.length < 8 || clean.length > 9) return false

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)

    if (!/^\d+$/.test(body)) return false
    return computeRutCheckDigit(body) === dv
}

/** "123456785" -> "12.345.678-5". Si no tiene forma de RUT, devuelve el texto limpio. */
export function formatRut(value: string): string {
    const clean = cleanRut(value)
    if (clean.length < 2) return clean

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}
