/**
 * Formatos de números en es-CL. Fuente única: no uses `toLocaleString('es-CL')` suelto
 * ni crees otro formateador de pesos.
 */
const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('es-CL')

/** Pesos chilenos: `$50.000`. Valores vacíos se muestran como `$0`. */
export const formatCLP = (n: number | null | undefined): string => clp.format(n ?? 0)

/** Número con separador de miles: `1.250`. */
export const formatNumber = (n: number | null | undefined): string => num.format(n ?? 0)

/** Porcentaje con un decimal: `12,5 %`; `—` si no hay dato. */
export function formatPercent(n: number | null | undefined, digits = 1): string {
    if (n == null) return '—'
    return `${n.toLocaleString('es-CL', { maximumFractionDigits: digits })} %`
}
