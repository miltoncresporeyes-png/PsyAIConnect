/** @jest-environment node */

import crypto from 'crypto'

jest.mock('@/lib/email', () => ({
  generateVerificationCode: jest.fn(() => '123456'),
  sendVerificationCodeEmail: jest.fn(async () => ({ success: true })),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    professional: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    emailVerificationCode: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/rateLimit', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 49,
    retryAfterSeconds: 60,
    resetAt: Date.now() + 60_000,
    limit: 50,
  })),
  createRateLimitHeaders: jest.fn(() => ({
    'X-RateLimit-Limit': '50',
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': String(Math.floor((Date.now() + 60_000) / 1000)),
    'Retry-After': '60',
  })),
}))

import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'
import { POST } from '../route'

const mockCheckRateLimit = checkRateLimit as jest.Mock
const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock
    findFirst: jest.Mock
    update: jest.Mock
    create: jest.Mock
  }
  professional: {
    findUnique: jest.Mock
    create: jest.Mock
  }
  emailVerificationCode: {
    findFirst: jest.Mock
    create: jest.Mock
    update: jest.Mock
    updateMany: jest.Mock
    delete: jest.Mock
    deleteMany: jest.Mock
  }
}

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

const call = (payload: Record<string, unknown>) =>
  POST(
    new Request('http://localhost/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  )

describe('POST /api/auth/verify-code', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 49,
      retryAfterSeconds: 60,
      resetAt: Date.now() + 60_000,
      limit: 50,
    })

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.findFirst.mockReset()
    mockPrisma.user.findFirst.mockResolvedValue(null)
    mockPrisma.user.update.mockReset()
    mockPrisma.user.create.mockReset()
    mockPrisma.professional.findUnique.mockResolvedValue(null)
    mockPrisma.emailVerificationCode.findFirst.mockReset()
    mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(null)
    mockPrisma.emailVerificationCode.updateMany.mockReset()
    mockPrisma.emailVerificationCode.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.emailVerificationCode.deleteMany.mockReset()
    mockPrisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 0 })
    mockPrisma.emailVerificationCode.create.mockReset()
    mockPrisma.emailVerificationCode.create.mockResolvedValue({ id: 'code-1' })
  })

  it('returns 429 when global rate limit is exceeded', async () => {
    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      resetAt: Date.now() + 60_000,
      limit: 50,
    })

    const response = await call({
      action: 'send',
      email: 'paciente@test.com',
      name: 'Paciente Test',
    })

    expect(response.status).toBe(429)
  })

  it('returns 500 when code persistence fails (P1 drill: auth/verify-code)', async () => {
    mockPrisma.emailVerificationCode.create.mockRejectedValue(new Error('db down'))

    const response = await call({
      action: 'send',
      email: 'paciente@test.com',
      name: 'Paciente Test',
    })
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Error en el proceso de verificación')
  })

  describe('send / resend', () => {
    it('rejects sending a code to an already verified email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', emailVerified: new Date() })

      const res = await call({ action: 'resend', email: 'Victima@Test.com', name: 'X' })

      expect(res.status).toBe(400)
      expect(mockPrisma.emailVerificationCode.create).not.toHaveBeenCalled()
    })

    it('enforces a per-email cooldown regardless of IP', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue({
        verified: false,
        attempts: 0,
        createdAt: new Date(Date.now() - 10_000),
        expires: new Date(Date.now() + 600_000),
      })

      const res = await call({ action: 'send', email: 'a@test.com', name: 'A' })

      expect(res.status).toBe(429)
      expect(res.headers.get('Retry-After')).toBeTruthy()
      expect(mockPrisma.emailVerificationCode.create).not.toHaveBeenCalled()
    })

    it('does not issue a new code while the email is locked by failed attempts', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue({
        verified: false,
        attempts: 5,
        createdAt: new Date(Date.now() - 120_000),
        expires: new Date(Date.now() + 600_000),
      })

      const res = await call({ action: 'resend', email: 'a@test.com', name: 'A' })

      expect(res.status).toBe(429)
      expect(mockPrisma.emailVerificationCode.deleteMany).not.toHaveBeenCalled()
    })

    it('normalizes the email before storing the code', async () => {
      const res = await call({ action: 'send', email: '  Paciente@Test.COM ', name: 'P' })

      expect(res.status).toBe(200)
      expect(mockPrisma.emailVerificationCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'paciente@test.com' }),
      })
    })
  })

  describe('verify', () => {
    const record = (overrides = {}) => ({
      id: 'rec-1',
      email: 'a@test.com',
      code: '123456',
      attempts: 0,
      verified: false,
      createdAt: new Date(),
      expires: new Date(Date.now() + 600_000),
      ...overrides,
    })

    it('reserves the attempt atomically and rejects a wrong code', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(record())

      const res = await call({ action: 'verify', email: 'a@test.com', code: '000000' })
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.remainingAttempts).toBe(4)
      expect(mockPrisma.emailVerificationCode.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { attempts: { increment: 1 } },
          where: expect.objectContaining({ attempts: { lt: 5 } }),
        })
      )
    })

    it('rejects when parallel requests already used the last attempt', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(record())
      mockPrisma.emailVerificationCode.updateMany.mockResolvedValueOnce({ count: 0 })

      const res = await call({ action: 'verify', email: 'a@test.com', code: '123456' })

      expect(res.status).toBe(400)
      expect((await res.json()).completionToken).toBeUndefined()
    })

    it('does not delete the record when attempts are exhausted', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(record({ attempts: 5 }))

      const res = await call({ action: 'verify', email: 'a@test.com', code: '123456' })

      expect(res.status).toBe(400)
      expect(mockPrisma.emailVerificationCode.delete).not.toHaveBeenCalled()
    })

    it('returns a completion token and stores only its hash', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(record())

      const res = await call({ action: 'verify', email: 'a@test.com', code: '123456' })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.completionToken).toMatch(/^[0-9a-f]{64}$/)
      const calls = mockPrisma.emailVerificationCode.updateMany.mock.calls
      const stored = calls[calls.length - 1][0]
      expect(stored.data.verified).toBe(true)
      expect(stored.data.code).toBe(sha256(json.completionToken))
      expect(stored.data.code).not.toBe(json.completionToken)
    })
  })

  describe('complete', () => {
    const base = {
      action: 'complete',
      email: 'Nuevo@Test.com',
      name: 'Nuevo Usuario',
      password: 'ClaveSegura1',
      completionToken: 'tok',
    }
    const verifiedRecord = { id: 'rec-9', email: 'nuevo@test.com', verified: true }

    it('rejects completion without a completion token', async () => {
      const res = await call({ ...base, completionToken: undefined })

      expect(res.status).toBe(400)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('rejects a token that does not match a recent verification', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(null)

      const res = await call(base)

      expect(res.status).toBe(400)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
      expect(mockPrisma.emailVerificationCode.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          email: 'nuevo@test.com',
          verified: true,
          code: sha256('tok'),
          expires: { gt: expect.any(Date) },
        }),
      })
    })

    it('rejects short passwords', async () => {
      const res = await call({ ...base, password: 'corta' })

      expect(res.status).toBe(400)
    })

    it('rejects when the token was already consumed by a parallel request', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(verifiedRecord)
      mockPrisma.emailVerificationCode.deleteMany.mockResolvedValueOnce({ count: 0 })

      const res = await call(base)

      expect(res.status).toBe(400)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('does not touch an email that is already verified', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(verifiedRecord)
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', emailVerified: new Date() })

      const res = await call(base)

      expect(res.status).toBe(400)
      expect(mockPrisma.user.update).not.toHaveBeenCalled()
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('replaces the password of an unverified account (pre-hijack)', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(verifiedRecord)
      mockPrisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 1 })
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u2',
        name: 'Atacante',
        role: 'PATIENT',
        emailVerified: null,
        password: 'hash-del-atacante',
      })
      mockPrisma.user.update.mockResolvedValue({ id: 'u2', role: 'PATIENT', name: 'Atacante' })

      const res = await call(base)

      expect(res.status).toBe(200)
      const data = mockPrisma.user.update.mock.calls[0][0].data
      expect(data.emailVerified).toBeInstanceOf(Date)
      expect(data.password).toEqual(expect.any(String))
      expect(data.password).not.toBe('hash-del-atacante')
    })

    it('creates a verified user with the normalized email', async () => {
      mockPrisma.emailVerificationCode.findFirst.mockResolvedValue(verifiedRecord)
      mockPrisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 1 })
      mockPrisma.user.create.mockResolvedValue({ id: 'u3', name: 'Nuevo Usuario', role: 'PATIENT' })

      const res = await call(base)

      expect(res.status).toBe(200)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'nuevo@test.com',
          role: 'PATIENT',
          emailVerified: expect.any(Date),
        }),
      })
    })
  })
})
