/**
 * Normaliza un correo para comparar y almacenar: sin espacios y en minúsculas.
 * Evita cuentas duplicadas por mayúsculas (A@x.com vs a@x.com).
 */
export function normalizeEmail(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
