import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const professional = await prisma.professional.findUnique({
            where: {
                slug: params.slug,
                isPublic: true,
                isActive: true,
            },
            // select explícito: nunca exponer rut, licensePdfUrl, userId,
            // subscriptionTier ni linkedinUrl desde un endpoint público.
            select: {
                id: true,
                professionalType: true,
                licenseNumber: true,
                bio: true,
                slug: true,
                specialties: true,
                modality: true,
                sessionPrice: true,
                sessionDuration: true,
                profileImageUrl: true,
                verificationStatus: true,
                comuna: true,
                officeAddress: true,
                region: true,
                acceptedPaymentMethods: true,
                targetAudience: true,
                approachDescription: true,
                yearsExperience: true,
                firstSessionInfo: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                availability: {
                    where: { isActive: true },
                    select: {
                        dayOfWeek: true,
                        startTime: true,
                        endTime: true,
                    },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
            },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(professional)
    } catch (error) {
        console.error('Professional fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener profesional' },
            { status: 500 }
        )
    }
}
