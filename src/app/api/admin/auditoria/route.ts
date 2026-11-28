import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { pageMeta, parseDate, parsePagination, parseSearch } from '@/lib/admin/query'

export const dynamic = 'force-dynamic'

/** Registro de acciones de administradores, con filtros y paginacion. */
export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    const sp = req.nextUrl.searchParams
    const pagination = parsePagination(sp, 30)
    const q = parseSearch(sp)
    const action = sp.get('action')
    const from = parseDate(sp, 'from')
    const to = parseDate(sp, 'to', true)

    const where = {
        ...(action ? { action } : {}),
        ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
        ...(q
            ? {
                  OR: [
                      { targetEmail: { contains: q, mode: 'insensitive' as const } },
                      { targetName: { contains: q, mode: 'insensitive' as const } },
                      { adminName: { contains: q, mode: 'insensitive' as const } },
                  ],
              }
            : {}),
    }

    const [items, total, actions] = await Promise.all([
        prisma.adminLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.pageSize }),
        prisma.adminLog.count({ where }),
        prisma.adminLog.groupBy({ by: ['action'], _count: { _all: true }, orderBy: { action: 'asc' } }),
    ])

    return NextResponse.json({
        items,
        ...pageMeta(total, pagination),
        actions: actions.map((a) => ({ action: a.action, count: a._count._all })),
    })
}
