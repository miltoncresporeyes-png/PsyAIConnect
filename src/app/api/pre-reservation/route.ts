import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'

const PRE_RESERVATION_DURATION_MINUTES = 10

// POST: Crear una pre-reserva
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req)
    const preReservationLimit = checkRateLimit(`pre-reservation:create:${clientIp}`, {
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })

    if (!preReservationLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos de reserva. Intenta nuevamente en unos minutos.' },
        { status: 429, headers: createRateLimitHeaders(preReservationLimit) }
      )
    }

    const body = await req.json()
    const { professionalId, date, time, sessionEmail } = body

    if (!professionalId || !date || !time) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Construir la fecha y hora de la cita
    const scheduledAt = new Date(`${date}T${time}:00`)
    
    // Verificar que la fecha sea futura
    if (scheduledAt <= new Date()) {
      return NextResponse.json(
        { error: 'La fecha debe ser futura' },
        { status: 400 }
      )
    }

    // Limpiar pre-reservas expiradas
    await prisma.preReservation.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        confirmed: false,
      },
    })

    // Verificar que no exista una pre-reserva activa para ese horario
    const existingPreReservation = await prisma.preReservation.findFirst({
      where: {
        professionalId,
        scheduledAt,
        expiresAt: { gt: new Date() },
        confirmed: false,
      },
    })

    if (existingPreReservation) {
      return NextResponse.json(
        { 
          error: 'Este horario está siendo reservado por otro usuario. Por favor, selecciona otro horario.',
          code: 'SLOT_TAKEN' 
        },
        { status: 409 }
      )
    }

    // Verificar que no exista una cita confirmada para ese horario
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId,
        scheduledAt,
        status: { notIn: ['CANCELLED'] },
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { 
          error: 'Este horario ya está ocupado. Por favor, selecciona otro horario.',
          code: 'SLOT_BOOKED' 
        },
        { status: 409 }
      )
    }

    // Generar token único
    const token = randomBytes(32).toString('hex')

    // Calcular fecha de expiración (10 minutos)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + PRE_RESERVATION_DURATION_MINUTES)

    // Obtener duración de sesión del profesional
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { sessionDuration: true, sessionPrice: true, user: { select: { name: true } } },
    })

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      )
    }

    // Crear pre-reserva
    const preReservation = await prisma.preReservation.create({
      data: {
        professionalId,
        sessionEmail,
        scheduledAt,
        duration: professional.sessionDuration,
        expiresAt,
        token,
      },
    })

    return NextResponse.json({
      success: true,
      preReservation: {
        id: preReservation.id,
        token: preReservation.token,
        expiresAt: preReservation.expiresAt,
        scheduledAt: preReservation.scheduledAt,
        duration: preReservation.duration,
        professional: {
          name: professional.user.name,
          price: professional.sessionPrice,
        },
      },
      message: `Horario reservado temporalmente. Tienes ${PRE_RESERVATION_DURATION_MINUTES} minutos para completar el registro.`,
    })
  } catch (error) {
    console.error('Error creating pre-reservation:', error)
    return NextResponse.json(
      { error: 'Error al crear la pre-reserva' },
      { status: 500 }
    )
  }
}

// GET: Verificar estado de una pre-reserva
export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req)
  const statusCheckLimit = checkRateLimit(`pre-reservation:status:${clientIp}`, {
    limit: 120,
    windowMs: 5 * 60 * 1000,
  })

  if (!statusCheckLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas consultas de estado. Intenta nuevamente en unos momentos.' },
      { status: 429, headers: createRateLimitHeaders(statusCheckLimit) }
    )
  }

  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token requerido' },
      { status: 400 }
    )
  }

  try {
    const preReservation = await prisma.preReservation.findUnique({
      where: { token },
      include: {
        professional: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    })

    if (!preReservation) {
      return NextResponse.json(
        { error: 'Pre-reserva no encontrada', valid: false },
        { status: 404 }
      )
    }

    const isExpired = preReservation.expiresAt < new Date()
    const isValid = !isExpired && !preReservation.confirmed

    return NextResponse.json({
      valid: isValid,
      expired: isExpired,
      confirmed: preReservation.confirmed,
      preReservation: {
        id: preReservation.id,
        scheduledAt: preReservation.scheduledAt,
        duration: preReservation.duration,
        expiresAt: preReservation.expiresAt,
        professional: {
          id: preReservation.professionalId,
          name: preReservation.professional.user.name,
          price: preReservation.professional.sessionPrice,
        },
      },
      timeRemaining: isValid 
        ? Math.max(0, Math.floor((preReservation.expiresAt.getTime() - Date.now()) / 1000))
        : 0,
    })
  } catch (error) {
    console.error('Error checking pre-reservation:', error)
    return NextResponse.json(
      { error: 'Error al verificar la pre-reserva' },
      { status: 500 }
    )
  }
}

// DELETE: Cancelar una pre-reserva
export async function DELETE(req: NextRequest) {
  const clientIp = getClientIp(req)
  const cancelLimit = checkRateLimit(`pre-reservation:cancel:${clientIp}`, {
    limit: 60,
    windowMs: 10 * 60 * 1000,
  })

  if (!cancelLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas cancelaciones en poco tiempo. Intenta nuevamente mas tarde.' },
      { status: 429, headers: createRateLimitHeaders(cancelLimit) }
    )
  }

  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token requerido' },
      { status: 400 }
    )
  }

  try {
    await prisma.preReservation.delete({
      where: { token },
    })

    return NextResponse.json({
      success: true,
      message: 'Pre-reserva cancelada',
    })
  } catch (error) {
    console.error('Error deleting pre-reservation:', error)
    return NextResponse.json(
      { error: 'Error al cancelar la pre-reserva' },
      { status: 500 }
    )
  }
}
