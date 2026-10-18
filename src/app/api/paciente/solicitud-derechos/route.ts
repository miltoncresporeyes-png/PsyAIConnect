import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tipoDerecho, motivo } = body

    if (!tipoDerecho || !motivo) {
      return NextResponse.json({ error: 'Tipo de derecho y motivo son requeridos' }, { status: 400 })
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const trackingNumber = `ARCO-${new Date().getFullYear()}-${randomSuffix}`

    const rightsReq = await prisma.rightsRequest.create({
      data: {
        trackingNumber,
        userId: session.user.id,
        userEmail: session.user.email,
        tipoDerecho,
        motivo,
        estado: 'pendiente',
      },
    })

    // Registrar en auditoría
    await logAudit({
      userId: session.user.id,
      userRole: session.user.role || 'PATIENT',
      action: 'DATA_RIGHTS_REQUEST_CREATED',
      resource: `RightsRequest:${rightsReq.id}`,
      patientId: session.user.id,
      details: `Tipo: ${tipoDerecho}, Folio: ${trackingNumber}`,
    })

    // Notificar al equipo de privacidad
    try {
      await sendEmail({
        to: 'privacidad@psydoctor.cl',
        subject: `[DERECHOS ARCO] Solicitud de ${tipoDerecho.toUpperCase()} - Folio ${trackingNumber}`,
        text: `Se ha recibido una nueva solicitud de ejercicio de derechos ARCO en PsyDoctor:\n\nUsuario: ${session.user.email}\nTipo: ${tipoDerecho}\nFolio: ${trackingNumber}\nMotivo: ${motivo}\nFecha: ${new Date().toISOString()}`,
        html: `<p>Se ha recibido una nueva solicitud de ejercicio de derechos ARCO en PsyDoctor:</p><ul><li><b>Usuario:</b> ${session.user.email}</li><li><b>Tipo:</b> ${tipoDerecho}</li><li><b>Folio:</b> ${trackingNumber}</li><li><b>Motivo:</b> ${motivo}</li></ul>`,
      })
    } catch (e) {
      console.warn('Could not send notification email to privacidad@psydoctor.cl:', e)
    }

    return NextResponse.json({
      success: true,
      trackingNumber,
    })
  } catch (err) {
    console.error('Error creating rights request:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
