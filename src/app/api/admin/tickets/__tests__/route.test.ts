/** @jest-environment node */

import { GET as listGET } from '@/app/api/admin/tickets/route'
import { GET, PATCH } from '@/app/api/admin/tickets/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logAdminAction } from '@/lib/adminLogs'
import { NextRequest, NextResponse } from 'next/server'

jest.mock('@/lib/adminGuard', () => ({ requireAdmin: jest.fn() }))
jest.mock('@/lib/adminLogs', () => ({ logAdminAction: jest.fn().mockResolvedValue(undefined) }))
jest.mock('@/lib/prisma', () => ({
    prisma: {
        supportTicket: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
    },
}))

const guard = requireAdmin as jest.Mock
const findUnique = prisma.supportTicket.findUnique as jest.Mock
const update = prisma.supportTicket.update as jest.Mock

const base = { id: 't1', number: 7, status: 'NEW', priority: 'NORMAL', adminNotes: null, adminResponse: null, contactEmail: 'ana@correo.cl' }
const ctx = { params: { id: 't1' } }
const patch = (body: unknown) =>
    PATCH(new Request('http://localhost/api/admin/tickets/t1', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), ctx)

beforeEach(() => {
    jest.clearAllMocks()
    guard.mockResolvedValue({ adminId: 'a1', adminName: 'Admin', adminEmail: 'admin@psydoctor.cl' })
    findUnique.mockResolvedValue(base)
    update.mockImplementation(async ({ data }) => ({ ...base, ...data }))
})

describe('seguridad', () => {
    it('sin ser administrador ninguna ruta de tickets responde y no toca la base', async () => {
        guard.mockResolvedValue({ error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) })
        expect((await listGET(new NextRequest('http://localhost/api/admin/tickets'))).status).toBe(403)
        expect((await GET(new Request('http://localhost'), ctx)).status).toBe(403)
        expect((await patch({ status: 'RESOLVED' })).status).toBe(403)
        expect(update).not.toHaveBeenCalled()
        expect(prisma.supportTicket.findMany).not.toHaveBeenCalled()
    })
})

describe('PATCH /api/admin/tickets/[id]', () => {
    it('cerrar un ticket marca la fecha de resolucion y queda en la auditoria', async () => {
        const res = await patch({ status: 'RESOLVED' })
        expect(res.status).toBe(200)
        const data = update.mock.calls[0][0].data
        expect(data.status).toBe('RESOLVED')
        expect(data.resolvedAt).toBeInstanceOf(Date)
        expect(logAdminAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE_TICKET', targetId: 't1', details: { changes: 'status:NEW->RESOLVED' } }))
    })

    it('reabrir un ticket limpia la fecha de resolucion', async () => {
        findUnique.mockResolvedValue({ ...base, status: 'RESOLVED' })
        await patch({ status: 'IN_REVIEW' })
        expect(update.mock.calls[0][0].data.resolvedAt).toBeNull()
    })

    it('responder a un ticket nuevo lo pasa a "En revision" y registra la fecha de respuesta', async () => {
        await patch({ adminResponse: '  Gracias, lo estamos revisando.  ' })
        const data = update.mock.calls[0][0].data
        expect(data.adminResponse).toBe('Gracias, lo estamos revisando.')
        expect(data.respondedAt).toBeInstanceOf(Date)
        expect(data.status).toBe('IN_REVIEW')
    })

    it('no cambia el estado al responder si el administrador eligio otro', async () => {
        await patch({ adminResponse: 'Listo, ya quedó.', status: 'RESOLVED' })
        expect(update.mock.calls[0][0].data.status).toBe('RESOLVED')
    })

    it('sin cambios reales no escribe ni audita', async () => {
        const res = await patch({ status: 'NEW', priority: 'NORMAL' })
        expect((await res.json()).unchanged).toBe(true)
        expect(update).not.toHaveBeenCalled()
        expect(logAdminAction).not.toHaveBeenCalled()
    })

    it('rechaza estados invalidos y tickets inexistentes', async () => {
        expect((await patch({ status: 'BORRADO' })).status).toBe(400)
        findUnique.mockResolvedValue(null)
        expect((await patch({ status: 'RESOLVED' })).status).toBe(404)
    })

    it('las notas internas se guardan sin respuesta publica', async () => {
        await patch({ adminNotes: 'Reproducido en Safari' })
        const data = update.mock.calls[0][0].data
        expect(data.adminNotes).toBe('Reproducido en Safari')
        expect(data.adminResponse).toBeUndefined()
    })
})
