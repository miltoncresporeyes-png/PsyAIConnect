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

        const professionals = await prisma.professional.findMany({
            where: { verificationStatus: 'PENDING' },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        const formatted = professionals.map(p => ({
            id: p.id,
            userId: p.userId,
            name: p.user.name,
            email: p.user.email,
            rut: p.rut,
            licenseNumber: p.licenseNumber,
            licensePdfUrl: p.licensePdfUrl,
            professionalType: p.professionalType,
            specialties: p.specialties,
            createdAt: p.createdAt.toISOString(),
        }))

        return NextResponse.json(formatted)
    } catch (error) {
        console.error('Pending professionals error:', error)
        return NextResponse.json(
            { error: 'Error al obtener profesionales' },
            { status: 500 }
        )
    }
}
