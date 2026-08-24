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
      waitingRoom = await prisma.waitingRoom.update({
        where: { id: waitingRoom.id },
        data: {
          sessionStartedAt: new Date(),
          status: 'IN_SESSION',
        },
      })
    }

    if (action === 'end_session') {
      waitingRoom = await prisma.waitingRoom.update({
        where: { id: waitingRoom.id },
        data: {
          status: 'COMPLETED',
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
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
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
