export const FOUNDER_SLOTS = 20
export const FOUNDER_TIER = 'PRO' as const

/** Primer cupo libre entre 1 y FOUNDER_SLOTS, o null si están todos ocupados. */
export function firstFreeSlot(taken: readonly (number | null)[], total = FOUNDER_SLOTS): number | null {
    const used = new Set(taken.filter((n): n is number => typeof n === 'number'))
    for (let n = 1; n <= total; n++) if (!used.has(n)) return n
    return null
}

/** Fin del beneficio: 12 meses desde el inicio. */
export function founderBenefitEnd(start: Date): Date {
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1)
    return end
}
