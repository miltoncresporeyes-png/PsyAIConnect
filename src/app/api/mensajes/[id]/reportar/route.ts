import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getParticipation } from '@/lib/chat'

const schema = z.object({
    messageId: z.string().min(1),
    reason: z.string().trim().min(3, 'Cuéntanos brevemente el motivo').max(500),
})

/** Reporta un mensaje recibido para revision del equipo de PsyDoctor. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = session.user.id

    const participation = await getParticipation(params.id, userId)
    if (!participation) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })

    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Datos inválidos' }, { status: 400 })
    }

    const message = await prisma.message.findFirst({
        where: { id: parsed.data.messageId, conversationId: params.id },
        select: { id: true, senderId: true },
    })
    if (!message) return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    if (message.senderId === userId) {
        return NextResponse.json({ error: 'Solo puedes reportar mensajes recibidos.' }, { status: 400 })
    }

    await prisma.message.update({
        where: { id: message.id },
        data: { reportedAt: new Date(), reportedById: userId, reportReason: parsed.data.reason },
    })
    return NextResponse.json({ success: true, message: 'Gracias. Nuestro equipo revisará este mensaje.' })
}
