import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    let dbStatus = 'unknown'
    let userCount = 0
    try {
        userCount = await prisma.user.count()
        dbStatus = 'connected'
    } catch (err) {
        dbStatus = err instanceof Error ? err.message : 'db connection error'
    }

    return NextResponse.json(
        { 
            ok: dbStatus === 'connected',
            database: dbStatus,
            users: userCount,
            timestamp: new Date().toISOString()
        },
        {
            status: dbStatus === 'connected' ? 200 : 503,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        }
    )
}
