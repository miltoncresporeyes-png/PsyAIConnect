/**
 * Formas de pago que un profesional puede ofrecer a sus pacientes.
 * PsyDoctor no intermedia el cobro en esta etapa: el profesional define como cobra.
 * En la base se guardan los IDs (Professional.acceptedPaymentMethods).
 */
export interface PaymentMethodOption {
    id: string
    label: string
    hint: string
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
    { id: 'TRANSFER', label: 'Transferencia bancaria', hint: 'Los datos de la cuenta se entregan al confirmar la cita' },
    { id: 'DEBIT', label: 'Tarjeta de débito', hint: 'Redcompra en consulta o link de pago' },
    { id: 'CREDIT', label: 'Tarjeta de crédito', hint: 'En consulta o link de pago' },
    { id: 'CASH', label: 'Efectivo', hint: 'Solo en atención presencial' },
    { id: 'MERCADOPAGO', label: 'Mercado Pago', hint: 'Link de pago o saldo en cuenta' },
    { id: 'PAYPAL', label: 'PayPal', hint: 'Útil para pacientes en el extranjero' },
    { id: 'OTHER', label: 'Otro medio', hint: 'Detállalo en las indicaciones de pago' },
]

const BY_ID = new Map(PAYMENT_METHODS.map((m) => [m.id, m]))

/** Etiquetas antiguas (texto libre) que pudieron guardarse antes del catalogo. */
const LEGACY_LABELS: Record<string, string> = {
    transferencia: 'TRANSFER',
    'tarjeta de débito': 'DEBIT',
    'tarjeta de debito': 'DEBIT',
    'tarjeta de crédito': 'CREDIT',
    'tarjeta de credito': 'CREDIT',
    efectivo: 'CASH',
    'mercado pago': 'MERCADOPAGO',
    paypal: 'PAYPAL',
}

export function isPaymentMethodId(value: string): boolean {
    return BY_ID.has(value)
}

/** Normaliza a IDs validos, sin duplicados y respetando el orden del catalogo. */
export function normalizePaymentMethods(values: readonly string[] | null | undefined): string[] {
    const ids = new Set<string>()
    for (const raw of values ?? []) {
        const id = BY_ID.has(raw) ? raw : LEGACY_LABELS[raw.trim().toLowerCase()]
        if (id) ids.add(id)
    }
    return PAYMENT_METHODS.filter((m) => ids.has(m.id)).map((m) => m.id)
}

export function paymentMethodLabels(values: readonly string[] | null | undefined): string[] {
    return normalizePaymentMethods(values).map((id) => BY_ID.get(id)!.label)
}

export const PAYMENT_NOTES_MAX_LENGTH = 400
