import crypto from 'crypto'

const ALGORITHM_GCM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

// MAGIC HEADER for versioned envelope: "PSY1" (0x50, 0x53, 0x59, 0x31)
const MAGIC_HEADER = Buffer.from([0x50, 0x53, 0x59, 0x31])

export interface KeyRingEntry {
    kid: string
    key: Buffer
}

/**
 * Parsea y valida claves disponibles desde variables de entorno.
 * Soporta:
 * - ENCRYPTION_KEY: Clave primaria (64 hex o texto en dev)
 * - ENCRYPTION_KID: ID opcional para la clave primaria (default: "k1")
 * - ENCRYPTION_KEYS: JSON opcional de rotación: {"k1": "64hex...", "k2": "64hex..."}
 */
export function getKeyRing(): { primary: KeyRingEntry; all: Map<string, Buffer> } {
    const all = new Map<string, Buffer>()
    const primaryKid = process.env.ENCRYPTION_KID || 'k1'

    // 1. Cargar diccionario de rotación si existe
    if (process.env.ENCRYPTION_KEYS) {
        try {
            const parsed = JSON.parse(process.env.ENCRYPTION_KEYS)
            for (const [kid, val] of Object.entries(parsed)) {
                if (typeof val === 'string') {
                    all.set(kid, parseKeyBuffer(val, kid))
                }
            }
        } catch (e) {
            console.error('Error parseando ENCRYPTION_KEYS JSON:', e)
        }
    }

    // 2. Clave primaria desde ENCRYPTION_KEY
    const rawKey = process.env.ENCRYPTION_KEY
    let primaryBuffer: Buffer

    if (!rawKey) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'ENCRYPTION_KEY environment variable is required in production. ' +
                'Clinical notes cannot be encrypted without a secure key.'
            )
        }
        if (!all.has(primaryKid)) {
            console.warn('⚠️ ENCRYPTION_KEY not set. Using development key.')
            primaryBuffer = crypto.scryptSync('development-key-psyconnect', 'salt', KEY_LENGTH)
            all.set(primaryKid, primaryBuffer)
        } else {
            primaryBuffer = all.get(primaryKid)!
        }
    } else {
        primaryBuffer = parseKeyBuffer(rawKey, primaryKid)
        all.set(primaryKid, primaryBuffer)
    }

    return {
        primary: { kid: primaryKid, key: primaryBuffer },
        all,
    }
}

function parseKeyBuffer(keyStr: string, kidName: string): Buffer {
    if (/^[0-9a-fA-F]{64}$/.test(keyStr)) {
        return Buffer.from(keyStr, 'hex')
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            `Key '${kidName}' must be exactly 64 hex characters (32 bytes) in production. ` +
            'Generate with: openssl rand -hex 32'
        )
    }

    console.warn(`⚠️ Key '${kidName}' is not 64 hex chars; deriving with scrypt (dev only).`)
    return crypto.scryptSync(keyStr, 'psyconnect-salt', KEY_LENGTH)
}

/**
 * Valida si la clave de entorno cumple con las reglas estrictas de 64 hex en arranque
 */
export function validateEncryptionConfig(): { valid: boolean; reason?: string } {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
        return { valid: false, reason: 'ENCRYPTION_KEY no está definida' }
    }
    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
        return { valid: false, reason: 'ENCRYPTION_KEY debe tener exactamente 64 caracteres hexadecimales (AES-256)' }
    }
    return { valid: true }
}

/**
 * Cifra con sobre versionado (Envelope v1 con kid):
 * [0..3]: MAGIC ("PSY1")
 * [4]: kid_length (N bytes)
 * [5 .. 4+N]: kid UTF-8 string
 * [4+N .. 4+N+16]: IV (16 bytes)
 * [4+N+16 .. 4+N+32]: AuthTag (16 bytes)
 * [4+N+32 .. end]: Ciphertext
 */
export function encrypt(plaintext: string, overrideKid?: string): Buffer {
    const { primary, all } = getKeyRing()
    const targetKid = overrideKid || primary.kid
    const key = all.get(targetKid) || primary.key

    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM_GCM, key, iv)

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ])
    const authTag = cipher.getAuthTag()

    const kidBuffer = Buffer.from(targetKid, 'utf8')
    const kidLen = Buffer.from([kidBuffer.length])

    return Buffer.concat([
        MAGIC_HEADER,
        kidLen,
        kidBuffer,
        iv,
        authTag,
        encrypted
    ])
}

