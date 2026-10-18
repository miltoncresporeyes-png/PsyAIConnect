/**
 * DEPRECATED - This endpoint was removed for security reasons.
 * It previously executed raw SQL without authentication.
 * Use Prisma migrations instead.
 */
import { NextResponse } from 'next/server'

export async function POST() {
    return NextResponse.json(
        { error: 'Este endpoint ha sido eliminado por seguridad. Usa Prisma migrations.' },
        { status: 410 }
    )
}
