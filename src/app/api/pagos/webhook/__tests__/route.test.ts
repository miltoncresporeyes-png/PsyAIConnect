/**
 * @jest-environment node
 */
import { validateWebhookSignature, generateSignature } from '@/lib/flow'

describe('Flow Webhook Security', () => {
    const originalEnv = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...originalEnv, FLOW_SECRET_KEY: 'test-flow-secret' }
    })

    afterAll(() => {
        process.env = originalEnv
    })

    it('validates a correct HMAC signature matching the parameters', () => {
        const params: Record<string, string> = {
            token: 'TOKEN123456',
            status: '2',
        }
        const signature = generateSignature(params)
        expect(signature).toBeDefined()
        expect(signature.length).toBe(64)

        const isValid = validateWebhookSignature({ ...params, s: signature }, signature)
        expect(isValid).toBe(true)
    })

    it('rejects an invalid HMAC signature', () => {
        const params: Record<string, string> = {
            token: 'TOKEN123456',
            status: '2',
        }
        const isValid = validateWebhookSignature(
            { ...params, s: 'wrong-signature' },
            'wrong-signature-different-length-or-value'
        )
        expect(isValid).toBe(false)
    })

    it('rejects tampered parameters even if signature is valid format', () => {
        const params: Record<string, string> = {
            token: 'TOKEN123456',
            status: '2',
        }
        const signature = generateSignature(params)

        const tamperedParams = {
            token: 'TAMPERED',
            status: '2',
            s: signature,
        }
        const isValid = validateWebhookSignature(tamperedParams, signature)
        expect(isValid).toBe(false)
    })
})