/**
 * Descifra soportando:
 * 1. Formato v1 versionado con kid ("PSY1" + kid + iv + tag + ciphertext)
 * 2. Formato legado directo (iv(16) + tag(16) + ciphertext)
 * 3. Fallback CBC legado si proviniera de versiones antiguas
 */
export function decrypt(encryptedData: Buffer): string {
    const { primary, all } = getKeyRing()

    // 1. Detectar si tiene MAGIC HEADER "PSY1"
    if (
        encryptedData.length > 4 + 1 + 1 + IV_LENGTH + TAG_LENGTH &&
        encryptedData.subarray(0, 4).equals(MAGIC_HEADER)
    ) {
        const kidLength = encryptedData.readUInt8(4)
        const kidStart = 5
        const kidEnd = kidStart + kidLength
        const kid = encryptedData.subarray(kidStart, kidEnd).toString('utf8')

        const ivStart = kidEnd
        const ivEnd = ivStart + IV_LENGTH
        const tagEnd = ivEnd + TAG_LENGTH

        const iv = encryptedData.subarray(ivStart, ivEnd)
        const authTag = encryptedData.subarray(ivEnd, tagEnd)
        const ciphertext = encryptedData.subarray(tagEnd)

        const key = all.get(kid) || primary.key
        const decipher = crypto.createDecipheriv(ALGORITHM_GCM, key, iv)
        decipher.setAuthTag(authTag)

        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ])
        return decrypted.toString('utf8')
    }

    // 2. Formato AES-256-GCM previo (sin magic header: IV(16) + AuthTag(16) + Ciphertext)
    if (encryptedData.length >= IV_LENGTH + TAG_LENGTH) {
        const iv = encryptedData.subarray(0, IV_LENGTH)
        const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
        const ciphertext = encryptedData.subarray(IV_LENGTH + TAG_LENGTH)

        // Probar con clave primaria primero, luego con cualquier clave del keyring
        const candidateKeys = [primary.key, ...Array.from(all.values()).filter(k => !k.equals(primary.key))]

        for (const candidateKey of candidateKeys) {
            try {
                const decipher = crypto.createDecipheriv(ALGORITHM_GCM, candidateKey, iv)
                decipher.setAuthTag(authTag)
                const decrypted = Buffer.concat([
                    decipher.update(ciphertext),
                    decipher.final()
                ])
                return decrypted.toString('utf8')
            } catch {
                // Continuar probando claves
            }
        }
    }

    // 3. Fallback retrocompatible AES-256-CBC legado (IV 16 bytes + CBC ciphertext)
    const candidateKeys = [primary.key, ...Array.from(all.values())]
    for (const candidateKey of candidateKeys) {
        try {
            const iv = encryptedData.subarray(0, 16)
            const ciphertext = encryptedData.subarray(16)
            const decipher = crypto.createDecipheriv('aes-256-cbc', candidateKey, iv)
            const decrypted = Buffer.concat([
                decipher.update(ciphertext),
                decipher.final()
            ])
            return decrypted.toString('utf8')
        } catch {
            // No era CBC con esta clave
        }
    }

    throw new Error('No se pudo descifrar el payload con ninguna clave disponible en el KeyRing.')
}

/**
 * Re-cifra un buffer antiguo a la clave primaria activa v1
 */
export function reEncrypt(encryptedData: Buffer): Buffer {
    const plain = decrypt(encryptedData)
    return encrypt(plain)
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

/**
 * Lee contenido clínico almacenado en una columna cifrada con fallback al
 * texto legado (filas creadas antes de cifrar en reposo).
 */
export function decryptStoredNote(
    encryptedData: Buffer | null | undefined,
    legacyPlaintext?: string | null
): string {
    if (encryptedData && encryptedData.length > 0) {
        try {
            return decryptClinicalNote(encryptedData).content
        } catch {
            // Ciphertext ilegible (p.ej. clave rotada no disponible): se usa el texto legado
        }
    }
    return legacyPlaintext ?? ''
}
