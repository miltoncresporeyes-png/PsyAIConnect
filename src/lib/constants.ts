/**
 * PsyConnect Global Constants
 * Single Source of Truth for application-wide configuration
 */

// ============================================
// Emergency & Crisis Contacts
// ============================================
export const EMERGENCY_CONTACTS = {
    saludResponde: {
        phone: '600360777',
        display: '600 360 7777',
        description: 'Salud Responde (24/7)',
        detail: 'Orientación en salud mental (gratuita)',
    },
    todoMejora: {
        phone: '56950632777',
        display: '+56 9 5063 2777',
        description: 'Todo Mejora (LGBTIQ+)',
        detail: 'WhatsApp de apoyo emocional',
    },
    samu: {
        phone: '131',
        display: '131',
        description: 'Urgencias médicas',
        detail: 'SAMU - Servicio de Atención Médica de Urgencia',
    },
} as const

// ============================================
// Pricing Plans
// ============================================
export const PRICING = {
    free: {
        name: 'Plan Inicial',
        monthly: 0,
        maxPatients: 10,
        maxInvoices: 10,
        description: 'Perfecto para comenzar',
    },
    professional: {
        name: 'Plan Profesional',
        monthly: 29990,
        unlimited: true,
        description: 'Para profesionales establecidos',
    },
} as const

// ============================================
// Payment Methods (Chilean Market)
// ============================================
export const PAYMENT_METHODS = [
    {
        name: 'Visa',
        code: 'visa',
        acceptsCredit: true,
        acceptsDebit: true,
    },
    {
        name: 'Mastercard',
        code: 'mastercard',
        acceptsCredit: true,
        acceptsDebit: true,
    },
    {
        name: 'American Express',
        code: 'amex',
        acceptsCredit: true,
        acceptsDebit: false,
    },
    {
        name: 'Webpay Plus',
        code: 'webpay',
        description: 'Estándar chileno de pagos en línea',
    },
] as const

// ============================================
// Platform Statistics
// ============================================
export const PLATFORM_STATS = {
    professionals: 500,
    patientsInTreatment: 2000,
    continuationRate: 94, // %
    averageNewPatientsPerMonth: 8,
    professionalRetentionRate: 94, // % después del primer mes
} as const

// ============================================
// Time Savings Calculation (for professionals)
// ============================================
export const TIME_SAVINGS = {
    manualInvoicing: {
        hoursPerMonth: 3,
        description: 'Generación manual de boletas',
    },
    accounting: {
        hoursPerMonth: 2,
        description: 'Preparación de informes contables',
    },
    paymentTracking: {
        hoursPerMonth: 1.5,
        description: 'Seguimiento de pagos',
    },
    agendaManagement: {
        hoursPerMonth: 2,
        description: 'Gestión de agenda manual',
    },
    totalSaved: {
        hoursPerMonth: 6.5,
        description: 'Total recuperado con PsyConnect',
    },
} as const

// Helper function to calculate monetary value of saved time
export function calculateTimeSavings(hourlyRate: number) {
    const { totalSaved } = TIME_SAVINGS
    const monthlySavings = hourlyRate * totalSaved.hoursPerMonth
    const annualSavings = monthlySavings * 12

    return {
        monthly: monthlySavings,
        annual: annualSavings,
        hours: totalSaved.hoursPerMonth,
    }
}

// Example: Professional charging $35,000 per 50-min session (0.83 hours)
// Hourly rate ≈ $42,000
// Monthly savings ≈ $273,000
// Annual savings ≈ $3,276,000

// ============================================
// Legal & Compliance
// ============================================
export const LEGAL = {
    privacyLaw: {
        code: '19.628',
        name: 'Ley de Protección de Datos Personales',
    },
    patientRightsLaw: {
        code: '20.584',
        name: 'Ley de Derechos y Deberes del Paciente',
    },
    encryption: {
        standard: 'AES-256',
        description: 'Encriptación extremo-a-extremo',
    },
} as const

// ============================================
// Contact Information
// ============================================
export const CONTACT = {
    support: 'contacto@psyconnect.cl',
    legal: 'legal@psyconnect.cl',
    privacy: 'privacidad@psyconnect.cl',
    phone: '+56 9 XXXX XXXX', // TODO: Actualizar con número real
} as const

// ============================================
// Feature Flags (for gradual rollout)
// ============================================
export const FEATURES = {
    clinicalConsent: true,
    emergencyButton: true,
    miCaminoTimeline: true,
    automaticInvoicing: false, // TODO: Enable when SII integration is ready
    isapreFonasaReimbursement: false, // TODO: Enable when integration is ready
} as const
