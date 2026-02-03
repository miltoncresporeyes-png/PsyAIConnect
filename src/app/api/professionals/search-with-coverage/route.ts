import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tipos
interface SearchParams {
    specialties?: string[]
    modality?: 'ONLINE' | 'IN_PERSON' | 'BOTH'
    region?: string
    comuna?: string
    healthSystem?: 'FONASA' | 'ISAPRE' | 'PRIVATE' | 'NONE'
    isapreId?: string
    fonasaTramoId?: string
    hasBonoIMED?: boolean
    maxCopayment?: number
    page?: number
    limit?: number
}

export async function POST(request: NextRequest) {
    try {
        const body: SearchParams = await request.json()
        const {
            specialties,
            modality,
            region,
            comuna,
            healthSystem,
            isapreId,
            fonasaTramoId,
            hasBonoIMED,
            maxCopayment,
            page = 1,
            limit = 20,
        } = body

        // 1. Query base de profesionales
        const whereClause: any = {
            isActive: true,
            isPublic: true,
            verificationStatus: 'VERIFIED',
        }

        if (specialties && specialties.length > 0) {
            whereClause.specialties = {
                hasSome: specialties,
            }
        }

        if (modality) {
            whereClause.modality = {
                in: [modality, 'BOTH'],
            }
        }

        if (region) {
            whereClause.region = region
        }

        if (comuna) {
            whereClause.comuna = comuna
        }

        // 2. Obtener profesionales con sus convenios
        const professionals = await prisma.professional.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                isapreConvenios: {
                    where: { isActive: true },
                    include: {
                        isapre: true,
                    },
                },
                fonasaAcceptance: {
                    where: { isActive: true },
                    include: {
                        fonasaTramo: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit * 2, // Traer el doble para tener margen después del filtrado
        })

        // 3. Calcular score y compatibilidad para cada profesional
        const scoredProfessionals = professionals
            .map((prof) => {
                const financialScore = calculateFinancialScore(prof, {
                    healthSystem,
                    isapreId,
                    fonasaTramoId,
                    hasBonoIMED,
                })

                const specialtyScore = calculateSpecialtyScore(prof, specialties)

                const totalScore =
                    financialScore * 0.40 +
                    specialtyScore * 0.30 +
                    50 * 0.15 + // Location (placeholder)
                    80 * 0.10 + // Rating (placeholder)
                    70 * 0.05 // Availability (placeholder)

                const paymentDetails = calculatePaymentDetails(prof, {
                    healthSystem,
                    isapreId,
                    fonasaTramoId,
                    hasBonoIMED,
                })

                return {
                    id: prof.id,
                    name: prof.user.name,
                    profileImage: prof.user.image,
                    slug: prof.slug,
                    specialties: prof.specialties,
                    sessionPrice: prof.sessionPrice,
                    modality: prof.modality,
                    region: prof.region,
                    comuna: prof.comuna,

                    // Matching info
                    matchScore: Math.round(totalScore),
                    financialCompatibility: getCompatibilityLevel(financialScore),

                    // Payment info
                    paymentMethod: paymentDetails.method,
                    estimatedCost: prof.sessionPrice,
                    copayment: paymentDetails.copayment,
                    coveragePercentage: paymentDetails.coveragePercentage,

                    // Badges
                    badges: generateBadges(prof, { healthSystem, isapreId, fonasaTramoId }),
                }
            })
            .sort((a, b) => b.matchScore - a.matchScore)

        // 4. Filtrar por copago máximo si se especificó
        const filtered = maxCopayment
            ? scoredProfessionals.filter((p) => p.copayment <= maxCopayment)
            : scoredProfessionals

        // 5. Limitar resultados finales
        const paginatedResults = filtered.slice(0, limit)

        // 6. Obtener total count
        const total = await prisma.professional.count({ where: whereClause })

        return NextResponse.json({
            professionals: paginatedResults,
            meta: {
                total,
                page,
                limit,
                hasMore: page * limit < filtered.length,
                totalWithCoverage: filtered.length,
            },
        })
    } catch (error) {
        console.error('Error in search-with-coverage:', error)
        return NextResponse.json(
            { error: 'Error al buscar profesionales' },
            { status: 500 }
        )
    }
}

// ============================================
// FUNCIONES DE SCORING
// ============================================

