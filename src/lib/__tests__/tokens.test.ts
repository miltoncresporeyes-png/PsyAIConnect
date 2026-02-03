/**
 * Tests for Token Management Library
 */
import {
    createVerificationToken,
    verifyEmailToken,
    createPasswordResetToken,
    verifyPasswordResetToken
} from '@/lib/tokens'

// Mock Prisma
const mockPrisma = {
    verificationToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
}

jest.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}))

describe('Token Management', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createVerificationToken', () => {
        it('should create a verification token for an email', async () => {
            mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 0 })
            mockPrisma.verificationToken.create.mockResolvedValue({
                identifier: 'test@example.com',
                token: 'generated-token',
                expires: new Date(),
            })

            const token = await createVerificationToken('test@example.com')

            expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
                where: { identifier: 'test@example.com' },
            })
            expect(mockPrisma.verificationToken.create).toHaveBeenCalled()
            expect(typeof token).toBe('string')
            expect(token.length).toBe(64) // 32 bytes in hex = 64 chars
        })
    })

    describe('verifyEmailToken', () => {
        it('should return email for valid token', async () => {
            const futureDate = new Date(Date.now() + 3600000) // 1 hour from now
            mockPrisma.verificationToken.findUnique.mockResolvedValue({
                identifier: 'test@example.com',
                token: 'valid-token',
                expires: futureDate,
            })
            mockPrisma.verificationToken.delete.mockResolvedValue({})

            const email = await verifyEmailToken('valid-token')

            expect(email).toBe('test@example.com')
            expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({
                where: { token: 'valid-token' },
            })
        })

        it('should return null for non-existent token', async () => {
            mockPrisma.verificationToken.findUnique.mockResolvedValue(null)

            const email = await verifyEmailToken('non-existent')

            expect(email).toBeNull()
        })

        it('should return null for expired token', async () => {
            const pastDate = new Date(Date.now() - 3600000) // 1 hour ago
            mockPrisma.verificationToken.findUnique.mockResolvedValue({
                identifier: 'test@example.com',
                token: 'expired-token',
                expires: pastDate,
            })
            mockPrisma.verificationToken.delete.mockResolvedValue({})

            const email = await verifyEmailToken('expired-token')

            expect(email).toBeNull()
            expect(mockPrisma.verificationToken.delete).toHaveBeenCalled()
        })
    })

    describe('createPasswordResetToken', () => {
        it('should create a reset token with reset: prefix', async () => {
            mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 0 })
            mockPrisma.verificationToken.create.mockResolvedValue({
                identifier: 'reset:test@example.com',
                token: 'reset-token',
                expires: new Date(),
            })

            const token = await createPasswordResetToken('test@example.com')

            expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
                where: { identifier: 'reset:test@example.com' },
            })
            expect(mockPrisma.verificationToken.create).toHaveBeenCalled()
            expect(typeof token).toBe('string')
        })
    })

    describe('verifyPasswordResetToken', () => {
        it('should return email without prefix for valid token', async () => {
            const futureDate = new Date(Date.now() + 3600000)
            mockPrisma.verificationToken.findUnique.mockResolvedValue({
                identifier: 'reset:test@example.com',
                token: 'valid-reset-token',
                expires: futureDate,
            })
            mockPrisma.verificationToken.delete.mockResolvedValue({})

            const email = await verifyPasswordResetToken('valid-reset-token')

            expect(email).toBe('test@example.com')
        })

        it('should return null for non-reset token', async () => {
            const futureDate = new Date(Date.now() + 3600000)
            mockPrisma.verificationToken.findUnique.mockResolvedValue({
                identifier: 'test@example.com', // No reset: prefix
                token: 'some-token',
                expires: futureDate,
            })

            const email = await verifyPasswordResetToken('some-token')

            expect(email).toBeNull()
        })
    })
})
