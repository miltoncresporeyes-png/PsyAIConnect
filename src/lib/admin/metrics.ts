import { prisma } from '@/lib/prisma'
import { PLANS, getEffectiveTier, type PlanTier } from '@/lib/plans'
import { change, fillSeries, lastNDays, pct, sum, type SeriesPoint } from '@/lib/admin/series'
import { getSystemHealth, type SystemHealth } from '@/lib/admin/health'

const DAY = 24 * 60 * 60 * 1000

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface AdminAlert {
    id: string
    severity: AlertSeverity
    title: string
    detail: string
    href?: string
}

export interface Overview {
    generatedAt: string
    users: {
        total: number
        byRole: { patients: number; professionals: number; admins: number }
        banned: number
        new7d: number
        new30d: number
        new30dChange: number | null
        signupsDaily: SeriesPoint[]
    }
    professionals: {
        total: number
        pending: number
        verified: number
        rejected: number
        visible: number
        verifiedWithoutAvailability: number
        byTier: Record<PlanTier, number>
    }
    appointments: {
        created30d: number
        byStatus: Record<string, number>
        funnel: { requested: number; accepted: number; completed: number }
        acceptanceRate: number | null
        completionRate: number | null
        noShowRate: number | null
        pendingAcceptance: number
        atRisk: number
        upcoming7d: number
        unreconfirmed24h: number
        modality: { online: number; inPerson: number }
        createdDaily: SeriesPoint[]
        completedDaily: SeriesPoint[]
    }
    revenue: {
        mrrEstimate: number
        paidSubscriptions: number
        paidThisMonth: number
        paidOrdersThisMonth: number
        ordersByStatus: Record<string, number>
        expiringSoon: { id: string; name: string | null; email: string; tier: string; endsAt: string }[]
        expiringSoonCount: number
    }
    founders: { approved: number; pending: number; benefitExpiring90d: number }
    tickets: { new: number; inReview: number; last7d: number; highPriorityOpen: number }
    waitlist: { patients: number; professionals: number; entries: number }
    health: SystemHealth
    alerts: AdminAlert[]
}

interface DayRow {
    day: string
    n: number
}

