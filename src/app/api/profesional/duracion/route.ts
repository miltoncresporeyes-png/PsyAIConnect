import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SESSION_DURATION_OPTIONS } from '@/lib/sessionDuration'

export const dynamic = 'force-dynamic'

async function requireProfessional() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
    }
    const professional = await prisma.professional.findUnique({
        where: { userId: session.user.id },
        select: { id: true, sessionDuration: true },
    })
    if (!professional) {
        return { error: NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 }) }
    }
    return { professional }
}

export async function GET() {
    const { professional, error } = await requireProfessional()
    if (error) return error
    return NextResponse.json({ duration: professional.sessionDuration })
}

const bodySchema = z.object({ duration: z.number().int().refine((v) => SESSION_DURATION_OPTIONS.includes(v), 'Duración no válida') })

/** Cambia la duracion de sesion. Las citas ya agendadas conservan la duracion con que se reservaron. */
export async function PUT(request: Request) {
    const { professional, error } = await requireProfessional()
    if (error) return error

    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    await prisma.professional.update({
        where: { id: professional.id },
        data: { sessionDuration: parsed.data.duration },
    })
    const upcoming = await prisma.appointment.count({
        where: { professionalId: professional.id, status: { in: ['PENDING', 'CONFIRMED'] }, scheduledAt: { gte: new Date() } },
    })
    return NextResponse.json({ success: true, duration: parsed.data.duration, upcomingKeepOldDuration: upcoming })
}
