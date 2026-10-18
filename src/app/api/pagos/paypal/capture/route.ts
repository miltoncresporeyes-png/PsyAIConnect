import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePayPalOrder } from '@/lib/paypal'
import { sendAppointmentConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * PayPal return handler to capture order and confirm appointment
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token') // PayPal Order ID
    const appointmentId = searchParams.get('appointmentId')

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'

    if (!token) {
        return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/confirmar?error=paypal_missing_token`)
    }

    try {
        const capture = await capturePayPalOrder(token)

        if (capture.status === 'COMPLETED') {
            const payment = await prisma.payment.findFirst({
                where: {
                    OR: [
                        { externalOrderId: token },
                        ...(appointmentId ? [{ appointmentId }] : []),
                    ],
                },
                include: {
                    appointment: {
                        include: {
                            patient: true,
                            professional: { include: { user: true } },
                        },
                    },
                },
            })

            if (payment) {
                await prisma.$transaction([
                    prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'COMPLETED',
                            paidAt: new Date(),
                            externalOrderId: token,
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
                    console.error('Error enviando email tras pago PayPal:', emailErr)
                }

                return NextResponse.redirect(`${baseUrl}/cita/${payment.appointmentId}/exito?provider=PAYPAL`)
            }

            return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/exito?provider=PAYPAL`)
        } else {
            console.error('PayPal capture not completed:', capture)
            return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/confirmar?error=paypal_not_completed`)
        }
    } catch (error) {
        console.error('Error capturando orden de PayPal:', error)
        return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/confirmar?error=paypal_error`)
    }
}
