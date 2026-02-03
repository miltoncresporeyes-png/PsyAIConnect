/**
 * Tests for Email Service
 */
import {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
} from '@/lib/email'

// Mock fetch
global.fetch = jest.fn()

describe('Email Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('sendEmail - Development Mode (no API key)', () => {
        beforeAll(() => {
            delete process.env.RESEND_API_KEY
        })

        it('should log email to console in dev mode', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            const result = await sendEmail({
                to: 'test@example.com',
                subject: 'Test Subject',
                html: '<p>Test content</p>',
            })

            expect(result.success).toBe(true)
            expect(result.messageId).toContain('dev-mode-')
            expect(consoleSpy).toHaveBeenCalledWith('📧 [EMAIL SERVICE - DEV MODE]')

            consoleSpy.mockRestore()
        })
    })

    describe('sendEmail - Production Mode (with API key)', () => {
        beforeAll(() => {
            process.env.RESEND_API_KEY = 'test-api-key'
            process.env.EMAIL_FROM = 'Test <test@psyconnect.cl>'
        })

        afterAll(() => {
            delete process.env.RESEND_API_KEY
            delete process.env.EMAIL_FROM
        })

        it('should call Resend API with correct parameters', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ id: 'msg-123' }),
            })

            const result = await sendEmail({
                to: 'user@example.com',
                subject: 'Welcome',
                html: '<h1>Hello</h1>',
            })

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.resend.com/emails',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-api-key',
                    },
                })
            )
            expect(result.success).toBe(true)
            expect(result.messageId).toBe('msg-123')
        })

        it('should handle API errors gracefully', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: async () => ({ message: 'Invalid API key' }),
            })

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            const result = await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
            })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Invalid API key')

            consoleSpy.mockRestore()
        })

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            const result = await sendEmail({
                to: 'user@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
            })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Network error')

            consoleSpy.mockRestore()
        })
    })

    describe('sendVerificationEmail', () => {
        beforeAll(() => {
            delete process.env.RESEND_API_KEY // Use dev mode
            process.env.NEXTAUTH_URL = 'http://localhost:3000'
        })

        it('should send verification email with correct URL', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            const result = await sendVerificationEmail(
                'user@example.com',
                'John',
                'token123'
            )

            expect(result.success).toBe(true)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Subject:',
                expect.stringContaining('Verifica tu cuenta')
            )

            consoleSpy.mockRestore()
        })
    })

    describe('sendPasswordResetEmail', () => {
        beforeAll(() => {
            delete process.env.RESEND_API_KEY // Use dev mode
            process.env.NEXTAUTH_URL = 'http://localhost:3000'
        })

        it('should send password reset email with correct URL', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            const result = await sendPasswordResetEmail(
                'user@example.com',
                'Jane',
                'reset-token-456'
            )

            expect(result.success).toBe(true)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Subject:',
                expect.stringContaining('Restablecer contraseña')
            )

            consoleSpy.mockRestore()
        })
    })
})
