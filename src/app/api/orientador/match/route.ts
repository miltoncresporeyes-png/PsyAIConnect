import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================
// Types
// ============================================

interface MatchRequest {
    reason: string // anxiety, depression, relationships, trauma, growth
    urgency: string // immediate, soon, flexible
    modality: string // online, presencial, hybrid
    insurance: string // fonasa, isapre_consalud, isapre_colmena, isapre_other, none
    budget: string // low, medium, high, premium
}

interface ScoredProfessional {
    id: string
    name: string
    specialty: string
    experience: string
    matchScore: number
    image: string | null
    acceptsInsurance: string
    price: string
    modalities: string[]
    nextAvailable: string
    expertise: string[]
    slug: string
    bio: string | null
}

// ============================================
// Matching Algorithm
// ============================================

function calculateMatchScore(
    professional: any,
    answers: MatchRequest
): number {
    let score = 0

    // 1. Specialty Match (40 points max)
    const specialtyMapping: Record<string, string[]> = {
        anxiety: ['ansiedad', 'estrés', 'trastornos de ansiedad', 'cognitivo-conductual', 'tcc'],
        depression: ['depresión', 'trastornos del ánimo', 'mindfulness', 'terapia de aceptación'],
        relationships: ['terapia de pareja', 'familia', 'relaciones', 'sistémica'],
        trauma: ['trauma', 'duelo', 'emdr', 'psicotraumática'],
        growth: ['crecimiento personal', 'coaching', 'existencial', 'humanista'],
    }

    const relevantSpecialties = specialtyMapping[answers.reason] || []
    const professionalSpecialties = professional.specialties.map((s: string) => s.toLowerCase())

    const matchingSpecialties = relevantSpecialties.filter(rs =>
        professionalSpecialties.some((ps: string) => ps.includes(rs))
    )

    score += Math.min(matchingSpecialties.length * 15, 40)

    // 2. Modality Match (20 points max)
    const modalityScore: Record<string, number> = {
        online: professional.modality === 'ONLINE' || professional.modality === 'BOTH' ? 20 : 0,
        presencial: professional.modality === 'PRESENCIAL' || professional.modality === 'BOTH' ? 20 : 0,
        hybrid: professional.modality === 'BOTH' ? 20 : 10,
    }
    score += modalityScore[answers.modality] || 0

    // 3. Price Range Match (20 points max)
    const priceRanges: Record<string, [number, number]> = {
        low: [0, 25000],
        medium: [25000, 40000],
        high: [40000, 60000],
        premium: [60000, 999999],
    }

    const [minPrice, maxPrice] = priceRanges[answers.budget]
    if (professional.sessionPrice >= minPrice && professional.sessionPrice <= maxPrice) {
        score += 20
    } else {
        // Partial score if close to range
        const distance = Math.min(
            Math.abs(professional.sessionPrice - minPrice),
            Math.abs(professional.sessionPrice - maxPrice)
        )
        if (distance < 10000) score += 10
    }

    // 4. Availability Score (10 points max)
    // If urgency is immediate and professional has upcoming availability → bonus
    if (answers.urgency === 'immediate' && professional.availability.length > 0) {
        score += 10
    } else if (answers.urgency === 'soon' && professional.availability.length > 0) {
        score += 7
    } else if (professional.availability.length > 0) {
        score += 5
    }

    // 5. Experience Bonus (10 points max)
    if (professional.yearsExperience) {
        if (professional.yearsExperience >= 10) score += 10
        else if (professional.yearsExperience >= 5) score += 7
        else score += 5
    }

    return Math.min(score, 100) // Cap at 100%
}

function getInsuranceLabel(insurance: string): string {
    const labels: Record<string, string> = {
        fonasa: 'Fonasa',
        isapre_consalud: 'Isapre Consalud',
        isapre_colmena: 'Isapre Colmena',
        isapre_other: 'Otras Isapres',
        none: 'Pago particular',
    }
    return labels[insurance] || 'No especificado'
}

