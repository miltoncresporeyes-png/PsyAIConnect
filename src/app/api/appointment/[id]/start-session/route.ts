import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateVideoRoom, createVideoToken } from '@/lib/videoRoom'

/**
 * POST /api/appointment/[id]/start-session
 * 
 * Inicia una sesión de videollamada
 * - Verifica que el usuario es el profesional
 * - Crea la sala en Daily.co
 * - Guarda el room_url en la cita
 * - Cambia attendanceStatus a EN_SESION
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: {
          include: { user: true }
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que es el profesional
    if (appointment.professional.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Solo el profesional puede iniciar la sesión' },
        { status: 403 }
      )
    }

    // Verificar que la cita está confirmada
    if (appointment.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'La cita debe estar confirmada' },
        { status: 400 }
      )
    }

    // Crear o obtener sala de Daily.co
    const roomResponse = await getOrCreateVideoRoom(appointmentId)
    const roomUrl = roomResponse.room.url

    // Generar token para el profesional
    const token = await createVideoToken(
      roomResponse.room.name,
      session.user.name || session.user.email || 'Profesional',
      session.user.id,
      true // isOwner
    )

    // Actualizar la cita
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        videoLink: roomUrl,
        attendanceStatus: 'EN_SESION',
        profesionalOnline: true,
        professionalJoinedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      roomUrl,
      token,
      message: 'Sesión iniciada correctamente',
    })
  } catch (error) {
    console.error('Start session error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar la sesión' },
      { status: 500 }
    )
  }
}
