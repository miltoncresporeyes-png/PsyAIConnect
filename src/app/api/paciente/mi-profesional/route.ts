import { NextResponse } from 'next/server'
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

    // Buscar la última cita completada o confirmada del paciente para determinar su profesional
    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: session.user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      orderBy: { scheduledAt: 'desc' },
      include: {
        professional: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!lastAppointment?.professional) {
      return NextResponse.json({ professional: null })
    }

    const prof = lastAppointment.professional

    // Auditoría de acceso
    await logAudit({
      userId: session.user.id,
      userRole: session.user.role || 'PATIENT',
      action: 'VIEW_ASSIGNED_PROFESSIONAL',
      resource: `Professional:${prof.id}`,
      patientId: session.user.id,
    })

    return NextResponse.json({
      professional: {
        id: prof.id,
        name: prof.user.name,
        email: prof.user.email,
        image: prof.user.image,
        specialty: prof.specialties?.[0] || (prof.professionalType === 'PSYCHOLOGIST' ? 'Psicólogo/a' : 'Psiquiatra'),
        registroSuperintendencia: prof.licenseNumber || prof.rut,
        sessionPrice: prof.sessionPrice,
        modality: prof.modality,
        slug: prof.slug,
        isFounder: (prof.subscriptionTier as any) === 'FOUNDER' || (prof as any).isFounder === true,
      },
    })
  } catch (err) {
    console.error('Error fetching assigned professional:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
