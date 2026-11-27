/** @jest-environment node */

import { POST } from '@/app/api/citas/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}))

jest.mock('@/lib/appointmentPolicy', () => ({
    ...jest.requireActual('@/lib/appointmentPolicy'),
    notifyProfessionalNewRequest: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        professional: {
            findUnique: jest.fn(),
        },
        appointment: {
            findFirst: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
        },
        payment: {
            create: jest.fn(),
        },
    },
}))

describe('Appointment Concurrency & Constraint Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        delete process.env.WAITLIST_MODE
        delete process.env.NEXT_PUBLIC_WAITLIST_MODE
    })

    it('returns 409 Conflict when database detects unique constraint violation (P2002)', async () => {
        ;(getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'patient-123', email: 'test@patient.com' },
        })

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ noShowCount: 0 })
        ;(prisma.appointment.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.professional.findUnique as jest.Mock).mockResolvedValue({
            id: 'prof-456',
            sessionDuration: 50,
            sessionPrice: 40000,
            subscriptionTier: 'PRO',
        })

        // El check en memoria findFirst pasa (carrera de concurrencia)
        ;(prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null)

        // Pero la base de datos lanza error P2002 de restricción única
        const p2002Error: any = new Error('Unique constraint failed on the fields: (`professionalId`,`scheduledAt`)')
        p2002Error.code = 'P2002'
        ;(prisma.appointment.create as jest.Mock).mockRejectedValue(p2002Error)

        const req = new Request('http://localhost:3000/api/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-forwarded-for': '127.0.0.1',
            },
            body: JSON.stringify({
                professionalId: 'prof-456',
                scheduledAt: '2026-11-20T15:00:00.000Z',
                modality: 'ONLINE',
                policyAccepted: true,
            }),
        })

        const res = await POST(req)
        expect(res.status).toBe(409)
        const json = await res.json()
        expect(json.error).toMatch(/acaba de ser reservado/)
    })

    const post = (body: Record<string, unknown>) =>
        POST(
            new Request('http://localhost:3000/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.2' },
                body: JSON.stringify({
                    professionalId: 'prof-456',
                    scheduledAt: '2026-11-20T15:00:00.000Z',
                    modality: 'ONLINE',
                    ...body,
                }),
            })
        )

    it('rechaza la reserva si no se acepta la politica de cancelacion', async () => {
        ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'patient-123' } })
        const res = await post({})
        expect(res.status).toBe(400)
        expect((await res.json()).error).toMatch(/política de cancelación/)
    })

    it('bloquea al paciente con inasistencias reiteradas', async () => {
        ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'patient-123' } })
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ noShowCount: 3 })
        const res = await post({ policyAccepted: true })
        expect(res.status).toBe(403)
    })

    it('limita a una cita futura activa a un paciente nuevo', async () => {
        ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'patient-123' } })
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ noShowCount: 0 })
        ;(prisma.appointment.count as jest.Mock).mockResolvedValueOnce(0).mockResolvedValueOnce(1)
        const res = await post({ policyAccepted: true })
        expect(res.status).toBe(400)
        expect((await res.json()).error).toMatch(/cita pendiente/)
    })
})
