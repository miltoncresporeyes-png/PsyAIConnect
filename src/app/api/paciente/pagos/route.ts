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

    const payments = await prisma.payment.findMany({
      where: {
        appointment: {
          patientId: session.user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          select: {
            scheduledAt: true,
            professional: {
              select: {
                user: {
                  select: { name: true },
                },
              },
            },
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                issueDate: true,
                netAmount: true,
              },
            },
          },
        },
      },
    })

    await logAudit({
      userId: session.user.id,
      userRole: session.user.role || 'PATIENT',
      action: 'VIEW_PAYMENTS_AND_INVOICES',
      resource: 'Payment:list',
      patientId: session.user.id,
    })

    return NextResponse.json({ payments })
  } catch (err) {
    console.error('Error fetching patient payments:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
