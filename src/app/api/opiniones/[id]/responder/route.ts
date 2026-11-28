import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moderateComment, replySchema } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

/** El profesional responde una sola vez a una opinión publicada sobre él. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const professional = await prisma.professional.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    if (!professional) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const review = await prisma.review.findUnique({ where: { id: params.id }, select: { professionalId: true, status: true, reply: true } })
    if (!review || review.professionalId !== professional.id || review.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Opinión no encontrada' }, { status: 404 })
    }
    if (review.reply) return NextResponse.json({ error: 'Ya respondiste esta opinión' }, { status: 409 })

    const parsed = replySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Escribe una respuesta de hasta 500 caracteres' }, { status: 400 })

    // La respuesta es pública: no admite contactos, enlaces ni contenido clínico
    const moderation = moderateComment(parsed.data.reply)
    if (moderation.status !== 'PUBLISHED') {
        return NextResponse.json(
            { error: 'Tu respuesta no puede incluir datos de contacto, enlaces, lenguaje ofensivo ni contenido clínico. Responde solo sobre el servicio.' },
            { status: 400 }
        )
    }

    await prisma.review.update({ where: { id: params.id }, data: { reply: parsed.data.reply, repliedAt: new Date() } })
    return NextResponse.json({ success: true })
}
