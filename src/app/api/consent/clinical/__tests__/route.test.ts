/** @jest-environment node */

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
    authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        professional: {
            findUnique: jest.fn(),
        },
        consentLog: {
            create: jest.fn(),
        },
    },
}))

jest.mock('@/lib/rateLimit', () => ({
    getClientIp: jest.fn(() => '127.0.0.1'),
    checkRateLimit: jest.fn(() => ({
        allowed: true,
        remaining: 9,
        retryAfterSeconds: 60,
        resetAt: Date.now() + 60_000,
        limit: 10,
    })),
    createRateLimitHeaders: jest.fn(() => ({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '9',
        'X-RateLimit-Reset': String(Math.floor((Date.now() + 60_000) / 1000)),
        'Retry-After': '60',
    })),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { POST } from '../route'

const mockGetServerSession = getServerSession as jest.Mock
const mockPrisma = prisma as unknown as {
    professional: { findUnique: jest.Mock }
    consentLog: { create: jest.Mock }
}

describe('POST /api/consent/clinical', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPrisma.professional.findUnique.mockResolvedValue({ id: 'prof-1' })
        mockPrisma.consentLog.create.mockResolvedValue({ id: 'consent-1' })
    })

    it('returns 401 when user is not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null)

        const request = new Request('http://localhost/api/consent/clinical', {
            method: 'POST',
            body: JSON.stringify({
                consentType: 'CLINICAL_CONSENT',
                digitalSignature: 'Ana Test',
            }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        const json = await response.json()

        expect(response.status).toBe(401)
        expect(json.error).toBe('No autenticado')
    })

    it('returns 400 for invalid consent type', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })

        const request = new Request('http://localhost/api/consent/clinical', {
            method: 'POST',
            body: JSON.stringify({
                consentType: 'TERMS_OF_SERVICE',
                digitalSignature: 'Ana Test',
            }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('returns 404 when professional does not exist', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
        mockPrisma.professional.findUnique.mockResolvedValue(null)

        const request = new Request('http://localhost/api/consent/clinical', {
            method: 'POST',
            body: JSON.stringify({
                consentType: 'CLINICAL_CONSENT',
                digitalSignature: 'Ana Test',
                professionalId: 'missing-prof',
            }),
            headers: { 'Content-Type': 'application/json' },
        })

        const response = await POST(request)
        const json = await response.json()

        expect(response.status).toBe(404)
        expect(json.error).toBe('Profesional no encontrado')
    })

    it('stores consent and returns success for valid request', async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })

        const request = new Request('http://localhost/api/consent/clinical', {
            method: 'POST',
            body: JSON.stringify({
                consentType: 'CLINICAL_CONSENT',
                digitalSignature: 'Ana Test',
                professionalId: 'prof-1',
            }),
            headers: {
                'Content-Type': 'application/json',
                'user-agent': 'jest-test',
                'x-forwarded-for': '10.0.0.1',
            },
        })

        const response = await POST(request)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json.success).toBe(true)
        expect(json.consentId).toBe('consent-1')
        expect(mockPrisma.consentLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    consentType: 'CLINICAL_CONSENT',
                    consentVersion: '1.0',
                    granted: true,
                }),
            })
        )
    })
})
