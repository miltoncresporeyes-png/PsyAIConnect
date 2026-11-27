import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlots } from '@/lib/slots'

export const dynamic = 'force-dynamic'

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    try {
        const { searchParams } = req.nextUrl
        const slug = params?.slug || searchParams.get('slug')
        const dateStr = searchParams.get('date')

        if (!slug) {
            return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
        }

        // 'YYYY-MM-DD' se interpreta como fecha local (new Date('YYYY-MM-DD') usa UTC y corre el dia)
        const dateMatch = dateStr?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        const selectedDate = dateMatch
            ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
            : new Date()
        selectedDate.setHours(0, 0, 0, 0)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) {
            return NextResponse.json({ slots: [] })
        }

        const professional = await prisma.professional.findUnique({
            where: { slug },
            select: {
                id: true,
                sessionDuration: true,
                availability: {
                    where: { isActive: true },
                    select: { dayOfWeek: true, startTime: true, endTime: true },
                },
            },
        })

        if (!professional) {
            return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 })
        }

        const dayOfWeek = selectedDate.getDay()
        const dayAvailability = professional.availability.filter((a) => a.dayOfWeek === dayOfWeek)

        if (dayAvailability.length === 0) {
            return NextResponse.json({ slots: [], sessionDuration: professional.sessionDuration })
        }

        const existingAppointments = await prisma.appointment.findMany({
            where: {
                professionalId: professional.id,
                scheduledAt: {
                    gte: selectedDate,
                    lt: new Date(selectedDate.getTime() + 24 * 60 * 60000),
                },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: { scheduledAt: true, duration: true },
        })

        // Bloques de la duracion real de la sesion del profesional
        const slots = generateSlots({
            day: selectedDate,
            windows: dayAvailability,
            durationMin: professional.sessionDuration,
            busy: existingAppointments,
        })

        return NextResponse.json({ slots, sessionDuration: professional.sessionDuration })
    } catch (error) {
        console.error('Availability error:', error)
        return NextResponse.json({ slots: [] }, { status: 500 })
    }
}
