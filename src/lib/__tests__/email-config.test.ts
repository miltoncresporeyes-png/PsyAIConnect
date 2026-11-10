/** @jest-environment node */

import { sendEmail } from '@/lib/email'

const ORIGINAL_ENV = { ...process.env }

function mockFetchOk() {
    const fetchMock = jest.fn(async () => ({
        ok: true,
        json: async () => ({ id: 'msg-1' }),
    }))
    ;(global as unknown as { fetch: unknown }).fetch = fetchMock
    return fetchMock
}

function sentFrom(fetchMock: jest.Mock): string {
    const call = fetchMock.mock.calls[0] as unknown as [string, { body: string }]
    return JSON.parse(call[1].body).from
}

describe('sendEmail configuración', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined)
        jest.spyOn(console, 'warn').mockImplementation(() => undefined)
        jest.spyOn(console, 'log').mockImplementation(() => undefined)
    })

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV }
        jest.restoreAllMocks()
    })

    it('en producción falla si la clave es un placeholder, en vez de simular éxito', async () => {
        process.env = { ...ORIGINAL_ENV, NODE_ENV: 'production', RESEND_API_KEY: 're_...' }

        const result = await sendEmail({ to: 'a@test.cl', subject: 's', html: '<p>x</p>' })

        expect(result.success).toBe(false)
    })

    it('en desarrollo con placeholder simula el envío', async () => {
        process.env = { ...ORIGINAL_ENV, NODE_ENV: 'development', RESEND_API_KEY: 're_...' }

        const result = await sendEmail({ to: 'a@test.cl', subject: 's', html: '<p>x</p>' })

        expect(result.success).toBe(true)
        expect(result.messageId).toMatch(/^simulated-/)
    })

    it('ignora comillas sobrantes en EMAIL_FROM y no cae al remitente de prueba', async () => {
        process.env = {
            ...ORIGINAL_ENV,
            RESEND_API_KEY: 're_clave_real_123',
            EMAIL_FROM: 'PsyDoctor <contacto@psydoctor.cl>"',
        }
        const fetchMock = mockFetchOk()

        await sendEmail({ to: 'a@test.cl', subject: 's', html: '<p>x</p>' })

        expect(sentFrom(fetchMock)).toBe('PsyDoctor <contacto@psydoctor.cl>')
    })

    it('usa el remitente de prueba solo cuando EMAIL_FROM no se puede interpretar', async () => {
        process.env = { ...ORIGINAL_ENV, RESEND_API_KEY: 're_clave_real_123', EMAIL_FROM: 'solo-un-nombre' }
        const fetchMock = mockFetchOk()

        await sendEmail({ to: 'a@test.cl', subject: 's', html: '<p>x</p>' })

        expect(sentFrom(fetchMock)).toBe('PsyDoctor <onboarding@resend.dev>')
    })
})
