import { prisma } from '@/lib/prisma'
import { FOUNDER_TIER } from '@/lib/founders'

/**
 * Si el correo tiene una postulación de fundador aprobada y vigente, deja la cuenta
 * profesional con plan Pro hasta el fin del beneficio. Se llama al crear la cuenta
 * profesional (por si se registró después de ser aprobado). Nunca lanza: es un extra.
 */
export async function applyFounderBenefitForEmail(email: string | null | undefined): Promise<boolean> {
    if (!email) return false
    try {
        const application = await prisma.founderApplication.findFirst({
            where: { estado: 'aprobado', email: { equals: email, mode: 'insensitive' }, fechaFinBeneficio: { gt: new Date() } },
            select: { fechaFinBeneficio: true },
        })
        if (!application?.fechaFinBeneficio) return false

        const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: { professional: { select: { id: true, subscriptionTier: true, subscriptionEnds: true } } },
        })
        const professional = user?.professional
        if (!professional) return false

        // La insignia de fundador se muestra siempre; el plan Pro solo si no pisa un plan pagado más largo
        await prisma.professional.update({ where: { id: professional.id }, data: { isFounder: true } })
        const alreadyCovered =
            professional.subscriptionTier !== 'STARTER' &&
            professional.subscriptionEnds !== null &&
            professional.subscriptionEnds >= application.fechaFinBeneficio
        if (alreadyCovered) return false

        await prisma.professional.update({
            where: { id: professional.id },
            data: { subscriptionTier: FOUNDER_TIER, subscriptionEnds: application.fechaFinBeneficio, subscriptionCancelledAt: null },
        })
        return true
    } catch (error) {
        console.error('[fundadores] No se pudo aplicar el beneficio de fundador:', error)
        return false
    }
}
