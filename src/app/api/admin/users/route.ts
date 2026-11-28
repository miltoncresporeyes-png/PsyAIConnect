import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/generated/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { getEffectiveTier } from '@/lib/plans'
import { pageMeta, parseEnum, parsePagination, parseSearch } from '@/lib/admin/query'

export const dynamic = 'force-dynamic'

const ROLES = ['PATIENT', 'PROFESSIONAL', 'ADMIN'] as const
const STATUSES = ['active', 'banned'] as const
const VERIFICATIONS = ['PENDING', 'VERIFIED', 'REJECTED'] as const
const SORTS = ['recent', 'oldest', 'name'] as const

/** Usuarios con busqueda, filtros y paginacion (antes devolvia todos de una vez). */
export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    try {
        const sp = req.nextUrl.searchParams
        const pagination = parsePagination(sp, 25)
        const q = parseSearch(sp)
        const role = parseEnum(sp, 'role', ROLES)
        const status = parseEnum(sp, 'status', STATUSES)
        const verification = parseEnum(sp, 'verification', VERIFICATIONS)
        const sort = parseEnum(sp, 'sort', SORTS) ?? 'recent'

        const filters: Prisma.UserWhereInput[] = []
        if (q) {
            filters.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            })
        }
        if (role) filters.push({ role })
        if (status) filters.push({ isActive: status === 'active' })
        if (verification) filters.push({ professional: { is: { verificationStatus: verification } } })
        const where: Prisma.UserWhereInput = filters.length ? { AND: filters } : {}

        const orderBy: Prisma.UserOrderByWithRelationInput =
            sort === 'name' ? { name: 'asc' } : sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' }

        const [rows, total, roleGroups, banned] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy,
                skip: pagination.skip,
                take: pagination.pageSize,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    noShowCount: true,
                    _count: { select: { appointmentsAsPatient: true } },
                    professional: {
                        select: {
                            verificationStatus: true,
                            isPublic: true,
                            subscriptionTier: true,
                            subscriptionEnds: true,
                            _count: { select: { appointments: true } },
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
            prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
            prisma.user.count({ where: { isActive: false } }),
        ])

        const items = rows.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt,
            noShowCount: u.noShowCount,
            appointmentsAsPatient: u._count.appointmentsAsPatient,
            professional: u.professional
                ? {
                      verificationStatus: u.professional.verificationStatus,
                      isPublic: u.professional.isPublic,
                      tier: getEffectiveTier({
                          subscriptionTier: u.professional.subscriptionTier,
                          subscriptionEnds: u.professional.subscriptionEnds,
                      }),
                      appointments: u.professional._count.appointments,
                  }
                : null,
        }))

        const roleCount = (r: string) => roleGroups.find((g) => g.role === r)?._count._all ?? 0
        return NextResponse.json({
            items,
            ...pageMeta(total, pagination),
            summary: {
                all: roleGroups.reduce((acc, g) => acc + g._count._all, 0),
                patients: roleCount('PATIENT'),
                professionals: roleCount('PROFESSIONAL'),
                admins: roleCount('ADMIN'),
                banned,
            },
        })
    } catch (error) {
        console.error('[admin/users] error:', error)
        return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
    }
}
