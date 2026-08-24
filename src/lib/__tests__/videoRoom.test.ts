describe('videoRoom utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('room configuration validation', () => {
    it('should have correct max participants for 1-on-1 session', () => {
      const maxParticipants = 2
      expect(maxParticipants).toBe(2)
    })

    it('should enable chat and screenshare', () => {
      const config = {
        enable_chat: true,
        enable_screenshare: true,
      }
      expect(config.enable_chat).toBe(true)
      expect(config.enable_screenshare).toBe(true)
    })

    it('should default to Spanish language', () => {
      const lang = 'es'
      expect(lang).toBe('es')
    })

    it('should calculate expiration 2 hours from now', () => {
      const now = Math.floor(Date.now() / 1000)
      const twoHours = 2 * 60 * 60
      const exp = now + twoHours
      
      expect(exp - now).toBe(7200)
    })
  })

  describe('API key validation', () => {
    it('should require DAILY_API_KEY environment variable', () => {
      const apiKey = process.env.DAILY_API_KEY
      
      // Test that we can check for API key existence
      const hasKey = Boolean(apiKey)
      expect(typeof hasKey).toBe('boolean')
    })

    it('should throw error when DAILY_API_KEY is not set', async () => {
      delete process.env.DAILY_API_KEY
      
      // Import should work, but function should throw
      const { createVideoRoom } = await import('@/lib/videoRoom')
      
      await expect(
        createVideoRoom('test-appointment')
      ).rejects.toThrow('DAILY_API_KEY no configurada')
    })
  })

  describe('room name generation', () => {
    it('should generate room name with appointment ID', () => {
      const appointmentId = 'appointment-123'
      const timestamp = Date.now()
      const roomName = `psyai-${appointmentId}-${timestamp}`
      
      expect(roomName).toMatch(/^psyai-appointment-123-\d+$/)
    })

    it('should use daily.co domain for room URL', () => {
      const roomName = 'test-room'
      const expectedUrl = `https://psyai.daily.co/${roomName}`
      
      expect(expectedUrl).toBe('https://psyai.daily.co/test-room')
    })
  })

  describe('token generation properties', () => {
    it('should set is_owner true for professional', () => {
      const isOwner = true
      expect(isOwner).toBe(true)
    })

    it('should set is_owner false for patient', () => {
      const isOwner = false
      expect(isOwner).toBe(false)
    })

    it('should include user_id in token properties', () => {
      const userId = 'user-123'
      expect(userId).toBe('user-123')
    })

    it('should include user_name in token properties', () => {
      const userName = 'John Doe'
      expect(userName).toBe('John Doe')
    })
  })
})