/** Alertas accionables a partir de las metricas y la salud del sistema. Pura: se prueba sin base de datos. */
export function buildAlerts(input: {
    pendingVerification: number
    pendingFounders: number
    atRiskAppointments: number
    unreconfirmed24h: number
    verifiedWithoutAvailability: number
    verifiedProfessionals: number
    expiringSoonCount: number
    newTickets: number
    highPriorityOpenTickets: number
    health: SystemHealth
}): AdminAlert[] {
    const { health } = input
    const alerts: AdminAlert[] = []

    if (!health.database.ok) {
        alerts.push({ id: 'db', severity: 'critical', title: 'Base de datos sin respuesta', detail: 'La consulta de prueba falló.', href: '/admin/sistema' })
    }
    if (health.cron.status === 'never') {
        alerts.push({ id: 'cron-never', severity: 'critical', title: 'El cron de recordatorios nunca se ha ejecutado', detail: 'Sin él no hay recordatorios ni se liberan horarios sin reconfirmar.', href: '/admin/sistema' })
    } else if (health.cron.status === 'late') {
        alerts.push({ id: 'cron-late', severity: 'critical', title: 'El cron de recordatorios está atrasado', detail: `Debería correr cada ${health.cron.expectedEveryMin} min. Última ejecución: ${health.cron.lastRunAt}.`, href: '/admin/sistema' })
    } else if (health.cron.status === 'error') {
        alerts.push({ id: 'cron-error', severity: 'critical', title: 'La última ejecución del cron falló', detail: health.cron.lastError || 'Revisa los registros.', href: '/admin/sistema' })
    }
    if (!health.meet.connected) {
        alerts.push({
            id: 'meet',
            severity: input.verifiedProfessionals > 0 ? 'critical' : 'warning',
            title: 'Google Meet no está conectado',
            detail: 'Sin la cuenta conectada no se pueden crear las salas de las citas online.',
            href: '/admin/salas',
        })
    }
    const missingConfig = health.config.filter((c) => !c.ok)
    if (missingConfig.length > 0) {
        alerts.push({
            id: 'config',
            severity: 'warning',
            title: `${missingConfig.length} ajuste(s) de configuración por revisar`,
            detail: missingConfig.map((c) => c.label).join(' · '),
            href: '/admin/sistema',
        })
    }
    if (input.pendingVerification > 0) {
        alerts.push({ id: 'verify', severity: 'warning', title: `${input.pendingVerification} profesional(es) esperando verificación`, detail: 'Revisa su registro en la Superintendencia de Salud.', href: '/admin/validacion-medicos' })
    }
    if (input.pendingFounders > 0) {
        alerts.push({ id: 'founders', severity: 'warning', title: `${input.pendingFounders} postulación(es) de fundadores pendientes`, detail: 'Hay cupos del programa por resolver.', href: '/admin/fundadores' })
    }
    if (input.newTickets > 0) {
        alerts.push({
            id: 'tickets',
            severity: input.highPriorityOpenTickets > 0 || input.newTickets >= 5 ? 'warning' : 'info',
            title: `${input.newTickets} ticket(s) de soporte sin revisar`,
            detail: input.highPriorityOpenTickets > 0 ? `${input.highPriorityOpenTickets} de prioridad alta abierto(s).` : 'Usuarios esperando una respuesta.',
            href: '/admin/tickets?status=NEW',
        })
    }
    if (input.atRiskAppointments > 0) {
        alerts.push({ id: 'at-risk', severity: 'warning', title: `${input.atRiskAppointments} solicitud(es) sin aceptar a menos de 6 h`, detail: 'Caducan a las 2 h de la cita si el profesional no responde.', href: '/admin/citas?status=PENDING' })
    }
    if (input.unreconfirmed24h > 0) {
        alerts.push({ id: 'reconfirm', severity: 'info', title: `${input.unreconfirmed24h} cita(s) próximas sin reconfirmar`, detail: 'Se liberan 3 h antes si el paciente no reconfirma.', href: '/admin/citas?status=CONFIRMED' })
    }
    if (input.verifiedWithoutAvailability > 0) {
        alerts.push({ id: 'availability', severity: 'info', title: `${input.verifiedWithoutAvailability} profesional(es) verificados sin disponibilidad`, detail: 'Aparecen en el buscador pero no tienen horarios para reservar.', href: '/admin/usuarios?role=PROFESSIONAL' })
    }
    if (input.expiringSoonCount > 0) {
        alerts.push({ id: 'expiring', severity: 'info', title: `${input.expiringSoonCount} suscripción(es) vencen en 30 días`, detail: 'Conviene contactarlos para la renovación.', href: '/admin/suscripciones' })
    }
    if (health.invoices.failed + health.invoices.manualReview > 0) {
        alerts.push({ id: 'invoices', severity: 'warning', title: `${health.invoices.failed + health.invoices.manualReview} boleta(s) con error o en revisión manual`, detail: 'La emisión no se completó automáticamente.', href: '/admin/sistema' })
    }
    if (health.waitlistMode) {
        alerts.push({ id: 'waitlist', severity: 'info', title: 'Modo lista de espera activo', detail: 'La API de reservas responde 404 al público.', href: '/admin/sistema' })
    }

    const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
    return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

export async function getOverview(now: Date = new Date()): Promise<Overview> {
    const since30 = new Date(now.getTime() - 30 * DAY)
    const since60 = new Date(now.getTime() - 60 * DAY)
    const since7 = new Date(now.getTime() - 7 * DAY)
    const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000)
    const in24h = new Date(now.getTime() + DAY)
    const in7d = new Date(now.getTime() + 7 * DAY)
    const in30d = new Date(now.getTime() + 30 * DAY)
    const in90d = new Date(now.getTime() + 90 * DAY)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const days = lastNDays(30, now)

    const [
        roleGroups,
        banned,
        new7d,
        new30d,
        newPrev30d,
        signupRows,
        professionalRows,
        availabilityGroups,
        apptStatusGroups,
        apptAccepted,
        apptModality,
        apptHeldCompleted,
        apptHeldNoShow,
        pendingAcceptance,
        atRisk,
        upcoming7d,
        unreconfirmed24h,
        createdRows,
        completedRows,
        paidThisMonth,
        orderGroups,
        expiringRows,
        founderGroups,
        founderExpiring,
        waitlistPatients,
        waitlistProfessionals,
        waitlistEntries,
        ticketGroups,
        ticketsLast7d,
        highPriorityOpenTickets,
        health,
    ] = await Promise.all([
        prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { createdAt: { gte: since7 } } }),
        prisma.user.count({ where: { createdAt: { gte: since30 } } }),
        prisma.user.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
        prisma.$queryRaw<DayRow[]>`
            SELECT to_char((("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Santiago')::date, 'YYYY-MM-DD') AS day, count(*)::int AS n
            FROM "User" WHERE "createdAt" >= ${since30} GROUP BY 1`,
        prisma.professional.findMany({
            select: { id: true, verificationStatus: true, isPublic: true, isActive: true, subscriptionTier: true, subscriptionEnds: true },
        }),
        prisma.availability.groupBy({ by: ['professionalId'], where: { isActive: true }, _count: { _all: true } }),
        prisma.appointment.groupBy({ by: ['status'], where: { createdAt: { gte: since30 } }, _count: { _all: true } }),
        prisma.appointment.count({ where: { createdAt: { gte: since30 }, professionalConfirmedAt: { not: null } } }),
        prisma.appointment.groupBy({ by: ['modality'], where: { createdAt: { gte: since30 } }, _count: { _all: true } }),
        prisma.appointment.count({ where: { status: 'COMPLETED', scheduledAt: { gte: since30, lte: now } } }),
        prisma.appointment.count({ where: { status: 'NO_SHOW', scheduledAt: { gte: since30, lte: now } } }),
        prisma.appointment.count({ where: { status: 'PENDING', scheduledAt: { gt: now } } }),
        prisma.appointment.count({ where: { status: 'PENDING', scheduledAt: { gt: now, lte: in6h } } }),
        prisma.appointment.count({ where: { status: 'CONFIRMED', scheduledAt: { gte: now, lte: in7d } } }),
        prisma.appointment.count({ where: { status: 'CONFIRMED', patientReconfirmedAt: null, scheduledAt: { gte: now, lte: in24h } } }),
        prisma.$queryRaw<DayRow[]>`
            SELECT to_char((("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Santiago')::date, 'YYYY-MM-DD') AS day, count(*)::int AS n
            FROM "Appointment" WHERE "createdAt" >= ${since30} GROUP BY 1`,
        prisma.$queryRaw<DayRow[]>`
            SELECT to_char((("scheduledAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Santiago')::date, 'YYYY-MM-DD') AS day, count(*)::int AS n
            FROM "Appointment" WHERE status = 'COMPLETED' AND "scheduledAt" >= ${since30} AND "scheduledAt" <= ${now} GROUP BY 1`,
        prisma.subscriptionOrder.aggregate({
            where: { status: 'PAID', paidAt: { gte: monthStart } },
            _sum: { amount: true },
            _count: { _all: true },
        }),
        prisma.subscriptionOrder.groupBy({ by: ['status'], where: { createdAt: { gte: since30 } }, _count: { _all: true } }),
        prisma.professional.findMany({
            where: { subscriptionTier: { not: 'STARTER' }, subscriptionEnds: { gt: now, lte: in30d } },
            select: { id: true, subscriptionTier: true, subscriptionEnds: true, user: { select: { name: true, email: true } } },
            orderBy: { subscriptionEnds: 'asc' },
            take: 10,
        }),
        prisma.founderApplication.groupBy({ by: ['estado'], _count: { _all: true } }),
        prisma.founderApplication.count({ where: { estado: 'aprobado', fechaFinBeneficio: { gt: now, lte: in90d } } }),
        prisma.waitlistPatient.count(),
        prisma.waitlistProfessional.count(),
        prisma.waitlistEntry.count(),
        prisma.supportTicket.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.supportTicket.count({ where: { createdAt: { gte: since7 } } }),
        prisma.supportTicket.count({ where: { priority: 'HIGH', status: { in: ['NEW', 'IN_REVIEW'] } } }),
        getSystemHealth(now),
    ])

    // ── Usuarios ─────────────────────────────────────────────
    const roleCount = (role: string) => roleGroups.find((g) => g.role === role)?._count._all ?? 0
    const byRole = { patients: roleCount('PATIENT'), professionals: roleCount('PROFESSIONAL'), admins: roleCount('ADMIN') }

    // ── Profesionales ────────────────────────────────────────
    const withAvailability = new Set(availabilityGroups.map((g) => g.professionalId))
    const byTier: Record<PlanTier, number> = { STARTER: 0, PRO: 0, PREMIUM: 0 }
    let pending = 0
    let verified = 0
    let rejected = 0
    let visible = 0
    let verifiedWithoutAvailability = 0
    let mrrEstimate = 0
    let paidSubscriptions = 0
    for (const p of professionalRows) {
        if (p.verificationStatus === 'PENDING') pending++
        else if (p.verificationStatus === 'REJECTED') rejected++
        else if (p.verificationStatus === 'VERIFIED') {
            verified++
            if (!withAvailability.has(p.id)) verifiedWithoutAvailability++
            if (p.isPublic && p.isActive) visible++
        }
        const tier = getEffectiveTier({ subscriptionTier: p.subscriptionTier, subscriptionEnds: p.subscriptionEnds })
        byTier[tier]++
        if (tier !== 'STARTER') {
            paidSubscriptions++
            mrrEstimate += PLANS[tier].monthlyPrice
        }
    }

    // ── Citas ────────────────────────────────────────────────
    const byStatus: Record<string, number> = {}
    for (const g of apptStatusGroups) byStatus[g.status] = g._count._all
    const created30d = Object.values(byStatus).reduce((a, b) => a + b, 0)
    const completedCount = byStatus['COMPLETED'] ?? 0
    const modalityCount = (m: string) => apptModality.find((g) => g.modality === m)?._count._all ?? 0
    const held = apptHeldCompleted + apptHeldNoShow

    const createdDaily = fillSeries(createdRows, days)
    const completedDaily = fillSeries(completedRows, days)

    // ── Ingresos ─────────────────────────────────────────────
    const ordersByStatus: Record<string, number> = {}
    for (const g of orderGroups) ordersByStatus[g.status] = g._count._all
    const expiringSoon = expiringRows.map((p) => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        tier: p.subscriptionTier,
        endsAt: (p.subscriptionEnds as Date).toISOString(),
    }))

    // ── Fundadores ───────────────────────────────────────────
    const founderCount = (estado: string) => founderGroups.find((g) => g.estado === estado)?._count._all ?? 0

    const alerts = buildAlerts({
        pendingVerification: pending,
        pendingFounders: founderCount('pendiente'),
        atRiskAppointments: atRisk,
        unreconfirmed24h,
        verifiedWithoutAvailability,
        verifiedProfessionals: verified,
        expiringSoonCount: expiringSoon.length,
        newTickets: ticketGroups.find((g) => g.status === 'NEW')?._count._all ?? 0,
        highPriorityOpenTickets,
        health,
    })

    return {
        generatedAt: now.toISOString(),
        users: {
            total: byRole.patients + byRole.professionals + byRole.admins,
            byRole,
            banned,
            new7d,
            new30d,
            new30dChange: change(new30d, newPrev30d),
            signupsDaily: fillSeries(signupRows, days),
        },
        professionals: {
            total: professionalRows.length,
            pending,
            verified,
            rejected,
            visible,
            verifiedWithoutAvailability,
            byTier,
        },
        appointments: {
            created30d,
            byStatus,
            funnel: { requested: created30d, accepted: apptAccepted, completed: completedCount },
            acceptanceRate: pct(apptAccepted, created30d),
            completionRate: pct(completedCount, apptAccepted),
            noShowRate: pct(apptHeldNoShow, held),
            pendingAcceptance,
            atRisk,
            upcoming7d,
            unreconfirmed24h,
            modality: { online: modalityCount('ONLINE'), inPerson: modalityCount('IN_PERSON') },
            createdDaily,
            completedDaily,
        },
        revenue: {
            mrrEstimate,
            paidSubscriptions,
            paidThisMonth: paidThisMonth._sum.amount ?? 0,
            paidOrdersThisMonth: paidThisMonth._count._all,
            ordersByStatus,
            expiringSoon,
            expiringSoonCount: expiringSoon.length,
        },
        founders: {
            approved: founderCount('aprobado'),
            pending: founderCount('pendiente'),
            benefitExpiring90d: founderExpiring,
        },
        waitlist: { patients: waitlistPatients, professionals: waitlistProfessionals, entries: waitlistEntries },
        tickets: {
            new: ticketGroups.find((g) => g.status === 'NEW')?._count._all ?? 0,
            inReview: ticketGroups.find((g) => g.status === 'IN_REVIEW')?._count._all ?? 0,
            last7d: ticketsLast7d,
            highPriorityOpen: highPriorityOpenTickets,
        },
        health,
        alerts,
    }
}

export { sum as sumSeries }
