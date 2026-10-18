import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createHash } from 'crypto'

const siiWebhookSchema = z.object({
  tipo_dte: z.number().optional(),
  folio: z.string().optional(),
  estado: z.string(),
  mensaje: z.string().optional(),
  id_referencia: z.string().optional(),
  fecha_emision: z.string().optional(),
  url_pdf: z.string().optional(),
  track_id: z.string().optional(),
})

type SiiWebhookPayload = z.infer<typeof siiWebhookSchema>

enum SiiDocumentStatus {
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO',
  PENDIENTE = 'PENDIENTE',
  ANULADO = 'ANULADO',
}

function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    console.warn('SII webhook: No signature provided')
    return false
  }

  const secret = process.env.SII_WEBHOOK_SECRET
  if (!secret) {
    console.warn('SII_WEBHOOK_SECRET not configured')
    return false
  }

  const expectedSignature = createHash('sha256')
    .update(payload + secret)
    .digest('hex')

  return signature === expectedSignature
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-sii-signature')

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('SII webhook: Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const body = JSON.parse(rawBody)
    const payload = siiWebhookSchema.parse(body)

    console.log('📄 SII Webhook received:', {
      folio: payload.folio,
      estado: payload.estado,
      id_referencia: payload.id_referencia,
    })

    await processSiiResponse(payload)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('SII Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

async function processSiiResponse(payload: SiiWebhookPayload): Promise<void> {
  const { folio, estado, mensaje, id_referencia, url_pdf, track_id } = payload

  if (!folio && !id_referencia) {
    console.warn('SII webhook: No folio or reference ID provided')
    return
  }

  let invoiceQueue = null

  if (folio) {
    invoiceQueue = await prisma.invoiceQueue.findFirst({
      where: { siiFolio: folio },
    })
  }

  if (!invoiceQueue && id_referencia) {
    invoiceQueue = await prisma.invoiceQueue.findUnique({
      where: { appointmentId: id_referencia },
    })
  }

  if (!invoiceQueue) {
    console.warn('SII webhook: Invoice not found', { folio, id_referencia })
    return
  }

  switch (estado.toUpperCase()) {
    case SiiDocumentStatus.ACEPTADO:
      await handleAcceptedInvoice(invoiceQueue, payload)
      break

    case SiiDocumentStatus.RECHAZADO:
      await handleRejectedInvoice(invoiceQueue, payload)
      break

    case SiiDocumentStatus.ANULADO:
      await handleAnulledInvoice(invoiceQueue, payload)
      break

    default:
      console.log('SII webhook: Unhandled status', estado)
  }
}

async function handleAcceptedInvoice(
  invoiceQueue: any,
  payload: SiiWebhookPayload
): Promise<void> {
  await prisma.invoiceQueue.update({
    where: { id: invoiceQueue.id },
    data: {
      status: 'COMPLETED',
      siiStatus: 'ACEPTADO',
      siiFolio: payload.folio || invoiceQueue.siiFolio,
      completedAt: new Date(),
    },
  })

  // Sincronizar estado en tabla Invoice
  if (invoiceQueue.appointmentId) {
    try {
      await prisma.invoice.updateMany({
        where: { appointmentId: invoiceQueue.appointmentId },
        data: {
          status: 'PAID',
        },
      })
    } catch (e) {
      console.warn('Could not update Invoice status on SII acceptance:', e)
    }
  }

  console.log(`✅ Invoice ${payload.folio} ACCEPTED by SII`)
}

async function handleRejectedInvoice(
  invoiceQueue: any,
  payload: SiiWebhookPayload
): Promise<void> {
  const maxAttempts = invoiceQueue.maxAttempts || 3
  const attempts = invoiceQueue.attempts || 0

  if (attempts >= maxAttempts) {
    await prisma.invoiceQueue.update({
      where: { id: invoiceQueue.id },
      data: {
        status: 'MANUAL_REVIEW',
        siiStatus: 'RECHAZADO',
        errorMessage: payload.mensaje || 'SII rejected the document',
        errorCode: 'SII_REJECTED',
      },
    })

    console.warn(`⚠️ Invoice ${payload.folio} REJECTED - requires manual review`)
  } else {
    await prisma.invoiceQueue.update({
      where: { id: invoiceQueue.id },
      data: {
        status: 'PENDING',
        siiStatus: 'RECHAZADO',
        attempts: { increment: 1 },
        errorMessage: payload.mensaje || 'SII rejected the document',
        errorCode: 'SII_REJECTED',
        nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    console.log(`⚠️ Invoice ${payload.folio} REJECTED - will retry`)
  }
}

async function handleAnulledInvoice(
  invoiceQueue: any,
  payload: SiiWebhookPayload
): Promise<void> {
  await prisma.invoiceQueue.update({
    where: { id: invoiceQueue.id },
    data: {
      status: 'FAILED',
      siiStatus: 'ANULADO',
      errorMessage: 'Document was anulled by SII',
    },
  })

  console.log(`❌ Invoice ${payload.folio} ANNULLED by SII`)
}

export async function GET() {
  return NextResponse.json({
    status: 'SII Webhook active',
    endpoints: {
      POST: '/api/sii/webhook - Receive SII notifications',
    },
    events: {
      ACEPTADO: 'Invoice accepted by SII',
      RECHAZADO: 'Invoice rejected by SII',
      ANULADO: 'Invoice anulled',
    },
  })
}
