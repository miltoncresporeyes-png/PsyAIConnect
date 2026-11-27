/**
 * Catalogo unico de planes de suscripcion profesional.
 *
 * Es la fuente de verdad de lo que se publica en /planes Y de lo que muestra
 * el panel del profesional, de modo que ambos nunca se contradigan.
 * `status: 'soon'` marca funciones publicadas que aun no estan disponibles:
 * se muestran como "Proximamente" en lugar de prometerlas como activas.
 */

export type PlanTier = 'STARTER' | 'PRO' | 'PREMIUM'
export type FeatureStatus = 'available' | 'soon'

export interface PlanFeature {
    text: string
    status: FeatureStatus
}

export interface PlanDefinition {
    tier: PlanTier
    /** Nombre publico en /planes */
    name: string
    /** Nombre corto para el panel */
    shortName: string
    /** Precio mensual en CLP (0 = sin costo) */
    monthlyPrice: number
    priceLabel: string
    periodLabel: string
    description: string
    features: PlanFeature[]
    cta: string
}

export const PLAN_ORDER: PlanTier[] = ['STARTER', 'PRO', 'PREMIUM']

export const PLANS: Record<PlanTier, PlanDefinition> = {
    STARTER: {
        tier: 'STARTER',
        name: 'PROGRAMA FUNDADORES',
        shortName: 'Fundadores / Inicial',
        monthlyPrice: 0,
        priceLabel: '$0',
        periodLabel: ' por 12 meses',
        description:
            'Programa Fundadores: 12 meses sin costo de suscripción. Luego se aplica el plan vigente, con aviso previo de 60 días.',
        features: [
            { text: '12 meses de suscripción sin costo para los primeros 20 fundadores', status: 'available' },
            { text: 'Insignia de Profesional Fundador y perfil destacado durante el lanzamiento', status: 'available' },
            { text: 'Perfil profesional en el directorio', status: 'available' },
            { text: 'Agenda médica online y fichas clínicas protegidas (Ley N° 20.584)', status: 'available' },
            { text: 'Contacto directo con el equipo para pedir mejoras', status: 'available' },
        ],
        cta: 'Postular como Fundador',
    },
    PRO: {
        tier: 'PRO',
        name: 'PRO',
        shortName: 'PRO',
        monthlyPrice: 29000,
        priceLabel: '$29.000',
        periodLabel: '/ mes',
        description: 'Para profesionales independientes con consulta activa.',
        features: [
            { text: 'Todo lo del plan inicial, más:', status: 'available' },
            { text: 'Citas y agenda online ilimitadas', status: 'available' },
            { text: 'Recordatorios automáticos por WhatsApp y Email (evita no-shows)', status: 'soon' },
            { text: 'Ficha clínica digital protegida (Ley N° 20.584)', status: 'available' },
            { text: 'Teleconsulta integrada de alta definición', status: 'available' },
            { text: 'Sincronización con Google Calendar', status: 'soon' },
            { text: 'Soporte técnico prioritario', status: 'available' },
        ],
        cta: 'Elegir Plan PRO',
    },
    PREMIUM: {
        tier: 'PREMIUM',
        name: 'PREMIUM',
        shortName: 'PREMIUM',
        monthlyPrice: 59000,
        priceLabel: '$59.000',
        periodLabel: '/ mes',
        description: 'Herramientas de automatización total para tu consulta médica.',
        features: [
            { text: 'Todo lo de PRO, más:', status: 'available' },
            { text: 'Emisión automática de boletas de honorarios (Conexión SII Chile)', status: 'soon' },
            { text: 'Múltiples sucursales y ubicaciones', status: 'soon' },
            { text: 'Estadísticas y reportes contables avanzados', status: 'available' },
            { text: 'Priorización y destacado en el directorio', status: 'soon' },
            { text: 'Asistente de onboarding y migración de datos gratis', status: 'available' },
            { text: 'Soporte exclusivo y personalizado 24/7', status: 'soon' },
        ],
        cta: 'Elegir Plan PREMIUM',
    },
}

/**
 * Comision de PsyDoctor sobre el valor de las sesiones: 0. El paciente no paga a la plataforma y el
 * profesional paga solo su suscripcion. La columna Payment.commission se conserva (siempre 0).
 */
export const SESSION_COMMISSION_RATE = 0

