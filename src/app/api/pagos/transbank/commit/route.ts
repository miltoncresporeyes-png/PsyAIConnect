import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { commitWebpayTransaction } from '@/lib/transbank'
import { sendAppointmentConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Transbank Webpay Plus return URL handler
 * Transbank sends token_ws via GET or POST when payment completes
 */
async function handleWebpayReturn(request: Request) {
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token_ws')
    const tbkToken = searchParams.get('TBK_TOKEN')
    const tbkOrdenCompra = searchParams.get('TBK_ORDEN_COMPRA')
    const appointmentId = searchParams.get('appointmentId')

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'

    // If user cancelled or aborted in Webpay form
    if (tbkToken || !token) {
        console.warn('Webpay transaction aborted or cancelled by user:', { tbkToken, tbkOrdenCompra, appointmentId })
        return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/confirmar?error=transbank_cancelled`)
    }

    try {
        // Commit transaction in Transbank
        const result = await commitWebpayTransaction(token)

        if (result.status === 'AUTHORIZED' && result.response_code === 0) {
            // Find payment by token or appointmentId
            const payment = await prisma.payment.findFirst({
                where: {
                    OR: [
                        { externalToken: token },
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
                            externalOrderId: result.buy_order,
                        },
                    }),
                    prisma.appointment.update({
                        where: { id: payment.appointmentId },
                        data: { status: 'CONFIRMED' },
                    }),
                ])

                // Trigger confirmation email
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
                    console.error('Error enviando email tras pago Webpay:', emailErr)
                }

                return NextResponse.redirect(`${baseUrl}/cita/${payment.appointmentId}/exito?provider=TRANSBANK`)
            }

            return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/exito?provider=TRANSBANK`)
        } else {
            console.error('Webpay transaction rejected:', result)
            return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/confirmar?error=transbank_rejected`)
        }
    } catch (error) {
        console.error('Error procesando commit de Webpay:', error)
        return NextResponse.redirect(`${baseUrl}/cita/${appointmentId || ''}/confirmar?error=transbank_error`)
    }
}

export async function GET(request: Request) {
    return handleWebpayReturn(request)
}

export async function POST(request: Request) {
    return handleWebpayReturn(request)
}
