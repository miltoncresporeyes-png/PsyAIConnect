import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const guard = await requireAdmin()
        if ('error' in guard) return guard.error

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
