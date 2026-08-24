import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acceso denegado' },
                { status: 403 }
            )
        }

        const pendingProfessionals = await prisma.professional.count({
            where: { verificationStatus: 'PENDING' },
        })

        return NextResponse.json({
            pendingProfessionals,
        })
    } catch (error) {
        console.error('Pending count error:', error)
        return NextResponse.json(
            { error: 'Error al obtener conteo' },
            { status: 500 }
        )
    }
}
