'use client'

import { useState, useEffect } from 'react'
import { 
    Loader2, Pill, Stethoscope, Brain, BarChart3, 
    RefreshCw, TrendingUp, AlertCircle, Calendar 
} from 'lucide-react'

interface AnalyticsResults {
    summary: {
        total_mentions?: number
        unique_medications?: number
        notes_with_medications?: number
        unique_diagnoses?: number
        notes_with_diagnosis?: number
        total_sessions?: number
        unique_patterns?: number
    }
    top_medications?: [string, number][]
    medications_in_plan_section?: [string, number][]
    medications_by_section?: Record<string, [string, number][]>
    top_diagnoses?: [string, number][]
    diagnoses_in_analysis_section?: [string, number][]
    top_patterns?: [string, number][]
    total_sessions?: number
}

interface AnalyticsData {
    analysisType: string
    sampleSize: number
    generatedAt: string
    results: AnalyticsResults
}

export default function ClinicalAnalyticsDashboard() {
    const [loading, setLoading] = useState(true)
    const [running, setRunning] = useState(false)
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [analysisType, setAnalysisType] = useState<string>('medications')
    const [error, setError] = useState<string | null>(null)

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/analytics/clinical?type=${analysisType}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al cargar analytics')
            }

            setAnalytics(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    const runAnalysis = async () => {
        setRunning(true)
        setError(null)

        try {
            const response = await fetch('/api/analytics/clinical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: analysisType,
                    days: 90,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al ejecutar análisis')
            }

            await fetchAnalytics()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setRunning(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [analysisType])

    const analysisTypes = [
        { value: 'medications', label: 'Medicamentos', icon: Pill, color: 'text-blue-600' },
        { value: 'diagnoses', label: 'Diagnósticos', icon: Stethoscope, color: 'text-purple-600' },
        { value: 'patterns', label: 'Patrones', icon: Brain, color: 'text-emerald-600' },
        { value: 'outcomes', label: 'Resultados', icon: TrendingUp, color: 'text-orange-600' },
    ]

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )
        }

        if (!analytics || !analytics.results) {
            return (
                <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No hay análisis disponible</p>
                    <button
                        onClick={runAnalysis}
                        disabled={running}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {running ? 'Ejecutando...' : 'Ejecutar Análisis'}
                    </button>
                </div>
            )
        }

        const { results, sampleSize, generatedAt } = analytics

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Notas analizadas: {sampleSize}</span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(generatedAt).toLocaleDateString('es-CL')}
                    </span>
                </div>

                {analysisType === 'medications' && (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    {results.summary?.total_mentions || 0}
                                </div>
                                <div className="text-sm text-blue-700">Menciones totales</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {results.summary?.unique_medications || 0}
                                </div>
                                <div className="text-sm text-purple-700">Medicamentos únicos</div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {results.summary?.notes_with_medications || 0}
                                </div>
                                <div className="text-sm text-emerald-700">Notas con medicamentos</div>
                            </div>
                        </div>

                        {results.medications_in_plan_section && results.medications_in_plan_section.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                    Medicamentos más recetados (Sección P - Plan)
                                </h4>
                                <div className="space-y-2">
                                    {results.medications_in_plan_section.slice(0, 10).map(([med, count], idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{med}</span>
                                                    <span className="text-gray-500">{count} menciones</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(count / ((results.medications_in_plan_section?.[0]?.[1]) || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.medications_by_section && Object.entries(results.medications_by_section).length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Por sección SOAP</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(results.medications_by_section).map(([section, meds]) => (
                                        <div key={section} className="border rounded-lg p-3">
                                            <div className="font-medium text-gray-700 mb-2">Sección {section}</div>
                                            <div className="space-y-1">
                                                {(meds as [string, number][]).slice(0, 5).map(([med, count], idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{med}</span>
                                                        <span className="text-gray-500">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {analysisType === 'diagnoses' && (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {results.summary?.total_mentions || 0}
                                </div>
                                <div className="text-sm text-purple-700">Menciones totales</div>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-pink-600">
                                    {results.summary?.unique_diagnoses || 0}
                                </div>
                                <div className="text-sm text-pink-700">Diagnósticos únicos</div>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-indigo-600">
                                    {results.summary?.notes_with_diagnosis || 0}
                                </div>
                                <div className="text-sm text-indigo-700">Notas con diagnóstico</div>
                            </div>
                        </div>

                        {results.diagnoses_in_analysis_section && results.diagnoses_in_analysis_section.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                    Diagnósticos más comunes (Sección A - Análisis)
                                </h4>
                                <div className="space-y-2">
                                    {results.diagnoses_in_analysis_section.slice(0, 10).map(([diag, count], idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{diag}</span>
                                                    <span className="text-gray-500">{count} menciones</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{ width: `${(count / ((results.diagnoses_in_analysis_section?.[0]?.[1]) || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {analysisType === 'patterns' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {results.summary?.total_mentions || 0}
                                </div>
                                <div className="text-sm text-emerald-700">Menciones totales</div>
                            </div>
                            <div className="bg-teal-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-teal-600">
                                    {results.summary?.unique_patterns || 0}
                                </div>
                                <div className="text-sm text-teal-700">Patrones únicos</div>
                            </div>
                        </div>

                        {results.top_patterns && results.top_patterns.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                    Patrones de tratamiento más utilizados
                                </h4>
                                <div className="space-y-2">
                                    {results.top_patterns.slice(0, 10).map(([pattern, count], idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{pattern}</span>
                                                    <span className="text-gray-500">{count} menciones</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-emerald-600 h-2 rounded-full"
                                                        style={{ width: `${(count / ((results.top_patterns?.[0]?.[1]) || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {analysisType === 'outcomes' && results.total_sessions && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">
                            Sesiones analizadas: <strong>{results.total_sessions}</strong>
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Analytics de Notas Clínicas
                    </h2>
                    <button
                        onClick={runAnalysis}
                        disabled={running}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                        {running ? 'Ejecutando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex gap-2 mb-6">
                    {analysisTypes.map((type) => {
                        const Icon = type.icon
                        return (
                            <button
                                key={type.value}
                                onClick={() => setAnalysisType(type.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    analysisType === type.value
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${analysisType === type.value ? '' : type.color}`} />
                                {type.label}
                            </button>
                        )
                    })}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {renderContent()}
            </div>
        </div>
    )
}
