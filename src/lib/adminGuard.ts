import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface AdminContext {
    adminId: string
    adminName: string | null
    adminEmail: string
}

/**
 * Exige una sesion de administrador VIGENTE.
 *
 * El rol del JWT puede estar desactualizado hasta 30 dias (se lee solo al iniciar sesion), asi que aqui se
 * confirma en la base de datos: si el usuario fue degradado o desactivado, pierde el acceso de inmediato.
 * Devuelve el contexto del administrador o una respuesta de error lista para retornar.
 */
export async function requireAdmin(): Promise<AdminContext | { error: NextResponse }> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, isActive: true, name: true, email: true },
    })
    if (!user || user.role !== 'ADMIN' || user.isActive === false) {
        return { error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
    }

    return { adminId: user.id, adminName: user.name, adminEmail: user.email }
}
