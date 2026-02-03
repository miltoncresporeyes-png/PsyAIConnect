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
        } catch (error) {
            console.error('Error searching professionals:', error)
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
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Encuentra tu Profesional Ideal
                    </h1>
                    <p className="text-xl text-purple-100">
                        Filtra por tu cobertura de salud y ahorra en copago
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar de Filtros */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-4 space-y-6">
                            {/* Toggle de filtros en móvil */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden w-full flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md mb-4"
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
                                <div className="bg-white rounded-xl shadow-md p-6">
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
                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700 group-hover:text-purple-600">
                                                    {specialty}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Filtro de Modalidad */}
                                <div className="bg-white rounded-xl shadow-md p-6">
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
                                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700 group-hover:text-purple-600">
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
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                                                >
                                                    {specialty}
                                                    <button
                                                        onClick={() => toggleSpecialty(specialty)}
                                                        className="hover:text-purple-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Ordenar */}
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option>Mejor match</option>
                                    <option>Menor copago</option>
                                    <option>Mejor calificación</option>
                                    <option>Menor precio</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid de profesionales */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                                    >
                                        <div className="h-16 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : professionals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {professionals.map((prof: any) => (
                                    <ProfessionalCardWithCoverage key={prof.id} professional={prof} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
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
