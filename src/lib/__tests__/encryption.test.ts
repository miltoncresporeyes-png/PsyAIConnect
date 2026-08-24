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
})
