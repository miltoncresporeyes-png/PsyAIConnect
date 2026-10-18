import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processInvoiceQueue, getInvoiceQueueStats, InvoiceQueueStatus } from '@/lib/billingQueue'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'process') {
      // Procesar la cola de boletas
      const result = await processInvoiceQueue()

      return NextResponse.json({
        success: true,
        processed: result.processed,
        succeeded: result.succeeded,
        failed: result.failed,
      })
    }

    if (action === 'stats') {
      // Obtener estadísticas de la cola
      const stats = await getInvoiceQueueStats()

      return NextResponse.json(stats)
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Billing queue API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (appointmentId) {
      // Obtener estado de una boleta específica
      const invoice = await prisma.invoiceQueue.findUnique({
        where: { appointmentId },
      })

      if (!invoice) {
        return NextResponse.json(
          { error: 'Boleta no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json(invoice)
    }

    // Obtener todas las boletas con filtros
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = status ? { status: status as InvoiceQueueStatus } : {}

    const [items, total] = await Promise.all([
      prisma.invoiceQueue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoiceQueue.count({ where }),
    ])

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Billing queue GET error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
