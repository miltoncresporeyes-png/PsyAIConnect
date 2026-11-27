import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptMessage, hasChatEnablingAppointment } from '@/lib/chat'

export const dynamic = 'force-dynamic'

const ENABLING = ['CONFIRMED', 'COMPLETED'] as const

interface ChatListItem {
    key: string
    conversationId: string | null
    /** Para abrir una conversacion nueva */
    professionalId?: string
    patientId?: string
    name: string
    image: string | null
    lastMessageAt: string | null
    preview: string | null
    unread: number
    canSend: boolean
}

/**
 * Lista de conversaciones y de personas con las que se puede iniciar una
 * (quienes tienen una cita confirmada o realizada con el usuario).
 */
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = session.user.id
    const role = session.user.role

    const items = new Map<string, ChatListItem>()

    if (role === 'PATIENT') {
        const [appointments, conversations] = await Promise.all([
            prisma.appointment.findMany({
                where: { patientId: userId, status: { in: [...ENABLING] } },
                distinct: ['professionalId'],
                select: {
                    professionalId: true,
                    professional: { select: { profileImageUrl: true, user: { select: { name: true } } } },
                },
            }),
            prisma.conversation.findMany({
                where: { patientId: userId },
                include: {
                    professional: { select: { id: true, profileImageUrl: true, user: { select: { name: true } } } },
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                },
            }),
        ])
        const unread = await prisma.message.groupBy({
            by: ['conversationId'],
            where: { conversation: { patientId: userId }, senderId: { not: userId }, readAt: null },
            _count: { _all: true },
        })
        const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]))

        for (const a of appointments) {
            items.set(a.professionalId, {
                key: a.professionalId,
                conversationId: null,
                professionalId: a.professionalId,
                name: a.professional.user.name || 'Profesional',
                image: a.professional.profileImageUrl,
                lastMessageAt: null,
                preview: null,
                unread: 0,
                canSend: true,
            })
        }
        for (const c of conversations) {
            const existing = items.get(c.professionalId)
            items.set(c.professionalId, {
                key: c.professionalId,
                conversationId: c.id,
                professionalId: c.professionalId,
                name: c.professional.user.name || 'Profesional',
                image: c.professional.profileImageUrl,
                lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
                preview: c.messages[0] ? decryptMessage(c.messages[0].encryptedBody).slice(0, 80) : null,
                unread: unreadMap.get(c.id) ?? 0,
                canSend: existing != null, // sin cita vigente queda solo de lectura
            })
        }
    } else if (role === 'PROFESSIONAL') {
        const professional = await prisma.professional.findUnique({ where: { userId }, select: { id: true } })
        if (!professional) return NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 })

        const [appointments, conversations] = await Promise.all([
            prisma.appointment.findMany({
                where: { professionalId: professional.id, status: { in: [...ENABLING] } },
                distinct: ['patientId'],
                select: { patientId: true, patient: { select: { name: true, image: true } } },
            }),
            prisma.conversation.findMany({
                where: { professionalId: professional.id },
                include: {
                    patient: { select: { name: true, image: true } },
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                },
            }),
        ])
        const unread = await prisma.message.groupBy({
            by: ['conversationId'],
            where: { conversation: { professionalId: professional.id }, senderId: { not: userId }, readAt: null },
            _count: { _all: true },
        })
        const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]))

        for (const a of appointments) {
            items.set(a.patientId, {
                key: a.patientId,
                conversationId: null,
                patientId: a.patientId,
                name: a.patient.name || 'Paciente',
                image: a.patient.image,
                lastMessageAt: null,
                preview: null,
                unread: 0,
                canSend: true,
            })
        }
        for (const c of conversations) {
            const existing = items.get(c.patientId)
            items.set(c.patientId, {
                key: c.patientId,
                conversationId: c.id,
                patientId: c.patientId,
                name: c.patient.name || 'Paciente',
                image: c.patient.image,
                lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
                preview: c.messages[0] ? decryptMessage(c.messages[0].encryptedBody).slice(0, 80) : null,
                unread: unreadMap.get(c.id) ?? 0,
                canSend: existing != null,
            })
        }
    } else {
        return NextResponse.json({ error: 'No disponible para este tipo de cuenta' }, { status: 403 })
    }

    const list = Array.from(items.values()).sort((a, b) =>
        (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? '')
    )
    return NextResponse.json({ role, conversations: list })
}

const openSchema = z.object({
    professionalId: z.string().optional(),
    patientId: z.string().optional(),
})

/** Abre (o recupera) la conversacion con una persona que tenga cita vigente. */
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = session.user.id

    const parsed = openSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    let patientId: string
    let professionalId: string

    if (session.user.role === 'PATIENT' && parsed.data.professionalId) {
        patientId = userId
        professionalId = parsed.data.professionalId
    } else if (session.user.role === 'PROFESSIONAL' && parsed.data.patientId) {
        const professional = await prisma.professional.findUnique({ where: { userId }, select: { id: true } })
        if (!professional) return NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 })
        patientId = parsed.data.patientId
        professionalId = professional.id
    } else {
        return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 })
    }

    // Sin cita confirmada o realizada no hay canal.
    if (!(await hasChatEnablingAppointment(patientId, professionalId))) {
        return NextResponse.json(
            { error: 'El chat se habilita cuando existe una cita confirmada entre ambos.' },
            { status: 403 }
        )
    }

    const conversation = await prisma.conversation.upsert({
        where: { patientId_professionalId: { patientId, professionalId } },
        create: { patientId, professionalId },
        update: {},
        select: { id: true },
    })
    return NextResponse.json({ conversationId: conversation.id })
}
