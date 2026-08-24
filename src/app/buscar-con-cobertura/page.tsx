'use client'

import { useState, useEffect } from 'react'
import { CoverageFilter, CoverageData } from '@/components/search/CoverageFilter'
import { ProfessionalCardWithCoverage } from '@/components/search/ProfessionalCardWithCoverage'
import { Search, Filter, X } from 'lucide-react'

export default function BuscarConCoberturaPage() {
    const [professionals, setProfessionals] = useState([])
    const [loading, setLoading] = useState(false)
    const [coverage, setCoverage] = useState<CoverageData>({
        healthSystem: null,
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
    const [modality, setModality] = useState('')
    const [showFilters, setShowFilters] = useState(true)
    const [meta, setMeta] = useState({
        total: 0,
        totalWithCoverage: 0,
    })

    const specialtiesOptions = [
        'Ansiedad',
        'Depresión',
        'Estrés',
        'Trauma',
        'Relaciones',
        'Autoestima',
        'Duelo',
        'Trastornos del sueño',
    ]

    useEffect(() => {
        searchProfessionals()
    }, [coverage, selectedSpecialties, modality])

    const searchProfessionals = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/professionals/search-with-coverage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...coverage,
                    specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
                    modality: modality || undefined,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setProfessionals(data.professionals)
                setMeta(data.meta)
            }
        } catch {
            console.error('Error searching professionals')
        } finally {
            setLoading(false)
        }
    }

    const toggleSpecialty = (specialty: string) => {
        setSelectedSpecialties((prev) =>
            prev.includes(specialty)
                ? prev.filter((s) => s !== specialty)
                : [...prev, specialty]
        )
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f5fbfa_0%,_#f8fafc_24%,_#ffffff_100%)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white py-10 md:py-12">
                <div className="container-wide">
                    <h1 className="text-4xl font-bold mb-3">
                        Encuentra tu Profesional Ideal
                    </h1>
                    <p className="text-lg md:text-xl text-teal-50/90 max-w-2xl">
                        Filtra por tu cobertura de salud y ahorra en copago
                    </p>
                </div>
            </div>

            <div className="container-wide py-6 md:py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar de Filtros */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-4 space-y-5">
                            {/* Toggle de filtros en móvil */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden w-full flex items-center justify-between bg-white px-4 py-3 rounded-[18px] shadow-sm border border-slate-200 mb-4"
                            >
                                <span className="font-semibold flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    Filtros
                                </span>
                                {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                            </button>

                            {/* Filtros */}
                            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                                {/* Filtro de Cobertura */}
                                <CoverageFilter onCoverageChange={setCoverage} />

                                {/* Filtro de Especialidades */}
                                <div className="dashboard-panel p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Especialidades
                                    </h3>
                                    <div className="space-y-2">
                                        {specialtiesOptions.map((specialty) => (
                                            <label
                                                key={specialty}
                                                className="flex items-center group cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSpecialties.includes(specialty)}
                                                    onChange={() => toggleSpecialty(specialty)}
                                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700 group-hover:text-teal-600">
                                                    {specialty}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Filtro de Modalidad */}
                                <div className="dashboard-panel p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Modalidad
                                    </h3>
                                    <div className="space-y-2">
                                        {['ONLINE', 'IN_PERSON', 'BOTH'].map((mod) => (
                                            <label key={mod} className="flex items-center group cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="modality"
                                                    value={mod}
                                                    checked={modality === mod}
                                                    onChange={(e) => setModality(e.target.value)}
                                                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700 group-hover:text-teal-600">
                                                    {mod === 'ONLINE' && 'Online'}
                                                    {mod === 'IN_PERSON' && 'Presencial'}
                                                    {mod === 'BOTH' && 'Ambas'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="lg:col-span-9 mt-6 lg:mt-0">
                        {/* Barra de resultados */}
                        <div className="dashboard-panel p-4 mb-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {loading ? (
                                            'Buscando...'
                                        ) : (
                                            <>
                                                {professionals.length} profesionales encontrados
                                                {meta.totalWithCoverage > 0 &&
                                                    meta.totalWithCoverage !== professionals.length && (
                                                        <span className="text-sm text-gray-600 ml-2">
                                                            ({meta.totalWithCoverage} con tu cobertura)
                                                        </span>
                                                    )}
                                            </>
                                        )}
                                    </p>
                                    {selectedSpecialties.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedSpecialties.map((specialty) => (
                                                <span
                                                    key={specialty}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                                                >
                                                    {specialty}
                                                    <button
                                                        onClick={() => toggleSpecialty(specialty)}
                                                        className="hover:text-teal-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Ordenar */}
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
                                    <option>Mejor match</option>
                                    <option>Menor copago</option>
                                    <option>Mejor calificación</option>
                                    <option>Menor precio</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid de profesionales */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="dashboard-panel p-5 animate-pulse"
                                    >
                                        <div className="h-16 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : professionals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {professionals.map((prof: any) => (
                                    <ProfessionalCardWithCoverage key={prof.id} professional={prof} />
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-panel p-10 text-center">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    No encontramos profesionales
                                </h3>
                                <p className="text-gray-600">
                                    Intenta ajustar tus filtros para ver más resultados
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
