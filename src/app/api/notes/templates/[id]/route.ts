import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil profesional no encontrado' },
                { status: 404 }
            )
        }

        const { id } = await params

        const template = await prisma.clinicalTemplate.findUnique({
            where: { id },
        })

        if (!template) {
            return NextResponse.json(
                { error: 'Plantilla no encontrada' },
                { status: 404 }
            )
        }

        if (template.isGlobal) {
            return NextResponse.json(
                { error: 'No puedes eliminar plantillas globales' },
                { status: 403 }
            )
        }

        if (template.professionalId !== professional.id) {
            return NextResponse.json(
                { error: 'No tienes permiso para eliminar esta plantilla' },
                { status: 403 }
            )
        }

        await prisma.clinicalTemplate.update({
            where: { id },
            data: { isActive: false },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Template delete error:', error)
        return NextResponse.json(
            { error: 'Error al eliminar plantilla' },
            { status: 500 }
        )
    }
}
