import { prisma } from '@/lib/prisma'
import { getPaymentStatus, FLOW_STATUS } from '@/lib/flow'

/**
 * Reconciliation script for pending Flow payments.
 * Queries payments in PENDING state that have a flowToken,
 * calls Flow getPaymentStatus, and updates DB transactionally.
 */
export async function reconcilePendingPayments(): Promise<{
    checked: number
    updated: number
    errors: number
}> {
    const pendingPayments = await prisma.payment.findMany({
        where: {
            status: 'PENDING',
            flowToken: { not: null },
        },
        include: {
            appointment: true,
        },
        take: 50,
    })

    let updated = 0
    let errors = 0

    for (const payment of pendingPayments) {
        if (!payment.flowToken) continue

        try {
            const status = await getPaymentStatus(payment.flowToken)
            if (status.status === FLOW_STATUS.PAID) {
                await prisma.$transaction([
                    prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'COMPLETED',
                            paidAt: status.paymentDate ? new Date(status.paymentDate) : new Date(),
                            flowOrderId: status.flowOrder ? status.flowOrder.toString() : undefined,
                        },
                    }),
                    prisma.appointment.update({
                        where: { id: payment.appointmentId },
                        data: {
                            status: 'CONFIRMED',
                        },
                    }),
                ])
                updated++
            } else if (
                status.status === FLOW_STATUS.REJECTED ||
                status.status === FLOW_STATUS.CANCELLED
            ) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'FAILED' },
                })
                updated++
            }
        } catch (err) {
            console.error(`Reconciliation error for payment ${payment.id}:`, err)
            errors++
        }
    }

    return {
        checked: pendingPayments.length,
        updated,
        errors,
    }
}

if (require.main === module) {
    reconcilePendingPayments()
        .then((res) => {
            console.log('Reconciliation result:', res)
            process.exit(0)
        })
        .catch((err) => {
            console.error('Fatal error during reconciliation:', err)
            process.exit(1)
        })
}
