import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
        // For development, use a deterministic key (NOT FOR PRODUCTION)
        console.warn('⚠️ ENCRYPTION_KEY not set. Using development key.')
        return crypto.scryptSync('development-key-psyconnect', 'salt', KEY_LENGTH)
    }

    // If key is a hex string, convert it
    if (key.length === 64) {
        return Buffer.from(key, 'hex')
    }

    // Otherwise, derive key from password
    return crypto.scryptSync(key, 'psyconnect-salt', KEY_LENGTH)
}

/**
 * Encrypts text using AES-256-GCM
 * Returns: IV (16 bytes) + AuthTag (16 bytes) + CipherText
 */
export function encrypt(plaintext: string): Buffer {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ])

    const authTag = cipher.getAuthTag()

    // Combine: IV + AuthTag + EncryptedData
    return Buffer.concat([iv, authTag, encrypted])
}

/**
 * Decrypts data encrypted with encrypt()
 */
export function decrypt(encryptedData: Buffer): string {
    const key = getEncryptionKey()

    // Extract parts
    const iv = encryptedData.subarray(0, IV_LENGTH)
    const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const ciphertext = encryptedData.subarray(IV_LENGTH + TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ])

    return decrypted.toString('utf8')
}

/**
 * Encrypts a clinical note for storage
 */
export function encryptClinicalNote(content: string): Buffer {
    return encrypt(JSON.stringify({
        content,
        timestamp: new Date().toISOString(),
    }))
}

/**
 * Decrypts a clinical note from storage
 */
export function decryptClinicalNote(encryptedData: Buffer): { content: string; timestamp: string } {
    const decrypted = decrypt(encryptedData)
    return JSON.parse(decrypted)
}
