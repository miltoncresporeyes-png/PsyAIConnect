import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMercadoPagoPayment } from '@/lib/mercadopago'
import { sendAppointmentConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Mercado Pago IPN / Webhook Handler
 * Documentation: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const topic = searchParams.get('topic') || searchParams.get('type')
        const id = searchParams.get('id') || searchParams.get('data.id')

        let body: any = {}
        try {
            body = await request.json()
        } catch {
            // body may be empty on simple query string notifications
        }

        const paymentId = id || body?.data?.id || (body?.type === 'payment' ? body?.data?.id : null)

        if (!paymentId) {
            return NextResponse.json({ received: true })
        }

        // Consult payment details directly from Mercado Pago API
        const mpPayment = await getMercadoPagoPayment(paymentId.toString())

        if (mpPayment.status === 'approved') {
            const externalReference = mpPayment.external_reference // appointmentId

            if (externalReference) {
                const payment = await prisma.payment.findFirst({
                    where: { appointmentId: externalReference },
                    include: {
                        appointment: {
                            include: {
                                patient: true,
                                professional: { include: { user: true } },
                            },
                        },
                    },
                })

                if (payment && payment.status !== 'COMPLETED') {
                    await prisma.$transaction([
                        prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: 'COMPLETED',
                                paidAt: new Date(),
                                externalOrderId: paymentId.toString(),
                            },
                        }),
                        prisma.appointment.update({
                            where: { id: payment.appointmentId },
                            data: { status: 'CONFIRMED' },
                        }),
                    ])

                    try {
                        const scheduledDate = new Date(payment.appointment.scheduledAt)
                        const dateStr = scheduledDate.toLocaleDateString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })
                        const timeStr = scheduledDate.toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        const modality = payment.appointment.modality === 'ONLINE' ? 'Videollamada' : 'Presencial'

                        await sendAppointmentConfirmationEmail(
                            payment.appointment.patient.email,
                            payment.appointment.patient.name || 'Paciente',
                            payment.appointment.professional.user.name || 'Profesional',
                            dateStr,
                            timeStr,
                            modality,
                            payment.appointment.videoLink || undefined
                        )
                    } catch (emailErr) {
                        console.error('Error enviando email tras pago Mercado Pago:', emailErr)
                    }
                }
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('Error en webhook de Mercado Pago:', error)
        // Return 200/ok to avoid repeated retries for bad payloads
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 200 })
    }
}
