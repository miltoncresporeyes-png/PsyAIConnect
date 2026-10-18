import crypto from 'crypto'

// El secreto NUNCA se toma de un valor hardcodeado: en producción debe estar
// definido en CLINICAL_HASH_SECRET, si no las firmas serían falsificables.
function getClinicalHashSecret(): string {
    const secret = process.env.CLINICAL_HASH_SECRET

    if (secret && secret.length >= 32) {
        return secret
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'CLINICAL_HASH_SECRET must be set to at least 32 characters in production. ' +
            'Generate one with: openssl rand -hex 32'
        )
    }

    console.warn('⚠️ CLINICAL_HASH_SECRET not set. Using development-only secret.')
    return 'psyai-clinical-secret-key-dev-only'
}

export function generateClinicalHash(content: string, professionalId: string, appointmentId: string): string {
    const data = `${content}|${professionalId}|${appointmentId}|${getClinicalHashSecret()}`
    return crypto.createHash('sha256').update(data).digest('hex')
}

export function generateClinicalSignature(
    content: string,
    professionalId: string,
    appointmentId: string,
    professionalName: string
): string {
    const secret = getClinicalHashSecret()
    const timestamp = new Date().toISOString()
    const hash = generateClinicalHash(content, professionalId, appointmentId)
    const signatureData = `${hash}|${professionalId}|${professionalName}|${timestamp}|${secret}`

    return crypto
        .createHmac('sha256', secret)
        .update(signatureData)
        .digest('base64')
}

export function verifyClinicalSignature(
    signature: string,
    content: string,
    professionalId: string,
    appointmentId: string,
    professionalName: string,
    timestamp: string
): boolean {
    const secret = getClinicalHashSecret()
    const hash = generateClinicalHash(content, professionalId, appointmentId)
    const signatureData = `${hash}|${professionalId}|${professionalName}|${timestamp}|${secret}`

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signatureData)
        .digest('base64')

    const a = Buffer.from(signature)
    const b = Buffer.from(expectedSignature)

    // timingSafeEqual lanza si los tamaños difieren
    if (a.length !== b.length) {
        return false
    }

    return crypto.timingSafeEqual(a, b)
}

export function generateAnnexHash(content: string, noteId: string, createdBy: string): string {
    const data = `${content}|${noteId}|${createdBy}|${getClinicalHashSecret()}`
    return crypto.createHash('sha256').update(data).digest('hex')
}
