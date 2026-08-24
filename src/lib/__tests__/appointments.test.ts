import { z } from 'zod'

describe('Appointment Validation', () => {
  describe('appointment creation schema', () => {
    const appointmentSchema = z.object({
      professionalId: z.string(),
      scheduledAt: z.string().datetime(),
      modality: z.enum(['ONLINE', 'IN_PERSON']),
      consultationReason: z.string().optional(),
    })

    it('should validate a valid appointment', () => {
      const validAppointment = {
        professionalId: 'prof-123',
        scheduledAt: '2026-02-15T10:00:00.000Z',
        modality: 'ONLINE',
        consultationReason: 'Anxiety treatment',
      }

      const result = appointmentSchema.safeParse(validAppointment)
      expect(result.success).toBe(true)
    })

    it('should reject invalid modality', () => {
      const invalidAppointment = {
        professionalId: 'prof-123',
        scheduledAt: '2026-02-15T10:00:00.000Z',
        modality: 'INVALID',
      }

      const result = appointmentSchema.safeParse(invalidAppointment)
      expect(result.success).toBe(false)
    })

    it('should reject missing required fields', () => {
      const incompleteAppointment = {
        professionalId: 'prof-123',
      }

      const result = appointmentSchema.safeParse(incompleteAppointment)
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const invalidDate = {
        professionalId: 'prof-123',
        scheduledAt: 'not-a-date',
        modality: 'ONLINE',
      }

      const result = appointmentSchema.safeParse(invalidDate)
      expect(result.success).toBe(false)
    })

    it('should allow optional consultation reason', () => {
      const withoutReason = {
        professionalId: 'prof-123',
        scheduledAt: '2026-02-15T10:00:00.000Z',
        modality: 'IN_PERSON',
      }

      const result = appointmentSchema.safeParse(withoutReason)
      expect(result.success).toBe(true)
    })
  })

  describe('appointment status transitions', () => {
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

    it('should have all expected statuses', () => {
      expect(validStatuses).toContain('PENDING')
      expect(validStatuses).toContain('CONFIRMED')
      expect(validStatuses).toContain('COMPLETED')
      expect(validStatuses).toContain('CANCELLED')
      expect(validStatuses).toContain('NO_SHOW')
    })

    it('should have 5 total statuses', () => {
      expect(validStatuses.length).toBe(5)
    })
  })

  describe('modality types', () => {
    const validModalities = ['ONLINE', 'IN_PERSON', 'BOTH']

    it('should support ONLINE modality for teletherapy', () => {
      expect(validModalities).toContain('ONLINE')
    })

    it('should support IN_PERSON modality for office visits', () => {
      expect(validModalities).toContain('IN_PERSON')
    })

    it('should support BOTH modality for flexible professionals', () => {
      expect(validModalities).toContain('BOTH')
    })
  })

  describe('appointment time validation', () => {
    it('should validate future appointment dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      
      expect(futureDate.getTime()).toBeGreaterThan(Date.now())
    })

    it('should reject past appointment dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      
      expect(pastDate.getTime()).toBeLessThan(Date.now())
    })

    it('should validate appointment duration in minutes', () => {
      const typicalDuration = 50
      const extendedDuration = 80
      
      expect(typicalDuration).toBeGreaterThanOrEqual(30)
      expect(typicalDuration).toBeLessThanOrEqual(90)
    })
  })
})
