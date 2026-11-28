import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { getOverview } from '@/lib/admin/metrics'

export const dynamic = 'force-dynamic'

/** KPIs, series y alertas del dashboard ejecutivo. */
export async function GET() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error
    try {
        return NextResponse.json(await getOverview())
    } catch (error) {
        console.error('[admin/overview] error:', error)
        return NextResponse.json({ error: 'No se pudo calcular el resumen' }, { status: 500 })
    }
}
