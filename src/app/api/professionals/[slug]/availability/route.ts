import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SLOT_DURATION_MIN = 30

function parseTime(time: string): { hour: number; minute: number } {
    const [hour, minute] = time.split(':').map(Number)
    return { hour, minute }
}

function timeToMinutes({ hour, minute }: { hour: number; minute: number }): number {
    return hour * 60 + minute
}

function addMinutes(minutes: number, toAdd: number): { hour: number; minute: number } {
    const total = minutes + toAdd
    return { hour: Math.floor(total / 60), minute: total % 60 }
}

function formatTime({ hour, minute }: { hour: number; minute: number }): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

function isSlotOccupied(
    slotStart: Date,
    slotEnd: Date,
    existing: { scheduledAt: Date; duration: number }[],
): boolean {
    return existing.some((appt) => {
        const apptStart = appt.scheduledAt
        const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000)
        return slotStart < apptEnd && slotEnd > apptStart
    })
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const slug = searchParams.get('slug')
        const dateStr = searchParams.get('date')

        if (!slug) {
            return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
        }

        const selectedDate = dateStr ? new Date(dateStr) : new Date()
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
        const dayAvailability = professional.availability.filter(
            (a) => a.dayOfWeek === dayOfWeek,
        )

        if (dayAvailability.length === 0) {
            return NextResponse.json({ slots: [] })
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

        const slots: string[] = []

        for (const { startTime, endTime } of dayAvailability) {
            const start = parseTime(startTime)
            const end = parseTime(endTime)
            let currentMinutes = timeToMinutes(start)
            const endMinutes = timeToMinutes(end)

            while (currentMinutes < endMinutes) {
                const slotStart = addMinutes(currentMinutes, 0)
                const slotEnd = addMinutes(currentMinutes, SLOT_DURATION_MIN)

                const slotStartDate = new Date(selectedDate)
                slotStartDate.setHours(slotStart.hour, slotStart.minute, 0, 0)
                const slotEndDate = new Date(selectedDate)
                slotEndDate.setHours(slotEnd.hour, slotEnd.minute, 0, 0)

                if (!isSlotOccupied(slotStartDate, slotEndDate, existingAppointments)) {
                    slots.push(formatTime(slotStart))
                }

                currentMinutes += SLOT_DURATION_MIN
            }
        }

        return NextResponse.json({ slots, sessionDuration: professional.sessionDuration })
    } catch (error) {
        console.error('Availability error:', error)
        return NextResponse.json({ slots: [] }, { status: 500 })
    }
}
