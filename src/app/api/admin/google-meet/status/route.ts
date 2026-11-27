import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { disconnect, getConnectionStatus } from '@/lib/googleMeet'

export const dynamic = 'force-dynamic'

export async function GET() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error
    return NextResponse.json(await getConnectionStatus())
}

export async function DELETE() {
    const guard = await requireAdmin()
    if ('error' in guard) return guard.error
    await disconnect()
    return NextResponse.json({ success: true })
}
