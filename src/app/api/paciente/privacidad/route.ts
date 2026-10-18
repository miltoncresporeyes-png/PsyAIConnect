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

    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: session.user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      orderBy: { scheduledAt: 'desc' },
      include: {
        professional: {
          include: { user: true },
        },
      },
    })

    const consents = await prisma.consentLog.findMany({
      where: { userId: session.user.id },
      orderBy: { grantedAt: 'desc' },
      take: 10,
    })

    const rightsRequests = await prisma.rightsRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    await logAudit({
      userId: session.user.id,
      userRole: session.user.role || 'PATIENT',
      action: 'VIEW_PRIVACY_AND_CONSENTS',
      resource: 'UserConsent:list',
      patientId: session.user.id,
    })

    return NextResponse.json({
      assignedProfessional: lastAppointment?.professional
        ? {
            id: lastAppointment.professional.id,
            name: lastAppointment.professional.user.name,
          }
        : null,
      consents,
      rightsRequests,
    })
  } catch (err) {
    console.error('Error fetching privacy data:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
