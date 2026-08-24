import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Solo administradores pueden reintentar' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { invoiceQueueId } = body

        if (!invoiceQueueId) {
            return NextResponse.json(
                { error: 'Se requiere invoiceQueueId' },
                { status: 400 }
            )
        }

        const invoice = await prisma.invoiceQueue.findUnique({
            where: { id: invoiceQueueId },
        })

        if (!invoice) {
            return NextResponse.json(
                { error: 'Boleta no encontrada' },
                { status: 404 }
            )
        }

        if (invoice.status === 'COMPLETED') {
            return NextResponse.json(
                { error: 'Esta boleta ya fue emitida' },
                { status: 400 }
            )
        }

        // Reset for retry
        await prisma.invoiceQueue.update({
            where: { id: invoiceQueueId },
            data: {
                status: 'PENDING',
                attempts: 0,
                nextAttemptAt: new Date(),
                errorMessage: null,
                errorCode: null,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Boleta reintentada correctamente',
        })
    } catch (error) {
        console.error('Retry invoice error:', error)
        return NextResponse.json(
            { error: 'Error al reintentar boleta' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    return POST(request)
}