function getNextAvailableSlot(availability: any[]): string {
    // Simplified logic - in production, check real calendar
    if (availability.length === 0) return 'Consultar disponibilidad'

    const now = new Date()
    const dayOfWeek = now.getDay()

    // Find next available day
    for (let i = 1; i <= 7; i++) {
        const targetDay = (dayOfWeek + i) % 7
        const slot = availability.find((a: any) => a.dayOfWeek === targetDay && a.isActive)

        if (slot) {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            return `${days[targetDay]} ${slot.startTime}`
        }
    }

    return 'Próximamente disponible'
}

// ============================================
// API Handler
// ============================================

export async function POST(request: NextRequest) {
    try {
        const answers: MatchRequest = await request.json()

        // Validate input
        if (!answers.reason || !answers.urgency || !answers.modality || !answers.insurance || !answers.budget) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            )
        }

        // Fetch all active professionals with their availability
        const professionals = await prisma.professional.findMany({
            where: {
                isActive: true,
                isPublic: true,
                verificationStatus: 'VERIFIED',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                availability: {
                    where: {
                        isActive: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Score and rank professionals
        const scoredProfessionals: ScoredProfessional[] = professionals
            .map((prof) => {
                const matchScore = calculateMatchScore(prof, answers)

                return {
                    id: prof.id,
                    name: prof.user.name || 'Profesional',
                    specialty: prof.professionalType === 'PSYCHOLOGIST' ? 'Psicólogo/a Clínico/a' : 'Psiquiatra',
                    experience: prof.yearsExperience
                        ? `${prof.yearsExperience} años de experiencia`
                        : 'Experiencia profesional',
                    matchScore,
                    image: prof.user.image || prof.profileImageUrl,
                    acceptsInsurance: getInsuranceLabel(answers.insurance),
                    price: `$${prof.sessionPrice.toLocaleString('es-CL')}`,
                    modalities: prof.modality === 'BOTH'
                        ? ['Online', 'Presencial']
                        : prof.modality === 'ONLINE'
                            ? ['Online']
                            : ['Presencial'],
                    nextAvailable: getNextAvailableSlot(prof.availability),
                    expertise: prof.specialties || [],
                    slug: prof.slug,
                    bio: prof.bio,
                }
            })
            .filter((prof) => prof.matchScore >= 50) // Only show professionals with >50% match
            .sort((a, b) => b.matchScore - a.matchScore) // Highest score first
            .slice(0, 3) // Top 3 professionals

        // If no professionals match well enough, return top 3 anyway
        if (scoredProfessionals.length === 0) {
            return NextResponse.json(
                professionals.slice(0, 3).map((prof) => ({
                    id: prof.id,
                    name: prof.user.name || 'Profesional',
                    specialty: prof.professionalType === 'PSYCHOLOGIST' ? 'Psicólogo/a Clínico/a' : 'Psiquiatra',
                    experience: prof.yearsExperience
                        ? `${prof.yearsExperience} años de experiencia`
                        : 'Experiencia profesional',
                    matchScore: 60, // Default score
                    image: prof.user.image || prof.profileImageUrl,
                    acceptsInsurance: getInsuranceLabel(answers.insurance),
                    price: `$${prof.sessionPrice.toLocaleString('es-CL')}`,
                    modalities: prof.modality === 'BOTH'
                        ? ['Online', 'Presencial']
                        : prof.modality === 'ONLINE'
                            ? ['Online']
                            : ['Presencial'],
                    nextAvailable: getNextAvailableSlot(prof.availability),
                    expertise: prof.specialties || [],
                    slug: prof.slug,
                    bio: prof.bio,
                }))
            )
        }

        return NextResponse.json(scoredProfessionals)

    } catch (error) {
        console.error('Matching API Error:', error)
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        )
    }
}
