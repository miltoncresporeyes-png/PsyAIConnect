import { encrypt, decrypt, encryptClinicalNote, decryptClinicalNote } from '@/lib/encryption'

describe('encryption', () => {
  const testKey = 'test-encryption-key-for-testing-purposes'

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = testKey
  })

  afterAll(() => {
    delete process.env.ENCRYPTION_KEY
  })

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plaintext = 'Hello, this is a test message'
      
      const encrypted = encrypt(plaintext)
      
      expect(encrypted).toBeInstanceOf(Buffer)
      expect(encrypted.length).toBeGreaterThan(plaintext.length)
      
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(plaintext)
    })

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'Same message'
      
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)
      
      expect(encrypted1.equals(encrypted2)).toBe(false)
    })

    it('should handle empty string', () => {
      const plaintext = ''
      
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should handle long text', () => {
      const plaintext = 'A'.repeat(10000)
      
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should handle special characters', () => {
      const plaintext = 'ñáéíóú üñ¿?¡! @#$%^&*() 中文 🎉'
      
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('should handle JSON objects', () => {
      const plaintext = JSON.stringify({
        name: 'John',
        age: 30,
        hobbies: ['reading', 'gaming']
      })
      
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(plaintext))
    })
  })

  describe('encryptClinicalNote/decryptClinicalNote', () => {
    it('should encrypt and decrypt a clinical note with timestamp', () => {
      const content = 'Patient shows improvement in anxiety symptoms'
      
      const encrypted = encryptClinicalNote(content)
      
      expect(encrypted).toBeInstanceOf(Buffer)
      
      const decrypted = decryptClinicalNote(encrypted)
      
      expect(decrypted.content).toBe(content)
      expect(decrypted.timestamp).toBeDefined()
      expect(new Date(decrypted.timestamp).toString()).not.toBe('Invalid Date')
    })

    it('should include ISO timestamp in encrypted note', () => {
      const before = new Date().toISOString()
      const encrypted = encryptClinicalNote('test note')
      const after = new Date().toISOString()
      
      const decrypted = decryptClinicalNote(encrypted)
      
      const timestamp = new Date(decrypted.timestamp)
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(new Date(before).getTime())
      expect(timestamp.getTime()).toBeLessThanOrEqual(new Date(after).getTime() + 1000)
    })
  })

  describe('Key rotation & versioning (Envelope v1 with kid)', () => {
    it('supports rotating keys via ENCRYPTION_KEYS without losing previous records', () => {
      const key1 = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const key2 = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'

      process.env.ENCRYPTION_KEY = key1
      process.env.ENCRYPTION_KID = 'k1'
      process.env.ENCRYPTION_KEYS = JSON.stringify({ k1: key1, k2: key2 })

      const text = 'Nota clínica confidencial cifrada con clave antigua k1'
      const encryptedV1 = encrypt(text, 'k1')

      // Ahora rotamos la clave activa a k2
      process.env.ENCRYPTION_KEY = key2
      process.env.ENCRYPTION_KID = 'k2'

      // La nota antigua aún se descifra automáticamente buscando su kid "k1" en el keyring
      const decrypted = decrypt(encryptedV1)
      expect(decrypted).toBe(text)

      // Se puede re-cifrar para actualizarla a k2
      const reEncrypted = encrypt(decrypted)
      expect(decrypt(reEncrypted)).toBe(text)
    })
  })
})