function calculateFinancialScore(
    professional: any,
    patientData: any
): number {
    const { healthSystem, isapreId, fonasaTramoId, hasBonoIMED } = patientData

    // ISAPRE
    if (healthSystem === 'ISAPRE' && isapreId) {
        const convenio = professional.isapreConvenios.find(
            (c: any) => c.isapreId === isapreId
        )

        if (convenio) {
            if (convenio.acceptsBono && hasBonoIMED) {
                const copaymentRatio = convenio.copaymentAmount / professional.sessionPrice
                if (copaymentRatio < 0.1) return 100
                if (copaymentRatio < 0.3) return 90
                return 80
            }

            if (convenio.acceptsReembolso) {
                const reembolsoPct = convenio.reembolsoPercentage
                if (reembolsoPct >= 70) return 80
                if (reembolsoPct >= 40) return 60
                return 40
            }
        }

        return 20
    }

    // FONASA
    if (healthSystem === 'FONASA' && fonasaTramoId) {
        const acceptance = professional.fonasaAcceptance.find(
            (f: any) => f.fonasaTramoId === fonasaTramoId
        )

        if (acceptance) {
            if (acceptance.acceptsBonoArancel) {
                const coverageRatio = acceptance.bonoAmount / professional.sessionPrice
                if (coverageRatio >= 0.8) return 100
                if (coverageRatio >= 0.5) return 85
                return 70
            }

            if (acceptance.acceptsMLE) return 60
        }

        return 30
    }

    // PARTICULAR
    if (healthSystem === 'PRIVATE') {
        if (professional.sessionPrice <= 30000) return 70
        if (professional.sessionPrice <= 50000) return 50
        return 30
    }

    return 20
}

function calculateSpecialtyScore(
    professional: any,
    patientSpecialties?: string[]
): number {
    if (!patientSpecialties || patientSpecialties.length === 0) {
        return 50
    }

    const profSpecialties = new Set(professional.specialties)
    const matchCount = patientSpecialties.filter((s) => profSpecialties.has(s)).length

    if (matchCount >= 2) return 100
    if (matchCount === 1) return 80
    return 30
}

function getCompatibilityLevel(score: number): string {
    if (score >= 90) return 'PERFECT'
    if (score >= 70) return 'GOOD'
    if (score >= 40) return 'PARTIAL'
    return 'LOW'
}

function calculatePaymentDetails(
    professional: any,
    patientData: any
): {
    method: string
    copayment: number
    coveragePercentage: number
} {
    const { healthSystem, isapreId, fonasaTramoId, hasBonoIMED } = patientData

    // ISAPRE
    if (healthSystem === 'ISAPRE' && isapreId) {
        const convenio = professional.isapreConvenios.find(
            (c: any) => c.isapreId === isapreId
        )

        if (convenio?.acceptsBono && hasBonoIMED) {
            return {
                method: 'BONO_IMED',
                copayment: convenio.copaymentAmount,
                coveragePercentage: Math.round(
                    ((professional.sessionPrice - convenio.copaymentAmount) /
                        professional.sessionPrice) *
                    100
                ),
            }
        }

        if (convenio?.acceptsReembolso) {
            return {
                method: 'REEMBOLSO',
                copayment: professional.sessionPrice,
                coveragePercentage: convenio.reembolsoPercentage,
            }
        }
    }

    // FONASA
    if (healthSystem === 'FONASA' && fonasaTramoId) {
        const acceptance = professional.fonasaAcceptance.find(
            (f: any) => f.fonasaTramoId === fonasaTramoId
        )

        if (acceptance?.acceptsBonoArancel) {
            const copayment = Math.max(0, professional.sessionPrice - acceptance.bonoAmount)
            return {
                method: 'BONO_FONASA',
                copayment,
                coveragePercentage: Math.round(
                    (acceptance.bonoAmount / professional.sessionPrice) * 100
                ),
            }
        }
    }

    // PARTICULAR
    return {
        method: 'PRIVATE',
        copayment: professional.sessionPrice,
        coveragePercentage: 0,
    }
}

function generateBadges(professional: any, patientData: any): string[] {
    const badges: string[] = []
    const { healthSystem, isapreId, fonasaTramoId } = patientData

    if (healthSystem === 'ISAPRE' && isapreId) {
        const convenio = professional.isapreConvenios.find(
            (c: any) => c.isapreId === isapreId
        )

        if (convenio?.acceptsBono) {
            badges.push('BONO_IMED')
        }

        if (convenio?.acceptsReembolso) {
            badges.push(`REEMBOLSO_${convenio.reembolsoPercentage}`)
        }
    }

    if (healthSystem === 'FONASA' && fonasaTramoId) {
        const acceptance = professional.fonasaAcceptance.find(
            (f: any) => f.fonasaTramoId === fonasaTramoId
        )

        if (acceptance?.acceptsBonoArancel) {
            badges.push(`FONASA_${acceptance.bonoLevel}`)
        }

        if (acceptance?.acceptsMLE) {
            badges.push('FONASA_MLE')
        }
    }

    return badges
}
