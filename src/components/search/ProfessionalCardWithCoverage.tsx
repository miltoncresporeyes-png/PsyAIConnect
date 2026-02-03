'use client'

import Link from 'next/link'
import { MapPin, Video, Users, Star } from 'lucide-react'

interface ProfessionalCardWithCoverageProps {
    professional: {
        id: string
        name: string
        profileImage?: string
        slug: string
        specialties: string[]
        sessionPrice: number
        modality: string
        region?: string
        comuna?: string
        matchScore?: number
        financialCompatibility?: 'PERFECT' | 'GOOD' | 'PARTIAL' | 'LOW'
        paymentMethod?: string
        copayment?: number
        coveragePercentage?: number
        badges?: string[]
    }
}

export function ProfessionalCardWithCoverage({
    professional,
}: ProfessionalCardWithCoverageProps) {
    const {
        name,
        profileImage,
        slug,
        specialties,
        sessionPrice,
        modality,
        comuna,
        matchScore,
        financialCompatibility,
        copayment,
        coveragePercentage,
        badges,
    } = professional

    const compatibilityColors = {
        PERFECT: 'bg-green-100 text-green-800 border-green-200',
        GOOD: 'bg-blue-100 text-blue-800 border-blue-200',
        PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        LOW: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    const compatibilityLabels = {
        PERFECT: '✓ Cobertura Perfecta',
        GOOD: '✓ Buena Cobertura',
        PARTIAL: '~ Cobertura Parcial',
        LOW: 'Sin Cobertura',
    }

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Header con Score y Compatibilidad */}
            {matchScore !== undefined && financialCompatibility && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Match: {matchScore}%
                        </div>
                    </div>
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${compatibilityColors[financialCompatibility]
                            }`}
                    >
                        {compatibilityLabels[financialCompatibility]}
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Foto y Nombre */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">4.8</span>
                            </div>
                            {comuna && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{comuna}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Especialidades */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {specialties.slice(0, 3).map((specialty, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100"
                            >
                                {specialty}
                            </span>
                        ))}
                        {specialties.length > 3 && (
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                                +{specialties.length - 3} más
                            </span>
                        )}
                    </div>
                </div>

                {/* Badges de Cobertura */}
                {badges && badges.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {badges.map((badge, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200 flex items-center gap-1"
                            >
                                <span className="text-green-500">✓</span>
                                {formatBadge(badge)}
                            </span>
                        ))}
                    </div>
                )}

                {/* Información Financiera */}
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Precio Sesión</p>
                            <p className="text-lg font-bold text-gray-900">
                                ${sessionPrice.toLocaleString('es-CL')}
                            </p>
                        </div>
                        {copayment !== undefined && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Tu Copago</p>
                                <p className="text-lg font-bold text-green-600">
                                    ${copayment.toLocaleString('es-CL')}
                                </p>
                                {coveragePercentage && coveragePercentage > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {coveragePercentage}% cubierto
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Barra de cobertura */}
                    {coveragePercentage !== undefined && coveragePercentage > 0 && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${coveragePercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Modalidad */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    {modality === 'ONLINE' && (
                        <>
                            <Video className="w-4 h-4" />
                            <span>Solo Online</span>
                        </>
                    )}
                    {modality === 'IN_PERSON' && (
                        <>
                            <Users className="w-4 h-4" />
                            <span>Solo Presencial</span>
                        </>
                    )}
                    {modality === 'BOTH' && (
                        <>
                            <Video className="w-4 h-4" />
                            <Users className="w-4 h-4" />
                            <span>Online y Presencial</span>
                        </>
                    )}
                </div>

                {/* CTA */}
                <Link
                    href={`/profesional/${slug}`}
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    Ver Perfil y Agendar
                </Link>
            </div>
        </div>
    )
}

// Helper para formatear badges
function formatBadge(badge: string): string {
    if (badge === 'BONO_IMED') return 'Acepta Bono IMED'
    if (badge.startsWith('REEMBOLSO_')) {
        const percentage = badge.replace('REEMBOLSO_', '')
        return `Reembolso ${percentage}%`
    }
    if (badge.startsWith('FONASA_')) {
        const level = badge.replace('FONASA_', '')
        return level === 'MLE' ? 'Fonasa MLE' : `Fonasa ${level}`
    }
    return badge
}
