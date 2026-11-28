import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/generated/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { pageMeta, parseDate, parseEnum, parsePagination, parseSearch } from '@/lib/admin/query'

export const dynamic = 'force-dynamic'

const STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const
const MODALITIES = ['ONLINE', 'IN_PERSON'] as const

/**
 * Operacion de citas: listado con filtros. NO incluye motivo de consulta ni enlaces de sala
 * (datos sensibles que el panel no necesita para operar).
 */
export async function GET(req: NextRequest) {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error

    try {
        const sp = req.nextUrl.searchParams
        const pagination = parsePagination(sp, 25)
        const q = parseSearch(sp)
        const status = parseEnum(sp, 'status', STATUSES)
        const modality = parseEnum(sp, 'modality', MODALITIES)
        const from = parseDate(sp, 'from')
        const to = parseDate(sp, 'to', true)
        const order = sp.get('order') === 'asc' ? 'asc' : 'desc'

        const filters: Prisma.AppointmentWhereInput[] = []
        if (status) filters.push({ status })
        if (modality) filters.push({ modality })
        if (from || to) filters.push({ scheduledAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } })
        if (q) {
            filters.push({
                OR: [
                    { patient: { name: { contains: q, mode: 'insensitive' } } },
                    { patient: { email: { contains: q, mode: 'insensitive' } } },
                    { professional: { user: { name: { contains: q, mode: 'insensitive' } } } },
                    { professional: { user: { email: { contains: q, mode: 'insensitive' } } } },
                ],
            })
        }
        const where: Prisma.AppointmentWhereInput = filters.length ? { AND: filters } : {}

        const [rows, total, statusGroups] = await Promise.all([
            prisma.appointment.findMany({
                where,
                orderBy: { scheduledAt: order },
                skip: pagination.skip,
                take: pagination.pageSize,
                select: {
                    id: true,
                    scheduledAt: true,
                    duration: true,
                    modality: true,
                    status: true,
                    createdAt: true,
                    cancelledBy: true,
                    cancellationReason: true,
                    patientReconfirmedAt: true,
                    professionalConfirmedAt: true,
                    patientJoinedAt: true,
                    professionalJoinedAt: true,
                    sessionEndedAt: true,
                    noShowMarkedAt: true,
                    meetSpaceName: true,
                    patient: { select: { id: true, name: true, email: true } },
                    professional: { select: { id: true, userId: true, user: { select: { name: true } } } },
                },
            }),
            prisma.appointment.count({ where }),
            prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
        ])

        const items = rows.map((a) => ({
            id: a.id,
            scheduledAt: a.scheduledAt,
            duration: a.duration,
            modality: a.modality,
            status: a.status,
            createdAt: a.createdAt,
            cancelledBy: a.cancelledBy === 'SYSTEM' ? 'SYSTEM' : a.cancelledBy ? 'USER' : null,
            cancellationReason: a.cancellationReason,
            reconfirmed: a.patientReconfirmedAt != null,
            acceptedByProfessional: a.professionalConfirmedAt != null,
            patientJoined: a.patientJoinedAt != null,
            professionalJoined: a.professionalJoinedAt != null,
            completed: a.sessionEndedAt != null,
            noShow: a.noShowMarkedAt != null,
            hasRoom: a.meetSpaceName != null,
            patient: a.patient,
            professional: { id: a.professional.id, userId: a.professional.userId, name: a.professional.user.name },
        }))

        const statusCounts: Record<string, number> = {}
        for (const g of statusGroups) statusCounts[g.status] = g._count._all

        return NextResponse.json({ items, ...pageMeta(total, pagination), statusCounts })
    } catch (error) {
        console.error('[admin/citas] error:', error)
        return NextResponse.json({ error: 'Error al obtener las citas' }, { status: 500 })
    }
}
