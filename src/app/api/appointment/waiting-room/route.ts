import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyUserJoined, notifyUserLeft, startSession, endSession } from '@/lib/realtime'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, action } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: { include: { user: true } },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    const isPatient = appointment.patientId === session.user.id
    const isProfessional = appointment.professional.userId === session.user.id

    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      )
    }

    // Get or create waiting room
    let waitingRoom = await prisma.waitingRoom.findUnique({
      where: { appointmentId },
    })

    if (!waitingRoom) {
      waitingRoom = await prisma.waitingRoom.create({
        data: {
          appointmentId,
          status: isProfessional ? 'WAITING' : 'CHECK_IN',
        },
      })
    }

    if (action === 'join') {
      // Patient joins waiting room
      if (isPatient) {
        waitingRoom = await prisma.waitingRoom.update({
          where: { id: waitingRoom.id },
          data: {
            patientJoinedAt: new Date(),
            status: 'WAITING',
          },
        })

        // Evidencia de asistencia en la propia cita (usada al registrar una inasistencia)
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            pacienteOnline: true,
            patientJoinedAt: appointment.patientJoinedAt ?? new Date(),
          },
        })

        // Notify via realtime
        await notifyUserJoined(appointmentId, session.user.id, false)
      }

      // Professional joins
      if (isProfessional) {
        waitingRoom = await prisma.waitingRoom.update({
          where: { id: waitingRoom.id },
          data: {
            professionalJoinedAt: new Date(),
            professionalNotified: true,
            status: 'READY',
          },
        })

        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            profesionalOnline: true,
            professionalJoinedAt: appointment.professionalJoinedAt ?? new Date(),
          },
        })

        // Notify via realtime
        await notifyUserJoined(appointmentId, session.user.id, true)
      }
    }

    if (action === 'device_check') {
      const updates = {
        cameraTested: body.cameraTested,
        micTested: body.micTested,
        speakerTested: body.speakerTested,
      }

      waitingRoom = await prisma.waitingRoom.update({
        where: { id: waitingRoom.id },
        data: {
          ...updates,
          patientReadyAt: new Date(),
        },
      })
    }

    if (action === 'start_session') {
      // Solo el profesional puede iniciar la sesión
      if (!isProfessional) {
        return NextResponse.json(
          { error: 'Solo el profesional puede iniciar la sesión' },
          { status: 403 }
        )
      }
      waitingRoom = await prisma.waitingRoom.update({
        where: { id: waitingRoom.id },
        data: {
          sessionStartedAt: new Date(),
          status: 'IN_SESSION',
        },
      })
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          attendanceStatus: 'EN_SESION',
          sessionStartedAt: appointment.sessionStartedAt ?? new Date(),
        },
      })
    }

    if (action === 'end_session') {
      // Solo el profesional puede finalizar la sesión
      if (!isProfessional) {
        return NextResponse.json(
          { error: 'Solo el profesional puede finalizar la sesión' },
          { status: 403 }
        )
      }
      waitingRoom = await prisma.waitingRoom.update({
        where: { id: waitingRoom.id },
        data: {
          status: 'COMPLETED',
        },
      })
      // Cerrar la cita: habilita el historial, el chat posterior y las estadisticas
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          attendanceStatus: 'FINALIZADA',
          sessionEndedAt: new Date(),
          ...(appointment.status === 'CONFIRMED' && { status: 'COMPLETED' }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      waitingRoom,
    })
  } catch (error) {
    console.error('Waiting room error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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
      include: {
        professional: { select: { userId: true } },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    const isPatient = appointment.patientId === session.user.id
    const isProfessional = appointment.professional.userId === session.user.id

    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      )
    }

    const waitingRoom = await prisma.waitingRoom.findUnique({
      where: { appointmentId },
    })

    if (!waitingRoom) {
      return NextResponse.json({
        status: 'CHECK_IN',
        professionalJoined: false,
      })
    }

    return NextResponse.json({
      status: waitingRoom.status,
      patientJoinedAt: waitingRoom.patientJoinedAt,
      professionalJoinedAt: waitingRoom.professionalJoinedAt,
      professionalJoined: waitingRoom.status === 'READY' || waitingRoom.status === 'IN_SESSION',
      cameraTested: waitingRoom.cameraTested,
      micTested: waitingRoom.micTested,
    })
  } catch (error) {
    console.error('Waiting room GET error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
