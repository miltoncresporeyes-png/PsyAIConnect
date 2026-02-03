'use client'

import { useState, useEffect } from 'react'

interface CoverageFilterProps {
    onCoverageChange: (coverage: CoverageData) => void
}

export interface CoverageData {
    healthSystem: 'FONASA' | 'ISAPRE' | 'PRIVATE' | 'NONE' | null
    isapreId?: string
    fonasaTramoId?: string
    hasBonoIMED?: boolean
    maxCopayment?: number
}

interface Isapre {
    id: string
    name: string
    code: string
}

interface FonasaTramo {
    id: string
    tramo: string
    name: string
}

export function CoverageFilter({ onCoverageChange }: CoverageFilterProps) {
    const [healthSystem, setHealthSystem] = useState<string>('')
    const [isapres, setIsapres] = useState<Isapre[]>([])
    const [fonasaTramos, setFonasaTramos] = useState<FonasaTramo[]>([])
    const [selectedIsapre, setSelectedIsapre] = useState('')
    const [selectedTramo, setSelectedTramo] = useState('')
    const [hasBonoIMED, setHasBonoIMED] = useState(false)
    const [maxCopayment, setMaxCopayment] = useState('')

    // Cargar Isapres y Fonasa al montar
    useEffect(() => {
        fetchIsapres()
        fetchFonasaTramos()
    }, [])

    // Notificar cambios
    useEffect(() => {
        const coverage: CoverageData = {
            healthSystem: healthSystem as any || null,
            isapreId: selectedIsapre || undefined,
            fonasaTramoId: selectedTramo || undefined,
            hasBonoIMED: hasBonoIMED,
            maxCopayment: maxCopayment ? parseInt(maxCopayment) : undefined,
        }
        onCoverageChange(coverage)
    }, [healthSystem, selectedIsapre, selectedTramo, hasBonoIMED, maxCopayment])

    const fetchIsapres = async () => {
        try {
            const response = await fetch('/api/coverage/isapres')
            if (response.ok) {
                const data = await response.json()
                setIsapres(data.isapres)
            }
        } catch (error) {
            console.error('Error fetching isapres:', error)
        }
    }

    const fetchFonasaTramos = async () => {
        try {
            const response = await fetch('/api/coverage/fonasa-tramos')
            if (response.ok) {
                const data = await response.json()
                setFonasaTramos(data.tramos)
            }
        } catch (error) {
            console.error('Error fetching fonasa tramos:', error)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    🏥 Filtrar por Cobertura de Salud
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Encuentra profesionales que acepten tu previsión y ahorra en copago
                </p>
            </div>

            {/* Selector de Sistema de Salud */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sistema de Salud
                </label>
                <select
                    value={healthSystem}
                    onChange={(e) => {
                        setHealthSystem(e.target.value)
                        setSelectedIsapre('')
                        setSelectedTramo('')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="">Selecciona tu previsión</option>
                    <option value="ISAPRE">Isapre</option>
                    <option value="FONASA">Fonasa</option>
                    <option value="PRIVATE">Particular (sin previsión)</option>
                </select>
            </div>

            {/* Selector de Isapre */}
            {healthSystem === 'ISAPRE' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tu Isapre
                        </label>
                        <select
                            value={selectedIsapre}
                            onChange={(e) => setSelectedIsapre(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Selecciona tu Isapre</option>
                            {isapres.map((isapre) => (
                                <option key={isapre.id} value={isapre.id}>
                                    {isapre.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="hasBonoIMED"
                            checked={hasBonoIMED}
                            onChange={(e) => setHasBonoIMED(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="hasBonoIMED" className="ml-2 text-sm text-gray-700">
                            Tengo Bono IMED disponible
                        </label>
                    </div>
                </div>
            )}

            {/* Selector de Fonasa */}
            {healthSystem === 'FONASA' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tramo Fonasa
                    </label>
                    <select
                        value={selectedTramo}
                        onChange={(e) => setSelectedTramo(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Selecciona tu tramo</option>
                        {fonasaTramos.map((tramo) => (
                            <option key={tramo.id} value={tramo.id}>
                                {tramo.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Copago Máximo */}
            {healthSystem && healthSystem !== 'PRIVATE' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copago Máximo (opcional)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="number"
                            value={maxCopayment}
                            onChange={(e) => setMaxCopayment(e.target.value)}
                            placeholder="Ej: 20000"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Solo mostrar profesionales con copago hasta este monto
                    </p>
                </div>
            )}

            {/* Resumen */}
            {healthSystem && (
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        <strong>Búsqueda activa:</strong>{' '}
                        {healthSystem === 'ISAPRE' && selectedIsapre && (
                            <>
                                {isapres.find((i) => i.id === selectedIsapre)?.name}
                                {hasBonoIMED && ' con Bono IMED'}
                            </>
                        )}
                        {healthSystem === 'FONASA' && selectedTramo && (
                            <>
                                {fonasaTramos.find((t) => t.id === selectedTramo)?.name}
                            </>
                        )}
                        {healthSystem === 'PRIVATE' && 'Pago particular'}
                    </p>
                </div>
            )}
        </div>
    )
}
