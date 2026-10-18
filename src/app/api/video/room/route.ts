import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateVideoRoom, createVideoToken, deleteVideoRoom } from '@/lib/videoRoom'

export async function POST(request: Request) {
  const blocked = getWaitlistBlockedResponse()
  if (blocked) return blocked

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

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: {
          include: { user: true }
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

    // Verificar que el usuario es parte de la cita
    const isPatient = appointment.patientId === session.user.id
    const isProfessional = appointment.professional.userId === session.user.id

    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      )
    }

    // Si ya existe un videoLink, devolverlo
    if (appointment.videoLink) {
      const roomName = appointment.videoLink.replace('https://psyai.daily.co/', '')
      
      const token = await createVideoToken(
        roomName,
        session.user.name || session.user.email || 'Usuario',
        session.user.id,
        isProfessional
      )

      return NextResponse.json({
        roomUrl: appointment.videoLink,
        token,
      })
    }

    // Crear nueva sala de videollamada
    const roomResponse = await getOrCreateVideoRoom(appointmentId)
    const roomUrl = roomResponse.room.url

    // Guardar el enlace en la cita
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { videoLink: roomUrl },
    })

    // Generar token para el usuario
    const roomName = roomResponse.room.name
    const token = await createVideoToken(
      roomName,
      session.user.name || session.user.email || 'Usuario',
      session.user.id,
      isProfessional
    )

    return NextResponse.json({
      roomUrl,
      token,
    })
  } catch (error) {
    console.error('Video room error:', error)
    return NextResponse.json(
      { error: 'Error al crear la sala de videollamada' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const blocked = getWaitlistBlockedResponse()
  if (blocked) return blocked

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { professional: { include: { user: true } } },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Solo el profesional puede eliminar la sala
    if (appointment.professional.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Solo el profesional puede eliminar la sala' },
        { status: 403 }
      )
    }

    if (appointment.videoLink) {
      const roomName = appointment.videoLink.replace('https://psyai.daily.co/', '')
      await deleteVideoRoom(roomName)

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { videoLink: null },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete video room error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la sala' },
      { status: 500 }
    )
  }
}
