import { prisma } from '@/lib/prisma'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, DollarSign, Shield, Clock, CreditCard } from 'lucide-react'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Suspense } from 'react'

const professionalTypeLabels: Record<string, string> = {
    PSYCHOLOGIST: 'Psicólogo/a',
    PSYCHIATRIST: 'Psiquiatra',
    CLINICAL_PSYCHOLOGIST: 'Psicólogo/a Clínico',
    THERAPIST: 'Terapeuta',
    COUNSELOR: 'Consejero/a',
    OTHER: 'Profesional',
}

const modalityLabels: Record<string, string> = {
    ONLINE: 'Online',
    IN_PERSON: 'Presencial',
    BOTH: 'Online/Presencial',
}

const paymentMethodLabels: Record<string, string> = {
    FONASA: 'FONASA',
    ISAPRE: 'ISAPRE',
    PARTICULAR: 'Particular',
    OTRO: 'Otro',
}

interface SearchParams {
    region?: string
    comuna?: string
    modalidad?: string
    especialidad?: string
}

export default async function BuscarPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const selectedRegion = searchParams.region || ''
    const selectedComuna = searchParams.comuna || ''
    const selectedModalidad = searchParams.modalidad || ''

    // Build filter conditions
    const whereConditions: Record<string, unknown> = {
        isPublic: true,
        isActive: true,
    }

    if (selectedRegion) {
        whereConditions.region = selectedRegion
    }

    if (selectedComuna) {
        whereConditions.comuna = selectedComuna
    }

    if (selectedModalidad) {
        whereConditions.modality = selectedModalidad
    }

    // Fetch all public professionals with filters
    const professionals = await prisma.professional.findMany({
        where: whereConditions,
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50">
                {/* Search Header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="container-wide py-8">
                        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            Encuentra tu profesional
                        </h1>

                        {/* Search Filters */}
                        <div className="flex gap-4 flex-wrap">
                            <div className="relative flex-1 min-w-[250px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o especialidad..."
                                    className="input pl-10"
                                />
                            </div>

                            <Suspense fallback={<div className="flex gap-4"><div className="input w-[180px] animate-pulse bg-gray-100" /><div className="input w-[180px] animate-pulse bg-gray-100" /><div className="input w-[140px] animate-pulse bg-gray-100" /></div>}>
                                <SearchFilters
                                    selectedRegion={selectedRegion}
                                    selectedComuna={selectedComuna}
                                    selectedModalidad={selectedModalidad}
                                />
                            </Suspense>
                        </div>

                        {/* Active Filters */}
                        {(selectedRegion || selectedComuna || selectedModalidad) && (
                            <div className="mt-4 flex gap-2 flex-wrap items-center">
                                <span className="text-sm text-gray-500">Filtros activos:</span>
                                {selectedRegion && (
                                    <span className="badge-primary">
                                        {selectedRegion}
                                    </span>
                                )}
                                {selectedComuna && (
                                    <span className="badge-primary">
                                        {selectedComuna}
                                    </span>
                                )}
                                {selectedModalidad && (
                                    <span className="badge-primary">
                                        {modalityLabels[selectedModalidad] || selectedModalidad}
                                    </span>
                                )}
                                <Link
                                    href="/buscar"
                                    className="text-sm text-primary-600 hover:underline ml-2"
                                >
                                    Limpiar filtros
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="container-wide py-8">
                    {professionals.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {selectedRegion || selectedComuna
                                    ? 'No hay profesionales en esta ubicación'
                                    : 'Aún no hay profesionales'}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {selectedRegion || selectedComuna
                                    ? 'Intenta ampliar tu búsqueda o seleccionar otra región.'
                                    : 'Estamos trabajando para traer profesionales verificados pronto.'}
                            </p>
                            {selectedRegion ? (
                                <Link href="/buscar" className="btn-primary">
                                    Ver todos los profesionales
                                </Link>
                            ) : (
                                <Link href="/profesionales" className="btn-primary">
                                    ¿Eres profesional? Únete
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-6">
                                {professionals.length} profesionales disponibles
                                {selectedRegion && ` en ${selectedRegion}`}
                                {selectedComuna && `, ${selectedComuna}`}
                            </p>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {professionals.map((professional) => (
                                    <Link
                                        key={professional.id}
                                        href={`/profesional/${professional.slug}`}
                                        className="professional-card group flex flex-col h-full"
                                    >
                                        {/* Header: Avatar + Name + Experience */}
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Avatar */}
                                            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                                {professional.profileImageUrl ? (
                                                    <Image
                                                        src={professional.profileImageUrl}
                                                        alt={professional.user.name || ''}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover"
                                                    />
                                                ) : professional.user.image ? (
                                                    <Image
                                                        src={professional.user.image}
                                                        alt={professional.user.name || ''}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-bold text-primary-600">
                                                        {professional.user.name?.charAt(0) || 'P'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Name + Profession + Experience */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="professional-name font-semibold text-gray-900 truncate text-lg">
                                                    {professional.user.name}
                                                </h3>
                                                <p className="text-sm text-primary-600 font-medium">
                                                    {professionalTypeLabels[professional.professionalType]}
                                                </p>
                                                {professional.yearsExperience && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        +{professional.yearsExperience} años de experiencia
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Para quién es útil */}
                                        {professional.targetAudience && (
                                            <p className="text-sm text-gray-700 mb-3 leading-relaxed border-l-2 border-primary-200 pl-3 italic">
                                                {professional.targetAudience}
                                            </p>
                                        )}

                                        {/* Cómo acompaña */}
                                        {professional.approachDescription && (
                                            <p className="text-sm text-gray-600 mb-3">
                                                {professional.approachDescription}
                                            </p>
                                        )}

                                        {/* Especialidades (segundo plano) */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {professional.specialties.slice(0, 3).map((specialty) => (
                                                <span
                                                    key={specialty}
                                                    className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                            {professional.specialties.length > 3 && (
                                                <span className="px-2 py-0.5 text-gray-400 text-xs">
                                                    +{professional.specialties.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Spacer */}
                                        <div className="flex-1" />

                                        {/* Info práctica */}
                                        <div className="space-y-2 pt-3 border-t border-gray-100 mt-auto">
                                            {/* Modalidad y ubicación */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{modalityLabels[professional.modality]}</span>
                                                {(professional.modality === 'IN_PERSON' || professional.modality === 'BOTH') && professional.comuna && (
                                                    <>
                                                        <span className="text-gray-300">·</span>
                                                        <span>{professional.comuna}</span>
                                                    </>
                                                )}
                                                {professional.firstSessionInfo && (
                                                    <>
                                                        <span className="text-gray-300">·</span>
                                                        <span className="text-primary-600 text-xs font-medium">
                                                            {professional.firstSessionInfo}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Precio y duración */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    {formatPrice(professional.sessionPrice)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {professional.sessionDuration} min
                                                </span>
                                            </div>

                                            {/* Verificación explícita */}
                                            {professional.verificationStatus === 'VERIFIED' && (
                                                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md w-fit">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    <span>Identidad y título verificados</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </>
    )
}
