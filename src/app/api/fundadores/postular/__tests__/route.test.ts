/** @jest-environment node */

jest.mock('@/lib/email', () => ({
    sendEmail: jest.fn(async () => ({ success: true })),
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        founderApplication: {
            findUnique: jest.fn(),
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
    createRateLimitHeaders: jest.fn(() => ({})),
}))

jest.mock('@/lib/observability', () => ({
    captureApiError: jest.fn(async () => undefined),
    getRequestId: jest.fn(() => 'req-test'),
}))

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { captureApiError } from '@/lib/observability'
import { POST } from '../route'

const mockPrisma = prisma as unknown as {
    founderApplication: { findUnique: jest.Mock; create: jest.Mock }
}

const validBody = {
    nombreCompleto: 'Constanza Silva Morales',
    rut: '12.345.678-5',
    profesion: 'psicologo',
    registroSuperintendencia: '123456',
    email: 'Constanza@Consulta.cl',
    telefono: '+56912345678',
    modalidadAtencion: 'online',
    region: 'Región Metropolitana',
    comuna: 'Providencia',
    descripcionConsulta: '',
    declaracionVigente: true,
    versionTerminos: '1.0',
}

const call = (overrides: Record<string, unknown> = {}) =>
    POST(
        new NextRequest('http://localhost/api/fundadores/postular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validBody, ...overrides }),
        })
    )

describe('POST /api/fundadores/postular', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPrisma.founderApplication.findUnique.mockResolvedValue(null)
        mockPrisma.founderApplication.create.mockResolvedValue({ id: 'app-1' })
    })

    it('rechaza un RUT con dígito verificador incorrecto', async () => {
        const res = await call({ rut: '12.345.678-9' })
        const json = await res.json()

        expect(res.status).toBe(400)
        expect(json.error).toMatch(/RUT no es válido/)
        expect(mockPrisma.founderApplication.create).not.toHaveBeenCalled()
    })

    it('rechaza una comuna que no pertenece a la región', async () => {
        const res = await call({ region: 'Región Metropolitana', comuna: 'Arica' })

        expect(res.status).toBe(400)
        expect(mockPrisma.founderApplication.create).not.toHaveBeenCalled()
    })

    it('rechaza una región inexistente', async () => {
        const res = await call({ region: 'Narnia', comuna: 'Providencia' })

        expect(res.status).toBe(400)
    })

    it('rechaza texto libre en lugar de comuna de la lista', async () => {
        const res = await call({ comuna: 'providensia' })

        expect(res.status).toBe(400)
    })

    it('guarda el RUT formateado y la comuna con su región', async () => {
        const res = await call({ rut: '123456785' })

        expect(res.status).toBe(200)
        expect(mockPrisma.founderApplication.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                rut: '12.345.678-5',
                comunaRegion: 'Providencia, Región Metropolitana',
                email: 'constanza@consulta.cl',
                estado: 'pendiente',
            }),
        })
    })

    describe('correos', () => {
        const mockSendEmail = sendEmail as jest.Mock

        beforeEach(() => {
            mockSendEmail.mockReset()
            mockSendEmail.mockResolvedValue({ success: true, messageId: 'm1' })
            delete process.env.ADMIN_NOTIFICATION_EMAIL
        })

        it('envía confirmación al postulante y aviso al administrador', async () => {
            process.env.ADMIN_NOTIFICATION_EMAIL = 'equipo@psydoctor.cl'

            const res = await call()

            expect(res.status).toBe(200)
            expect(mockSendEmail).toHaveBeenCalledTimes(2)
            const recipients = mockSendEmail.mock.calls.map((c) => c[0].to)
            expect(recipients).toEqual(['constanza@consulta.cl', 'equipo@psydoctor.cl'])
        })

        it('usa contacto@psydoctor.cl si no hay destino configurado', async () => {
            await call()

            const recipients = mockSendEmail.mock.calls.map((c) => c[0].to)
            expect(recipients).toContain('contacto@psydoctor.cl')
        })

        it('no incluye el RUT en el aviso al administrador y escapa el HTML', async () => {
            await call({ nombreCompleto: 'Ana <script>alert(1)</script>' })

            const adminCall = mockSendEmail.mock.calls.find((c) => c[0].to === 'contacto@psydoctor.cl')
            expect(adminCall[0].html).not.toContain('12.345.678-5')
            expect(adminCall[0].html).not.toContain('<script>')
            expect(adminCall[0].html).toContain('&lt;script&gt;')
        })

        it('responde éxito aunque falle el envío y lo registra', async () => {
            mockSendEmail.mockResolvedValue({ success: false, error: 'Servicio de correo no configurado' })

            const res = await call()

            expect(res.status).toBe(200)
            expect(mockPrisma.founderApplication.create).toHaveBeenCalled()
            expect(captureApiError).toHaveBeenCalledTimes(2)
        })
    })

    it('exige la declaración de vigencia', async () => {
        const res = await call({ declaracionVigente: false })

        expect(res.status).toBe(400)
    })
})
