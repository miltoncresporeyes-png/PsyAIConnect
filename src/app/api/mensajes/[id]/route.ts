import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'
import { sendNewMessageNotificationEmail } from '@/lib/email'
import {
    MAX_MESSAGE_LENGTH,
    NOTIFY_THROTTLE_MS,
    decryptMessage,
    detectCrisis,
    encryptMessage,
    getParticipation,
    hasChatEnablingAppointment,
    screenMessage,
} from '@/lib/chat'

export const dynamic = 'force-dynamic'

interface RouteContext {
    params: { id: string }
}

/** Mensajes de una conversacion. `?after=<ISO>` devuelve solo los nuevos (polling). */
export async function GET(request: Request, { params }: RouteContext) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = session.user.id

    const participation = await getParticipation(params.id, userId)
    if (!participation) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    const { conversation, role } = participation

    const afterParam = new URL(request.url).searchParams.get('after')
    const after = afterParam ? new Date(afterParam) : null

    const messages = await prisma.message.findMany({
        where: {
            conversationId: conversation.id,
            ...(after && !Number.isNaN(after.getTime()) ? { createdAt: { gt: after } } : {}),
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
    })

    // Lo recibido se marca como leido al abrirlo.
    await prisma.message.updateMany({
        where: { conversationId: conversation.id, senderId: { not: userId }, readAt: null },
        data: { readAt: new Date() },
    })

    const canSend = await hasChatEnablingAppointment(conversation.patientId, conversation.professionalId)

    return NextResponse.json({
        role,
        canSend,
        counterpart:
            role === 'PATIENT'
                ? { name: conversation.professional.user.name || 'Profesional', image: conversation.professional.profileImageUrl }
                : { name: conversation.patient.name || 'Paciente', image: null },
        messages: messages.map((m) => ({
            id: m.id,
            mine: m.senderId === userId,
            body: decryptMessage(m.encryptedBody),
            createdAt: m.createdAt.toISOString(),
            readAt: m.readAt?.toISOString() ?? null,
            reported: m.reportedAt != null,
        })),
    })
}

const sendSchema = z.object({
    body: z.string().trim().min(1, 'Escribe un mensaje').max(MAX_MESSAGE_LENGTH, 'El mensaje es demasiado largo'),
})

export async function POST(request: Request, { params }: RouteContext) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = session.user.id

    const participation = await getParticipation(params.id, userId)
    if (!participation) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    const { conversation, role } = participation

    const limit = checkRateLimit(`chat:send:${userId}`, { limit: 20, windowMs: 60 * 1000 })
    if (!limit.allowed) {
        return NextResponse.json({ error: 'Estás enviando mensajes muy rápido. Espera un momento.' }, { status: 429 })
    }

    const parsed = sendSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Mensaje inválido' }, { status: 400 })
    }
    const text = parsed.data.body

    // El canal sigue vigente solo mientras exista una cita confirmada o realizada.
    if (!(await hasChatEnablingAppointment(conversation.patientId, conversation.professionalId))) {
        return NextResponse.json(
            { error: 'Este chat está en modo de solo lectura: no hay una cita vigente entre ambos.' },
            { status: 403 }
        )
    }

    const screening = screenMessage(text)
    if (!screening.ok) {
        return NextResponse.json({ error: screening.reason, blocked: true }, { status: 422 })
    }

    const now = new Date()
    const message = await prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderId: userId,
            encryptedBody: encryptMessage(text),
        },
        select: { id: true, createdAt: true },
    })
    await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: now } })

    // Aviso por correo sin contenido, como maximo uno cada 15 minutos por conversacion.
    try {
        const notifyField = role === 'PATIENT' ? 'professionalNotifiedAt' : 'patientNotifiedAt'
        const lastNotified = conversation[notifyField]
        if (!lastNotified || now.getTime() - lastNotified.getTime() > NOTIFY_THROTTLE_MS) {
            const recipient =
                role === 'PATIENT'
                    ? { email: conversation.professional.user.email, name: conversation.professional.user.name }
                    : { email: conversation.patient.email, name: conversation.patient.name }
            const fromLabel =
                role === 'PATIENT' ? 'un paciente' : conversation.professional.user.name || 'tu profesional'
            await prisma.conversation.update({ where: { id: conversation.id }, data: { [notifyField]: now } })
            void sendNewMessageNotificationEmail(recipient.email, recipient.name || '', fromLabel)
        }
    } catch (error) {
        console.error('[chat] No se pudo avisar por correo:', error)
    }

    return NextResponse.json({
        id: message.id,
        createdAt: message.createdAt.toISOString(),
        // El mensaje se envia igual; la pantalla muestra las lineas de ayuda de inmediato.
        crisis: detectCrisis(text),
    })
}
