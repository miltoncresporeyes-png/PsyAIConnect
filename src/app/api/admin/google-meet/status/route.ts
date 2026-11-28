import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { disconnect, getConnectionStatus } from '@/lib/googleMeet'
import { logAdminAction } from '@/lib/adminLogs'

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
    await logAdminAction({
        adminId: guard.adminId,
        adminName: guard.adminName || undefined,
        action: 'DISCONNECT_GOOGLE_MEET',
        targetType: 'SYSTEM',
        targetId: 'google-meet',
    })
    return NextResponse.json({ success: true })
}
