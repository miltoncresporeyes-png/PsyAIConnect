import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { cleanText, createTicketSchema, sanitizePagePath } from '@/lib/tickets'
import { notifyAdminsNewTicket } from '@/lib/ticketNotify'

export const dynamic = 'force-dynamic'

/**
 * Crea un ticket de feedback. Funciona con sesion (se toma nombre, correo y rol de la cuenta) o sin sesion
 * (visitante: el correo es obligatorio). Protegido con limite de envios y un campo trampa contra bots.
 */
export async function POST(request: Request) {
    const body = await request.json().catch(() => null)
    const parsed = createTicketSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const input = parsed.data

    // Campo trampa: un bot lo rellena. Se responde "bien" para no darle pistas, sin crear nada.
    if (input.website && input.website.trim() !== '') {
        return NextResponse.json({ success: true })
    }

    const session = await getServerSession(authOptions)
    const ip = getClientIp(request)

    const perIdentity = checkRateLimit(`ticket:create:${session?.user?.id ?? ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    const perIp = checkRateLimit(`ticket:create:ip:${ip}`, { limit: 12, windowMs: 60 * 60 * 1000 })
    if (!perIdentity.allowed || !perIp.allowed) {
        const blocked = !perIdentity.allowed ? perIdentity : perIp
        return NextResponse.json(
            { error: 'Has enviado muchos mensajes seguidos. Inténtalo de nuevo en un rato.' },
            { status: 429, headers: createRateLimitHeaders(blocked) }
        )
    }

    let userId: string | null = null
    let userRole: string | null = null
    let contactName: string | null = input.name?.trim() || null
    let contactEmail: string | null = input.email?.trim().toLowerCase() || null

    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, role: true, name: true, email: true, isActive: true },
        })
        if (!user || user.isActive === false) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
        userId = user.id
        userRole = user.role
        contactName = user.name
        contactEmail = user.email
    } else if (!contactEmail) {
        return NextResponse.json({ error: 'Ingresa tu correo para que podamos responderte' }, { status: 400 })
    }

    const ticket = await prisma.supportTicket.create({
        data: {
            userId,
            userRole,
            contactName: contactName ? cleanText(contactName).slice(0, 80) : null,
            contactEmail,
            type: input.type,
            subject: cleanText(input.subject).replace(/\n+/g, ' ').slice(0, 120),
            message: cleanText(input.message),
            pageUrl: sanitizePagePath(input.pageUrl),
            userAgent: (request.headers.get('user-agent') || '').slice(0, 300) || null,
        },
        select: { id: true, number: true, type: true, subject: true, message: true, contactEmail: true, userRole: true },
    })

    void notifyAdminsNewTicket(ticket)

    return NextResponse.json({ success: true, number: ticket.number })
}

/** Los tickets del propio usuario con su estado y la respuesta del equipo (nunca las notas internas). */
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
            id: true,
            number: true,
            type: true,
            status: true,
            subject: true,
            message: true,
            adminResponse: true,
            respondedAt: true,
            createdAt: true,
        },
    })
    return NextResponse.json({ tickets })
}
