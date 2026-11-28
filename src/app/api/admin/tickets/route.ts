import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/generated/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { pageMeta, parseEnum, parsePagination, parseSearch } from '@/lib/admin/query'
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES } from '@/lib/tickets'

export const dynamic = 'force-dynamic'

/** Listado de tickets de feedback con filtros, busqueda y paginacion. */
export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    try {
        const sp = req.nextUrl.searchParams
        const pagination = parsePagination(sp, 25)
        const q = parseSearch(sp)
        const status = parseEnum(sp, 'status', TICKET_STATUSES)
        const type = parseEnum(sp, 'type', TICKET_TYPES)
        const priority = parseEnum(sp, 'priority', TICKET_PRIORITIES)
        const sort = sp.get('sort') === 'priority' ? 'priority' : sp.get('sort') === 'oldest' ? 'oldest' : 'recent'

        const filters: Prisma.SupportTicketWhereInput[] = []
        if (status) filters.push({ status })
        if (type) filters.push({ type })
        if (priority) filters.push({ priority })
        if (q) {
            const asNumber = /^#?(\d{1,9})$/.exec(q)
            filters.push({
                OR: [
                    ...(asNumber ? [{ number: Number(asNumber[1]) }] : []),
                    { subject: { contains: q, mode: 'insensitive' } },
                    { message: { contains: q, mode: 'insensitive' } },
                    { contactEmail: { contains: q, mode: 'insensitive' } },
                    { contactName: { contains: q, mode: 'insensitive' } },
                ],
            })
        }
        const where: Prisma.SupportTicketWhereInput = filters.length ? { AND: filters } : {}

        // Prioridad: el enum se declara LOW, NORMAL, HIGH; para "mas urgente primero" se ordena descendente.
        const orderBy: Prisma.SupportTicketOrderByWithRelationInput[] =
            sort === 'oldest' ? [{ createdAt: 'asc' }] : sort === 'priority' ? [{ priority: 'desc' }, { createdAt: 'desc' }] : [{ createdAt: 'desc' }]

        const [rows, total, statusGroups] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                orderBy,
                skip: pagination.skip,
                take: pagination.pageSize,
                select: {
                    id: true,
                    number: true,
                    type: true,
                    status: true,
                    priority: true,
                    subject: true,
                    message: true,
                    contactName: true,
                    contactEmail: true,
                    userRole: true,
                    userId: true,
                    respondedAt: true,
                    createdAt: true,
                },
            }),
            prisma.supportTicket.count({ where }),
            prisma.supportTicket.groupBy({ by: ['status'], _count: { _all: true } }),
        ])

        const statusCounts: Record<string, number> = {}
        for (const g of statusGroups) statusCounts[g.status] = g._count._all

        return NextResponse.json({
            items: rows.map((t) => ({ ...t, message: t.message.length > 180 ? `${t.message.slice(0, 180)}…` : t.message })),
            ...pageMeta(total, pagination),
            statusCounts,
        })
    } catch (error) {
        console.error('[admin/tickets] error:', error)
        return NextResponse.json({ error: 'No se pudieron obtener los tickets' }, { status: 500 })
    }
}