export function isPlanTier(value: unknown): value is PlanTier {
    return value === 'STARTER' || value === 'PRO' || value === 'PREMIUM'
}

export interface SubscriptionState {
    tier: PlanTier
    ends: Date | null
}

/**
 * Plan realmente vigente: un plan de pago vencido vuelve al inicial, aunque
 * la columna guarde PRO/PREMIUM. El Plan Inicial no vence.
 */
export function getEffectiveTier(sub: { subscriptionTier: string; subscriptionEnds: Date | null }): PlanTier {
    const tier = isPlanTier(sub.subscriptionTier) ? sub.subscriptionTier : 'STARTER'
    if (tier === 'STARTER') return 'STARTER'
    if (sub.subscriptionEnds && sub.subscriptionEnds.getTime() > Date.now()) return tier
    return 'STARTER'
}

const DAY_MS = 24 * 60 * 60 * 1000
const MONTH_DAYS = 30

/** Ciclos de cobro permitidos: mensual o anual (12 meses pagando solo 10). */
export const BILLING_MONTHS = [1, 12] as const
export type BillingMonths = (typeof BILLING_MONTHS)[number]
export const ANNUAL_MONTHS = 12
export const ANNUAL_BILLED_MONTHS = 10

export function isBillingMonths(value: unknown): value is BillingMonths {
    return value === 1 || value === 12
}

/** Meses que se cobran por un ciclo: el anual incluye 2 meses gratis. */
export function billedMonths(months: number): number {
    return months === ANNUAL_MONTHS ? ANNUAL_BILLED_MONTHS : months
}

/** Precio total de un ciclo (CLP) para un plan de pago. */
export function cyclePrice(tier: PlanTier, months: number): number {
    return PLANS[tier].monthlyPrice * billedMonths(months)
}

/** Ahorro del ciclo anual respecto de pagar mes a mes (CLP). */
export function annualSavings(tier: PlanTier): number {
    return PLANS[tier].monthlyPrice * (ANNUAL_MONTHS - ANNUAL_BILLED_MONTHS)
}

/**
 * Calcula el monto a cobrar y la nueva fecha de termino.
 * - Renovar (mismo plan): se suman `months` a partir del termino vigente.
 * - Escalar (plan mayor): se descuenta como credito el tiempo no usado del plan
 *   actual (prorrateo por dia) y el nuevo plan parte desde hoy.
 */
export function quoteSubscription(args: {
    currentTier: PlanTier
    currentEnds: Date | null
    targetTier: PlanTier
    months: number
    now?: Date
}): { kind: 'RENEW' | 'UPGRADE'; amount: number; credit: number; newEnds: Date } | null {
    const { currentTier, currentEnds, targetTier, months } = args
    const now = args.now ?? new Date()

    if (targetTier === 'STARTER') return null
    const target = PLANS[targetTier]
    const gross = target.monthlyPrice * billedMonths(months)

    const currentIsActivePaid =
        currentTier !== 'STARTER' && currentEnds != null && currentEnds.getTime() > now.getTime()

    if (currentIsActivePaid && currentTier === targetTier) {
        const base = currentEnds as Date
        return {
            kind: 'RENEW',
            amount: gross,
            credit: 0,
            newEnds: new Date(base.getTime() + periodMs(months)),
        }
    }

    if (currentIsActivePaid && PLAN_ORDER.indexOf(targetTier) < PLAN_ORDER.indexOf(currentTier)) {
        // Bajar de plan se hace al terminar el periodo vigente (no hay devolucion).
        return null
    }

    let credit = 0
    if (currentIsActivePaid) {
        const remainingDays = Math.max(0, ((currentEnds as Date).getTime() - now.getTime()) / DAY_MS)
        credit = Math.round((PLANS[currentTier].monthlyPrice / MONTH_DAYS) * remainingDays)
    }

    return {
        kind: currentIsActivePaid ? 'UPGRADE' : 'RENEW',
        amount: Math.max(0, gross - credit),
        credit,
        newEnds: new Date(now.getTime() + periodMs(months)),
    }
}

/** Duracion de un ciclo: el anual dura 365 dias reales; el mensual, 30. */
function periodMs(months: number): number {
    return months === ANNUAL_MONTHS ? 365 * DAY_MS : months * MONTH_DAYS * DAY_MS
}
