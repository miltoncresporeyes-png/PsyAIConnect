import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { logAdminAction } from '@/lib/adminLogs'
import { cleanText, updateTicketSchema } from '@/lib/tickets'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: params.id },
        include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } } },
    })
    if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    return NextResponse.json(ticket)
}

/** Cambia estado, prioridad, notas internas y la respuesta visible para el usuario. Queda en la auditoria. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const parsed = updateTicketSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const input = parsed.data

    const current = await prisma.supportTicket.findUnique({ where: { id: params.id } })
    if (!current) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })

    const data: Record<string, unknown> = {}
    const changes: string[] = []
    const now = new Date()

    if (input.status && input.status !== current.status) {
        data.status = input.status
        data.resolvedAt = input.status === 'RESOLVED' || input.status === 'DISCARDED' ? now : null
        changes.push(`status:${current.status}->${input.status}`)
    }
    if (input.priority && input.priority !== current.priority) {
        data.priority = input.priority
        changes.push(`priority:${current.priority}->${input.priority}`)
    }
    if (input.adminNotes !== undefined) {
        const notes = input.adminNotes ? cleanText(input.adminNotes) || null : null
        if (notes !== current.adminNotes) {
            data.adminNotes = notes
            changes.push('notes')
        }
    }
    if (input.adminResponse !== undefined) {
        const response = input.adminResponse ? cleanText(input.adminResponse) || null : null
        if (response !== current.adminResponse) {
            data.adminResponse = response
            data.respondedAt = response ? now : null
            changes.push('response')
            // Responder un ticket nuevo lo pasa a "En revision" si no se indico otro estado
            if (response && current.status === 'NEW' && !input.status) {
                data.status = 'IN_REVIEW'
                changes.push('status:NEW->IN_REVIEW')
            }
        }
    }

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ success: true, unchanged: true })
    }

    const updated = await prisma.supportTicket.update({ where: { id: current.id }, data })
    await logAdminAction({
        adminId: guard.adminId,
        adminName: guard.adminName || undefined,
        action: 'UPDATE_TICKET',
        targetType: 'SYSTEM',
        targetId: current.id,
        targetName: `Ticket #${current.number}`,
        targetEmail: current.contactEmail || undefined,
        details: { changes: changes.join(', ') },
    })
    return NextResponse.json({ success: true, ticket: updated })
}
