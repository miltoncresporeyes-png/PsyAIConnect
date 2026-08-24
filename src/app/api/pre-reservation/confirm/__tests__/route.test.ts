/** @jest-environment node */

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
    authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        preReservation: {
            findUnique: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
        appointment: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    },
}))

jest.mock('@/lib/rateLimit', () => ({
    getClientIp: jest.fn(() => '127.0.0.1'),
    checkRateLimit: jest.fn(() => ({
        allowed: true,
        remaining: 14,
        retryAfterSeconds: 60,
        resetAt: Date.now() + 60_000,
        limit: 15,
    })),
    createRateLimitHeaders: jest.fn(() => ({
        'X-RateLimit-Limit': '15',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor((Date.now() + 60_000) / 1000)),
        'Retry-After': '60',
    })),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'
import { POST } from '../route'

const mockGetServerSession = getServerSession as jest.Mock
const mockCheckRateLimit = checkRateLimit as jest.Mock
const mockPrisma = prisma as unknown as {
    preReservation: {
        findUnique: jest.Mock
        delete: jest.Mock
        update: jest.Mock
        deleteMany: jest.Mock
    }
    appointment: {
        findFirst: jest.Mock
        create: jest.Mock
    }
}

describe('POST /api/pre-reservation/confirm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCheckRateLimit.mockReturnValue({
            allowed: true,
            remaining: 14,
            retryAfterSeconds: 60,
            resetAt: Date.now() + 60_000,
            limit: 15,
        })
    })

    it('returns 401 when user is unauthenticated', async () => {
        mockGetServerSession.mockResolvedValue(null)

        const request = new Request('http://localhost/api/pre-reservation/confirm', {
            method: 'POST',
            body: JSON.stringify({ token: 'tok-1' }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        expect(response.status).toBe(401)
    })

    it('returns 429 when rate limit is exceeded', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
        mockCheckRateLimit.mockReturnValue({
            allowed: false,
            remaining: 0,
            retryAfterSeconds: 60,
            resetAt: Date.now() + 60_000,
            limit: 15,
        })

        const request = new Request('http://localhost/api/pre-reservation/confirm', {
            method: 'POST',
            body: JSON.stringify({ token: 'tok-1' }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        expect(response.status).toBe(429)
    })

    it('returns 403 when pre-reservation belongs to another user', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
        mockPrisma.preReservation.findUnique.mockResolvedValue({
            userId: 'user-2',
            confirmed: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            professionalId: 'prof-1',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            duration: 50,
            professional: { user: { name: 'Prof Test' } },
        })

        const request = new Request('http://localhost/api/pre-reservation/confirm', {
            method: 'POST',
            body: JSON.stringify({ token: 'tok-1' }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        const json = await response.json()

        expect(response.status).toBe(403)
        expect(json.error).toBe('La pre-reserva pertenece a otro usuario')
    })

    it('returns 500 when appointment creation fails (P1 drill: reservation confirm)', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
        mockPrisma.preReservation.findUnique.mockResolvedValue({
            userId: 'user-1',
            confirmed: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            professionalId: 'prof-1',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            duration: 50,
            professional: { user: { name: 'Prof Test' } },
        })
        mockPrisma.appointment.findFirst.mockResolvedValue(null)
        mockPrisma.appointment.create.mockRejectedValue(new Error('db down'))

        const request = new Request('http://localhost/api/pre-reservation/confirm', {
            method: 'POST',
            body: JSON.stringify({ token: 'tok-1' }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        const json = await response.json()

        expect(response.status).toBe(500)
        expect(json.error).toBe('Error al confirmar la reserva')
    })
})
