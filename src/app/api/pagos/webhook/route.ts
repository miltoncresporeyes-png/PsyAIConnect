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
        let token = searchParams.get('token')
        let signature = searchParams.get('s')
        let params: Record<string, string> = Object.fromEntries(searchParams.entries())

        // Flow sometimes posts application/x-www-form-urlencoded
        const contentType = request.headers.get('content-type') || ''
        if ((!token || !signature) && contentType.includes('application/x-www-form-urlencoded')) {
            try {
                const text = await request.text()
                const formParams = new URLSearchParams(text)
                token = token || formParams.get('token')
                signature = signature || formParams.get('s')
                formParams.forEach((val, key) => {
                    params[key] = val
                })
            } catch {
                // Ignore parse errors, fallback to params
            }
        }

        if (!token) {
            console.error('Missing token in Flow webhook')
            return NextResponse.json(
                { error: 'Parámetros inválidos' },
                { status: 400 }
            )
        }

        // Validate webhook signature if provided (or strictly if secret configured)
        if (signature) {
            const isValid = validateWebhookSignature(params, signature)
            if (!isValid) {
                console.error('Invalid webhook signature')
                return NextResponse.json(
                    { error: 'Firma inválida' },
                    { status: 401 }
                )
            }
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
