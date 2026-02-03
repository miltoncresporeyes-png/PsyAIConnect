import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentStatus, validateWebhookSignature, FLOW_STATUS } from '@/lib/flow'
import { sendAppointmentConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Flow.cl Webhook Handler
 * Flow calls this endpoint when a payment is completed/failed
 * 
 * Expected params from Flow:
 * - token: Payment token
 * - s: HMAC signature for validation
 */
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')
        const signature = searchParams.get('s')

        if (!token || !signature) {
            console.error('Missing token or signature')
            return NextResponse.json(
                { error: 'Parámetros inválidos' },
                { status: 400 }
            )
        }

        // Validate webhook signature
        const params = Object.fromEntries(searchParams.entries())
        const isValid = validateWebhookSignature(params, signature)

        if (!isValid) {
            console.error('Invalid webhook signature')
            return NextResponse.json(
                { error: 'Firma inválida' },
                { status: 401 }
            )
        }

        // Get payment status from Flow
        const paymentStatus = await getPaymentStatus(token)

        // Find payment in our database
        const payment = await prisma.payment.findFirst({
            where: { flowToken: token },
            include: {
                appointment: {
                    include: {
                        patient: true,
                        professional: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        })

        if (!payment) {
            console.error('Payment not found for token:', token)
            return NextResponse.json(
                { error: 'Pago no encontrado' },
                { status: 404 }
            )
        }

        // Prevent duplicate processing
        if (payment.status === 'COMPLETED') {
            console.log('Payment already processed:', payment.id)
            return NextResponse.json({ success: true })
        }

        // Handle payment status
        if (paymentStatus.status === FLOW_STATUS.PAID) {
            // Payment successful
            await prisma.$transaction([
                // Update payment
                prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'COMPLETED',
                        paidAt: new Date(),
                        flowOrderId: paymentStatus.flowOrder.toString(),
                    },
                }),
                // Update appointment
                prisma.appointment.update({
                    where: { id: payment.appointmentId },
                    data: {
                        status: 'CONFIRMED',
                        // Generate video link for online appointments
                        videoLink: payment.appointment.modality === 'ONLINE'
                            ? `https://meet.google.com/psyconnect-${payment.appointmentId.slice(0, 8)}`
                            : null,
                    },
                }),
            ])

            // Send confirmation email
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
                const modality = payment.appointment.modality === 'ONLINE'
                    ? 'Videollamada'
                    : 'Presencial'

                await sendAppointmentConfirmationEmail(
                    payment.appointment.patient.email,
                    payment.appointment.patient.name || 'Paciente',
                    payment.appointment.professional.user.name || 'Profesional',
                    dateStr,
                    timeStr,
                    modality,
                    payment.appointment.modality === 'ONLINE'
                        ? `https://meet.google.com/psyconnect-${payment.appointmentId.slice(0, 8)}`
                        : undefined
                )

                console.log('Confirmation email sent to:', payment.appointment.patient.email)
            } catch (emailError) {
                // Log but don't fail the payment process
                console.error('Failed to send confirmation email:', emailError)
            }

            console.log('Payment confirmed:', {
                appointmentId: payment.appointmentId,
                flowOrder: paymentStatus.flowOrder,
                patient: payment.appointment.patient.email,
            })

        } else if (paymentStatus.status === FLOW_STATUS.REJECTED) {
            // Payment rejected
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            })

            console.log('Payment rejected:', payment.id)

        } else if (paymentStatus.status === FLOW_STATUS.CANCELLED) {
            // Payment cancelled
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            })

            console.log('Payment cancelled:', payment.id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Error al procesar webhook' },
            { status: 500 }
        )
    }
}
