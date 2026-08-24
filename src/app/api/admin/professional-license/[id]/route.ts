import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const professional = await prisma.professional.findUnique({
            where: { id: params.id },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        if (!professional.licensePdfUrl) {
            return NextResponse.json(
                { error: 'PDF no disponible' },
                { status: 404 }
            )
        }

        return NextResponse.redirect(professional.licensePdfUrl)
    } catch (error) {
        console.error('License PDF error:', error)
        return NextResponse.json(
            { error: 'Error al obtener el PDF' },
            { status: 500 }
        )
    }
}
