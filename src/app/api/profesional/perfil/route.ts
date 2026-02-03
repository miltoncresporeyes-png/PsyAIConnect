import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

const profileSchema = z.object({
    professionalType: z.enum(['PSYCHOLOGIST', 'PSYCHIATRIST', 'CLINICAL_PSYCHOLOGIST', 'THERAPIST', 'COUNSELOR', 'OTHER']),
    licenseNumber: z.string().optional().or(z.literal('')),
    bio: z.string().min(50, 'La biografía debe tener al menos 50 caracteres'),
    specialties: z.array(z.string()).min(1, 'Selecciona al menos un área de trabajo'),
    modality: z.enum(['ONLINE', 'IN_PERSON', 'BOTH']),
    sessionPrice: z.number().min(10000, 'El precio mínimo es $10.000'),
    sessionDuration: z.number().min(30).max(120),
    linkedinUrl: z.string().url('Ingresa una URL de LinkedIn válida').optional().or(z.literal('')),
    profileImageUrl: z.string().min(1, 'La foto de perfil es obligatoria'),
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const data = profileSchema.parse(body)

        // Check if user has a professional profile
        let professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (professional) {
            // Update existing profile
            professional = await prisma.professional.update({
                where: { userId: session.user.id },
                data: {
                    professionalType: data.professionalType,
                    licenseNumber: data.licenseNumber || null,
                    bio: data.bio,
                    specialties: data.specialties,
                    modality: data.modality,
                    sessionPrice: data.sessionPrice,
                    sessionDuration: data.sessionDuration,
                    linkedinUrl: data.linkedinUrl || null,
                    profileImageUrl: data.profileImageUrl,
                    isPublic: true, // Make profile visible after completion
                },
            })
        } else {
            // Create new professional profile
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
            })

            if (!user) {
                return NextResponse.json(
                    { error: 'Usuario no encontrado' },
                    { status: 404 }
                )
            }

            // Generate slug
            const slug = `${user.name?.toLowerCase().replace(/\s+/g, '-') || 'profesional'}-${session.user.id.slice(0, 6)}`

            professional = await prisma.professional.create({
                data: {
                    userId: session.user.id,
                    professionalType: data.professionalType,
                    licenseNumber: data.licenseNumber || null,
                    bio: data.bio,
                    specialties: data.specialties,
                    modality: data.modality,
                    sessionPrice: data.sessionPrice,
                    sessionDuration: data.sessionDuration,
                    linkedinUrl: data.linkedinUrl || null,
                    profileImageUrl: data.profileImageUrl,
                    slug,
                    isPublic: true,
                },
            })

            // Update user role if not already professional
            await prisma.user.update({
                where: { id: session.user.id },
                data: { role: 'PROFESSIONAL' },
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Perfil actualizado',
            slug: professional.slug,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: 'Error al guardar perfil' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
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
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(professional)
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener perfil' },
            { status: 500 }
        )
    }
}
