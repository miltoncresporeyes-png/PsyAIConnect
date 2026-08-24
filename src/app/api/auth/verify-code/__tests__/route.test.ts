/** @jest-environment node */

jest.mock('@/lib/email', () => ({
  generateVerificationCode: jest.fn(() => '123456'),
  sendVerificationCodeEmail: jest.fn(async () => ({ success: true })),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
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
    delete: jest.Mock
    deleteMany: jest.Mock
  }
}

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
    mockPrisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 0 })
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

    const request = new Request('http://localhost/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        email: 'paciente@test.com',
        name: 'Paciente Test',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(429)
  })

  it('returns 500 when code persistence fails (P1 drill: auth/verify-code)', async () => {
    mockPrisma.emailVerificationCode.create.mockRejectedValue(new Error('db down'))

    const request = new Request('http://localhost/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        email: 'paciente@test.com',
        name: 'Paciente Test',
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Error en el proceso de verificación')
  })
})
