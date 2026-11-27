/**
 * Generacion de horarios disponibles para reservar.
 *
 * Los bloques tienen la duracion real de la sesion del profesional (30, 45, 50, 60... min):
 * con 50 min y una ventana 09:00-13:00 salen 09:00, 09:50, 10:40 y 11:30 (el siguiente no cabe).
 * Un horario se descarta si choca con una cita existente o si ya paso (cuando la fecha es hoy).
 */

export interface AvailabilityWindow {
    startTime: string // 'HH:mm'
    endTime: string // 'HH:mm'
}

export interface BusyAppointment {
    scheduledAt: Date
    duration: number
}

function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

function format(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function generateSlots(args: {
    /** Dia seleccionado a las 00:00 (hora local del servidor). */
    day: Date
    windows: AvailabilityWindow[]
    durationMin: number
    busy: BusyAppointment[]
    now?: Date
}): string[] {
    const { day, windows, durationMin, busy } = args
    const now = args.now ?? new Date()
    const step = Math.max(15, durationMin)
    const slots = new Set<string>()

    for (const { startTime, endTime } of windows) {
        const end = toMinutes(endTime)
        for (let t = toMinutes(startTime); t + durationMin <= end; t += step) {
            const start = new Date(day)
            start.setHours(Math.floor(t / 60), t % 60, 0, 0)
            const finish = new Date(start.getTime() + durationMin * 60000)

            if (start.getTime() <= now.getTime()) continue
            const overlaps = busy.some((b) => {
                const bEnd = new Date(b.scheduledAt.getTime() + b.duration * 60000)
                return start < bEnd && finish > b.scheduledAt
            })
            if (!overlaps) slots.add(format(t))
        }
    }

    return Array.from(slots).sort()
}
