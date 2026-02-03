import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Minimum age for platform usage (18 years)
const MIN_AGE = 18

// Calculate age from birth date
function calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

// Validate Chilean phone number format
function isValidChileanPhone(phone: string): boolean {
    // Accept formats: +56912345678, 56912345678, 912345678, +56 9 1234 5678
    const cleanPhone = phone.replace(/[\s\-]/g, '')
    return /^(\+?56)?9\d{8}$/.test(cleanPhone)
}

const profileSchema = z.object({
    // Step 1: Personal Data
    phone: z.string()
        .optional()
        .refine((val) => !val || isValidChileanPhone(val), {
            message: 'El teléfono debe ser un número chileno válido (ej: +56912345678)',
        }),
    birthDate: z.string()
        .optional()
        .refine((val) => {
            if (!val) return true
            const date = new Date(val)
            if (isNaN(date.getTime())) return false
            const age = calculateAge(date)
            return age >= MIN_AGE
        }, {
            message: `Debes tener al menos ${MIN_AGE} años para usar la plataforma`,
        })
        .refine((val) => {
            if (!val) return true
            const date = new Date(val)
            // Check date is not in the future
            return date <= new Date()
        }, {
            message: 'La fecha de nacimiento no puede ser en el futuro',
        })
        .refine((val) => {
            if (!val) return true
            const date = new Date(val)
            const age = calculateAge(date)
            // Check reasonable age (not more than 120 years old)
            return age <= 120
        }, {
            message: 'Por favor ingresa una fecha de nacimiento válida',
        }),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_SAY']).optional(),
    region: z.string().optional(),
    comuna: z.string().optional(),

    // Step 2: Context
    occupation: z.string().max(100, 'La ocupación es muy larga').optional(),
    occupationStatus: z.enum(['EMPLOYED', 'SELF_EMPLOYED', 'STUDENT', 'UNEMPLOYED', 'RETIRED', 'HOMEMAKER']).optional(),
    maritalStatus: z.enum(['SINGLE', 'IN_RELATIONSHIP', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    hasChildren: z.boolean().nullable().optional(),
    healthSystem: z.enum(['FONASA', 'ISAPRE', 'PRIVATE', 'NONE']).optional(),
    previousTherapy: z.boolean().nullable().optional(),

    // Step 3: Consultation
    consultationReason: z.string().max(2000, 'El texto es muy largo (máximo 2000 caracteres)').optional(),
    interestAreas: z.array(z.string()).optional(),
    modalityPreference: z.enum(['ONLINE', 'IN_PERSON', 'BOTH']).optional(),
    professionalGenderPref: z.enum(['MALE', 'FEMALE', 'NO_PREFERENCE']).optional(),

    // Step 4: Emergency Contact
    emergencyName: z.string().max(100, 'El nombre es muy largo').optional(),
    emergencyRelationship: z.enum(['FAMILY', 'PARTNER', 'FRIEND', 'OTHER']).optional(),
    emergencyPhone: z.string()
        .optional()
        .refine((val) => !val || isValidChileanPhone(val), {
            message: 'El teléfono de emergencia debe ser un número chileno válido',
        }),
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

        // Update user phone if provided
        if (data.phone) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    phone: data.phone,
                    profileCompleted: true,
                },
            })
        } else {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { profileCompleted: true },
            })
        }

        // Prepare profile data
        const profileData = {
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            region: data.region,
            comuna: data.comuna,
            occupation: data.occupation,
            occupationStatus: data.occupationStatus,
            maritalStatus: data.maritalStatus,
            hasChildren: data.hasChildren,
            healthSystem: data.healthSystem,
            previousTherapy: data.previousTherapy,
            consultationReason: data.consultationReason,
            interestAreas: data.interestAreas || [],
            modalityPreference: data.modalityPreference,
            professionalGenderPref: data.professionalGenderPref,
        }

        // Upsert patient profile
        const patientProfile = await prisma.patientProfile.upsert({
            where: { userId: session.user.id },
            update: profileData,
            create: {
                userId: session.user.id,
                ...profileData,
            },
        })

        // Handle emergency contact
        if (data.emergencyName && data.emergencyPhone && data.emergencyRelationship) {
            await prisma.emergencyContact.upsert({
                where: { patientProfileId: patientProfile.id },
                update: {
                    name: data.emergencyName,
                    relationship: data.emergencyRelationship,
                    phone: data.emergencyPhone,
                },
                create: {
                    patientProfileId: patientProfile.id,
                    name: data.emergencyName,
                    relationship: data.emergencyRelationship,
                    phone: data.emergencyPhone,
                },
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
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
            { error: 'Error al actualizar el perfil' },
            { status: 500 }
        )
    }
}

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
            include: {
                patientProfile: {
                    include: {
                        emergencyContact: true,
                    },
                },
                professional: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileCompleted: user.profileCompleted,
            },
            patientProfile: user.patientProfile,
            professionalProfile: user.professional,
        })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { error: 'Error al obtener el perfil' },
            { status: 500 }
        )
    }
}
