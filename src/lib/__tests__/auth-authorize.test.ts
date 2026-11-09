/** @jest-environment node */

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findFirst: jest.fn(),
        },
    },
}))

jest.mock('@next-auth/prisma-adapter', () => ({
    PrismaAdapter: jest.fn(() => ({})),
}))

jest.mock('bcryptjs', () => ({
    __esModule: true,
    default: { compare: jest.fn() },
    compare: jest.fn(),
}))

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const mockFindFirst = (prisma as unknown as { user: { findFirst: jest.Mock } }).user.findFirst
const mockCompare = bcrypt.compare as unknown as jest.Mock

type Authorize = (credentials: Record<string, string>) => Promise<unknown>

function getAuthorize(): Authorize {
    const provider = authOptions.providers.find(
        (p) => (p as { id?: string }).id === 'credentials'
    ) as unknown as { options: { authorize: Authorize } }
    return provider.options.authorize
}

describe('credentials authorize', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCompare.mockResolvedValue(true)
    })

    it('rejects login when the email is not verified', async () => {
        mockFindFirst.mockResolvedValue({
            id: 'u1',
            email: 'a@test.com',
            password: 'hash',
            emailVerified: null,
            isActive: true,
            role: 'PATIENT',
        })

        await expect(
            getAuthorize()({ email: 'a@test.com', password: 'ClaveSegura1' })
        ).rejects.toThrow(/verificar tu correo/i)
        expect(mockCompare).not.toHaveBeenCalled()
    })

    it('looks the user up ignoring case', async () => {
        mockFindFirst.mockResolvedValue(null)

        await expect(
            getAuthorize()({ email: ' A@Test.com ', password: 'x' })
        ).rejects.toThrow()

        expect(mockFindFirst).toHaveBeenCalledWith({
            where: { email: { equals: 'A@Test.com', mode: 'insensitive' } },
        })
    })

    it('allows login for a verified user with the right password', async () => {
        mockFindFirst.mockResolvedValue({
            id: 'u1',
            email: 'a@test.com',
            name: 'A',
            image: null,
            password: 'hash',
            emailVerified: new Date(),
            isActive: true,
            role: 'PATIENT',
        })

        await expect(
            getAuthorize()({ email: 'a@test.com', password: 'ClaveSegura1' })
        ).resolves.toMatchObject({ id: 'u1', role: 'PATIENT' })
    })
})
