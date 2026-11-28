import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { getSystemHealth } from '@/lib/admin/health'

export const dynamic = 'force-dynamic'

/** Salud del sistema: base de datos, cron, Meet, configuracion (sin valores secretos) y version desplegada. */
export async function GET() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error
    try {
        const health = await getSystemHealth()
        return NextResponse.json({
            ...health,
            build: {
                environment: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || null,
                commit: process.env.RAILWAY_GIT_COMMIT_SHA ? process.env.RAILWAY_GIT_COMMIT_SHA.slice(0, 7) : null,
                branch: process.env.RAILWAY_GIT_BRANCH || null,
                node: process.version,
            },
        })
    } catch (error) {
        console.error('[admin/sistema] error:', error)
        return NextResponse.json({ error: 'No se pudo revisar el sistema' }, { status: 500 })
    }
}
