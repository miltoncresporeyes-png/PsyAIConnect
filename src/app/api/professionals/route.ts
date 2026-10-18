import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const region = searchParams.get('region')
        const comuna = searchParams.get('comuna')
        const modalidad = searchParams.get('modalidad')

        const where: any = {
            isActive: true,
            isPublic: true,
            verificationStatus: 'VERIFIED',
        }

        if (region) {
            where.region = region
        }
        if (comuna) {
            where.comuna = { equals: comuna, mode: 'insensitive' }
        }
        if (modalidad) {
            if (modalidad === 'online') {
                where.modality = { in: ['ONLINE', 'BOTH'] }
            } else if (modalidad === 'presencial') {
                where.modality = { in: ['PRESENCIAL', 'BOTH'] }
            }
        }

        const professionals = await prisma.professional.findMany({
            where,
            select: {
                id: true,
                slug: true,
                professionalType: true,
                specialties: true,
                comuna: true,
                region: true,
                sessionPrice: true,
                profileImageUrl: true,
                bio: true,
                modality: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            count: professionals.length,
            professionals,
        })
    } catch (error) {
        console.error('Error fetching professionals:', error)
        return NextResponse.json({ count: 0, professionals: [] })
    }
}
