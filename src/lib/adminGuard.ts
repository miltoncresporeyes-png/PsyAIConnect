import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** Exige una sesion de administrador. Devuelve el id del admin o una respuesta de error. */
export async function requireAdmin(): Promise<{ adminId: string } | { error: NextResponse }> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
    if (session.user.role !== 'ADMIN') return { error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
    return { adminId: session.user.id }
}
