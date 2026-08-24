import crypto from 'crypto'

const CLINICAL_HASH_SECRET = process.env.CLINICAL_HASH_SECRET || 'psyai-clinical-secret-key'

export function generateClinicalHash(content: string, professionalId: string, appointmentId: string): string {
    const data = `${content}|${professionalId}|${appointmentId}|${CLINICAL_HASH_SECRET}`
    return crypto.createHash('sha256').update(data).digest('hex')
}

export function generateClinicalSignature(
    content: string,
    professionalId: string,
    appointmentId: string,
    professionalName: string
): string {
    const timestamp = new Date().toISOString()
    const hash = generateClinicalHash(content, professionalId, appointmentId)
    const signatureData = `${hash}|${professionalId}|${professionalName}|${timestamp}|${CLINICAL_HASH_SECRET}`
    
    return crypto
        .createHmac('sha256', CLINICAL_HASH_SECRET)
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
    const hash = generateClinicalHash(content, professionalId, appointmentId)
    const signatureData = `${hash}|${professionalId}|${professionalName}|${timestamp}|${CLINICAL_HASH_SECRET}`
    
    const expectedSignature = crypto
        .createHmac('sha256', CLINICAL_HASH_SECRET)
        .update(signatureData)
        .digest('base64')
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

export function generateAnnexHash(content: string, noteId: string, createdBy: string): string {
    const data = `${content}|${noteId}|${createdBy}|${CLINICAL_HASH_SECRET}`
    return crypto.createHash('sha256').update(data).digest('hex')
}
