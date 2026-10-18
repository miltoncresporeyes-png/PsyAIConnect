import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const history = await prisma.emotionalCheckIn.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        estado: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error fetching emotional check-ins:', error)
    return NextResponse.json({ error: 'Error al consultar historial' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { estado } = body

    if (!['mal', 'regular', 'bien', 'muy_bien'].includes(estado)) {
      return NextResponse.json({ error: 'Estado emocional no válido' }, { status: 400 })
    }

    const record = await prisma.emotionalCheckIn.create({
      data: {
        userId: session.user.id,
        estado,
        isShared: false,
      },
    })

    await logAudit({
      userId: session.user.id,
      userRole: session.user.role || 'PATIENT',
      action: 'EMOTIONAL_CHECKIN_CREATED',
      resource: `EmotionalCheckIn:${record.id}`,
      patientId: session.user.id,
    })

    return NextResponse.json({ success: true, id: record.id })
  } catch (error) {
    console.error('Error saving emotional check-in:', error)
    return NextResponse.json({ error: 'Error al guardar check-in' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.emotionalCheckIn.deleteMany({
      where: { userId: session.user.id },
    })

    await logAudit({
      userId: session.user.id,
      userRole: session.user.role || 'PATIENT',
      action: 'EMOTIONAL_CHECKIN_HISTORY_DELETED',
      resource: 'EmotionalCheckIn:all',
      patientId: session.user.id,
    })

    return NextResponse.json({ success: true, message: 'Historial de check-ins eliminado' })
  } catch (error) {
    console.error('Error deleting emotional check-ins:', error)
    return NextResponse.json({ error: 'Error al eliminar historial' }, { status: 500 })
  }
}
