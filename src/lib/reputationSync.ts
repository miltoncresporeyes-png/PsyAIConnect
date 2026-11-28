import { prisma } from '@/lib/prisma'
import { REPUTATION_CONFIG, attendanceRate, bayesianScore, computeTier, medianHours, reviewWeight } from '@/lib/reputation'

const DAY = 24 * 60 * 60 * 1000

/**
 * Recalcula y guarda la reputación desnormalizada de un profesional
 * (nota, cantidad, nivel y asistencia). Se llama al publicar/retirar una opinión y desde el cron.
 */
export async function recomputeProfessionalReputation(professionalId: string, now = new Date()) {
    const since = new Date(now.getTime() - REPUTATION_CONFIG.windowDays * DAY)

    const [professional, reviews, appointments] = await Promise.all([
        prisma.professional.findUnique({ where: { id: professionalId }, select: { userId: true } }),
        prisma.review.findMany({
            where: { professionalId, status: 'PUBLISHED', createdAt: { gte: since } },
            select: { rating: true, createdAt: true },
        }),
        prisma.appointment.findMany({
            where: { professionalId, scheduledAt: { gte: since, lte: now }, status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
            select: { status: true, scheduledAt: true, cancelledAt: true, cancelledBy: true, createdAt: true, professionalConfirmedAt: true },
        }),
    ])
    if (!professional) return null

    const lateCancellations = appointments.filter(
        (a) =>
            a.status === 'CANCELLED' &&
            a.cancelledBy === professional.userId &&
            a.cancelledAt !== null &&
            a.scheduledAt.getTime() - a.cancelledAt.getTime() < DAY
    ).length

    const counted = reviews.filter((r) => reviewWeight(r.createdAt, now) > 0).length
    const score = bayesianScore(reviews, now)
    const attendance = attendanceRate(appointments.length, lateCancellations)
    // Tiempo de respuesta: horas entre la solicitud y la aceptación del profesional
    const responseHours = medianHours(
        appointments
            .filter((a) => a.professionalConfirmedAt !== null)
            .map((a) => Math.max(0, (a.professionalConfirmedAt!.getTime() - a.createdAt.getTime()) / 3600000))
    )
    const tier = computeTier(counted, score, attendance, responseHours)

    await prisma.professional.update({
        where: { id: professionalId },
        data: { ratingScore: score, ratingCount: counted, reputationTier: tier, attendanceRate: attendance, responseHours, reputationUpdatedAt: now },
    })
    return { score, count: counted, tier, attendance, responseHours }
}

/** Recalcula a todos los profesionales con opiniones (cron). */
export async function recomputeAllReputations(now = new Date()): Promise<number> {
    const rows = await prisma.review.findMany({ where: { status: 'PUBLISHED' }, distinct: ['professionalId'], select: { professionalId: true } })
    let n = 0
    for (const { professionalId } of rows) {
        await recomputeProfessionalReputation(professionalId, now).catch((e) => console.error('[reputacion]', e))
        n++
    }
    return n
}
