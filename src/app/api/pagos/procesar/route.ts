import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayment, getPaymentStatus, calculateCommission } from '@/lib/payment'
import { addToInvoiceQueue } from '@/lib/billingQueue'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      )
    }

    // Obtener la cita con información del profesional
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: {
          include: { user: true },
        },
        patient: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el paciente
    if (appointment.patientId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      )
    }

    // Verificar que la cita está pendiente
    if (appointment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'La cita ya fue pagada o cancelada' },
        { status: 400 }
      )
    }

    // Obtener precio de la sesión
    const sessionPrice = appointment.professional.sessionPrice

    // Calcular comisión
    const { commission, netAmount } = calculateCommission(
      sessionPrice,
      appointment.professional.subscriptionTier
    )

    // Crear registro de pago
    const payment = await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: sessionPrice,
        commission,
        netAmount,
        status: 'PENDING',
      },
    })

    // Crear URL de pago con Flow
    const paymentResult = await createPayment({
      appointmentId: appointment.id,
      amount: sessionPrice,
      patientEmail: appointment.patient.email,
      patientName: appointment.patient.name || 'Paciente',
      professionalName: appointment.professional.user.name || 'Profesional',
      subscriptionTier: appointment.professional.subscriptionTier,
    })

    if (!paymentResult.success) {
      // Si falla la creación del pago, eliminar el registro
      await prisma.payment.delete({ where: { id: payment.id } })

      return NextResponse.json(
        { error: paymentResult.error || 'Error al crear el pago' },
        { status: 500 }
      )
    }

    // Actualizar payment con el token de Flow
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        flowToken: paymentResult.flowToken,
        flowOrderId: paymentResult.flowOrderId,
      },
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: paymentResult.paymentUrl,
      flowToken: paymentResult.flowToken,
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Webhook de Flow.cl para confirmar pagos
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { token, commerceOrder } = body

    if (!token || !commerceOrder) {
      return NextResponse.json(
        { error: 'Token y order requeridos' },
        { status: 400 }
      )
    }

    // Obtener el pago
    const payment = await prisma.payment.findFirst({
      where: {
        appointmentId: commerceOrder,
      },
      include: {
        appointment: {
          include: {
            professional: {
              include: { user: true },
            },
            patient: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    // Verificar estado del pago con Flow
    const flowStatus = await getPaymentStatus(token)

    if (!flowStatus || flowStatus.status !== 2) {
      // Pago no exitoso
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json({
        success: false,
        message: 'Pago no completado',
      })
    }

    // Pago exitoso - confirmar cita
    await prisma.$transaction([
      // Actualizar pago
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      }),

      // Actualizar cita a confirmada
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      }),
    ])

    // Agregar a la cola de facturación SII
    const appointment = payment.appointment
    const professional = appointment.professional

    // Obtener RUT del paciente desde su perfil
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: appointment.patientId },
    })

    await addToInvoiceQueue({
      appointmentId: appointment.id,
      pacienteRut: patientProfile?.rut || '',
      pacienteNombre: appointment.patient.name || '',
      pacienteEmail: appointment.patient.email || undefined,
      pacienteTelefono: appointment.patient.phone || undefined,
      servicioDescripcion: `Sesión de psicoterapia - ${professional.user.name}`,
      servicioFecha: appointment.scheduledAt.toISOString(),
      servicioMonto: payment.amount,
      descuento: 0,
      profesionalRut: professional.rut || '',
      profesionalNombre: professional.user.name || '',
    })

    return NextResponse.json({
      success: true,
      message: 'Pago confirmado y boleta en cola',
    })
  } catch (error) {
    console.error('Payment webhook error:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}
