import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit';
import { captureApiError, getRequestId } from '@/lib/observability';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestId = getRequestId(request)
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const clientIp = getClientIp(request)
    const confirmLimit = checkRateLimit(`pre-reservation:confirm:${session.user.id}:${clientIp}`, {
      limit: 15,
      windowMs: 15 * 60 * 1000,
    })

    if (!confirmLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos de confirmacion. Intenta nuevamente mas tarde.' },
        { status: 429, headers: createRateLimitHeaders(confirmLimit) }
      )
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Find the pre-reservation
    const preReservation = await prisma.preReservation.findUnique({
      where: { token },
      include: {
        professional: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!preReservation) {
      return NextResponse.json(
        { error: 'Pre-reserva no encontrada' },
        { status: 404 }
      );
    }

    if (preReservation.userId && preReservation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'La pre-reserva pertenece a otro usuario' },
        { status: 403 }
      );
    }

    // Check if already confirmed
    if (preReservation.confirmed) {
      return NextResponse.json(
        { error: 'Esta pre-reserva ya fue confirmada' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > preReservation.expiresAt) {
      // Delete expired pre-reservation
      await prisma.preReservation.delete({
        where: { token },
      });

      return NextResponse.json(
        { 
          error: 'La pre-reserva ha expirado. Por favor, selecciona una nueva hora.',
          code: 'EXPIRED' 
        },
        { status: 400 }
      );
    }

    // Check if slot was already booked while reservation was pending
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId: preReservation.professionalId,
        scheduledAt: preReservation.scheduledAt,
        status: { notIn: ['CANCELLED'] },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          error: 'Este horario ya esta ocupado. Selecciona otro horario.',
          code: 'SLOT_BOOKED',
        },
        { status: 409 }
      );
    }

    // Create the actual appointment
    const appointment = await prisma.appointment.create({
      data: {
        scheduledAt: preReservation.scheduledAt,
        duration: preReservation.duration,
        status: 'CONFIRMED',
        modality: 'ONLINE', // Default to online, can be changed later
        patient: {
          connect: { id: session.user.id },
        },
        professional: {
          connect: { id: preReservation.professionalId },
        },
      },
    });

    // Mark pre-reservation as confirmed
    await prisma.preReservation.update({
      where: { token },
      data: {
        confirmed: true,
        userId: session.user.id,
      },
    });

    // Clean up other expired pre-reservations for this user
    await prisma.preReservation.deleteMany({
      where: {
        userId: session.user.id,
        confirmed: false,
        expiresAt: { lt: new Date() },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      appointmentId: appointment.id,
      scheduledAt: preReservation.scheduledAt,
      professional: {
        name: preReservation.professional.user.name,
      },
    });

  } catch (error) {
    await captureApiError('/api/pre-reservation/confirm', error, requestId)
    return NextResponse.json(
      { error: 'Error al confirmar la reserva', requestId },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    );
  }
}
