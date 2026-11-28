/** @jest-environment node */

import { GET, POST } from '@/app/api/soporte/tickets/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/ticketNotify', () => ({ notifyAdminsNewTicket: jest.fn().mockResolvedValue(undefined) }))
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: { findUnique: jest.fn() },
        supportTicket: { create: jest.fn(), findMany: jest.fn() },
    },
}))

const session = getServerSession as jest.Mock
const create = prisma.supportTicket.create as jest.Mock
const findUser = prisma.user.findUnique as jest.Mock

let ipCounter = 0
function post(body: unknown, ip?: string) {
    return POST(
        new Request('http://localhost/api/soporte/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip ?? `10.0.${Math.floor(++ipCounter / 250)}.${(ipCounter % 250) + 1}` },
            body: JSON.stringify(body),
        })
    )
}

const valid = { type: 'SUGGESTION', subject: 'Modo oscuro', message: 'Sería genial tener un modo oscuro en la app.' }

beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue(null)
    create.mockResolvedValue({ id: 't1', number: 42, type: 'SUGGESTION', subject: 'Modo oscuro', message: 'x', contactEmail: 'a@b.cl', userRole: null })
})

describe('POST /api/soporte/tickets', () => {
    it('400 con datos invalidos y no crea nada', async () => {
        const res = await post({ ...valid, subject: 'a' })
        expect(res.status).toBe(400)
        expect(create).not.toHaveBeenCalled()
    })

    it('el campo trampa responde exito sin crear el ticket', async () => {
        const res = await post({ ...valid, email: 'bot@spam.cl', website: 'http://spam.cl' })
        expect(res.status).toBe(200)
        expect(create).not.toHaveBeenCalled()
    })

    it('un visitante debe dejar su correo', async () => {
        const res = await post(valid)
        expect(res.status).toBe(400)
        expect((await res.json()).error).toMatch(/correo/i)
        expect(create).not.toHaveBeenCalled()
    })

    it('un visitante con correo crea el ticket (correo en minusculas, ruta sin parametros)', async () => {
        const res = await post({ ...valid, email: 'Ana@Correo.CL', pageUrl: 'https://psydoctor.cl/buscar?x=secreto' })
        expect(res.status).toBe(200)
        expect((await res.json()).number).toBe(42)
        const data = create.mock.calls[0][0].data
        expect(data.contactEmail).toBe('ana@correo.cl')
        expect(data.userId).toBeNull()
        expect(data.pageUrl).toBe('/buscar')
    })

    it('un usuario con sesion usa los datos de su cuenta, no los del cuerpo', async () => {
        session.mockResolvedValue({ user: { id: 'u1' } })
        findUser.mockResolvedValue({ id: 'u1', role: 'PROFESSIONAL', name: 'Pedro', email: 'pedro@correo.cl', isActive: true })
        await post({ ...valid, email: 'otro@correo.cl', name: 'Suplantado' })
        const data = create.mock.calls[0][0].data
        expect(data).toMatchObject({ userId: 'u1', userRole: 'PROFESSIONAL', contactEmail: 'pedro@correo.cl', contactName: 'Pedro' })
    })

    it('una cuenta desactivada no puede enviar', async () => {
        session.mockResolvedValue({ user: { id: 'u2' } })
        findUser.mockResolvedValue({ id: 'u2', role: 'PATIENT', name: 'X', email: 'x@y.cl', isActive: false })
        const res = await post(valid)
        expect(res.status).toBe(403)
        expect(create).not.toHaveBeenCalled()
    })

    it('limita los envios: el sexto en una hora recibe 429', async () => {
        const ip = '203.0.113.9'
        const body = { ...valid, email: 'rate@correo.cl' }
        for (let i = 0; i < 5; i++) expect((await post(body, ip)).status).toBe(200)
        const res = await post(body, ip)
        expect(res.status).toBe(429)
        expect(res.headers.get('retry-after')).toBeTruthy()
    })
})

describe('GET /api/soporte/tickets', () => {
    it('exige sesion', async () => {
        const res = await GET()
        expect(res.status).toBe(401)
    })

    it('solo trae los tickets del usuario y nunca las notas internas', async () => {
        session.mockResolvedValue({ user: { id: 'u1' } })
        ;(prisma.supportTicket.findMany as jest.Mock).mockResolvedValue([])
        await GET()
        const args = (prisma.supportTicket.findMany as jest.Mock).mock.calls[0][0]
        expect(args.where).toEqual({ userId: 'u1' })
        expect(args.select.adminNotes).toBeUndefined()
        expect(args.select.adminResponse).toBe(true)
    })
})
