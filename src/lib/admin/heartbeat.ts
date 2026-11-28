import { prisma } from '@/lib/prisma'

/** Registra la ultima ejecucion de una tarea programada. Nunca lanza: no debe romper la tarea. */
export async function recordHeartbeat(
    name: string,
    status: 'ok' | 'error',
    payload: { result?: unknown; error?: string } = {}
) {
    try {
        const data = {
            lastRunAt: new Date(),
            lastStatus: status,
            lastResult: (payload.result ?? null) as never,
            lastError: payload.error ? payload.error.slice(0, 500) : null,
        }
        await prisma.systemHeartbeat.upsert({
            where: { name },
            create: { name, ...data, runCount: 1 },
            update: { ...data, runCount: { increment: 1 } },
        })
    } catch (error) {
        console.error('[heartbeat] no se pudo registrar:', error)
    }
}

export async function getHeartbeat(name: string) {
    return prisma.systemHeartbeat.findUnique({ where: { name } })
}
