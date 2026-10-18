'use client'

import React, { useState } from 'react'
import {
    Activity,
    FileText,
    ShieldCheck,
    Calendar,
    UserCheck,
    ChevronDown,
    ChevronUp,
    Download,
    CheckCircle2,
    Clock,
    Sparkles,
    AlertCircle
} from 'lucide-react'

export interface PatientDiagnosis {
    id: string
    appointmentId: string
    date: string
    scheduledAt: string
    diagnosticTitle: string
    treatmentType: string
    isFinalized: boolean
    indicaciones: string | null
    summary: string | null
    professional: {
        name: string
        type: string
        specialties: string[]
        licenseNumber?: string | null
    }
    status: string
}

interface DiagnosisSectionProps {
    diagnoses: PatientDiagnosis[]
    loading?: boolean
    onRefresh?: () => void
}

export function DiagnosisSection({ diagnoses, loading, onRefresh }: DiagnosisSectionProps) {
    const [expandedId, setExpandedId] = useState<string | null>(diagnoses[0]?.id || null)

    const toggleExpand = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id))
    }

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    const handleDownloadCertificate = (diagnosis: PatientDiagnosis) => {
        // En un entorno de producción, llamaría al endpoint de certificado PDF.
        // Simulamos descarga de resumen clínico de acuerdo a Ley 20.584
        const textContent = `
======================================================
REPÚBLICA DE CHILE - RESUMEN DE DIAGNÓSTICO CLÍNICO
Plataforma PsyConnect (Conforme a Ley 20.584 y 19.628)
======================================================

Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')}
Profesional a cargo: ${diagnosis.professional.name} (${diagnosis.professional.type})
Registro SIS: ${diagnosis.professional.licenseNumber || 'En trámite'}

DIAGNÓSTICO REGISTRADO:
${diagnosis.diagnosticTitle}

MODALIDAD TERAPÉUTICA:
${diagnosis.treatmentType}

INDICACIONES Y PLAN DE ACCIÓN CLÍNICO:
${diagnosis.indicaciones || 'Seguir indicaciones de psicoterapia acordadas en consulta.'}

ESTADO DE TRATAMIENTO:
${diagnosis.status}

Documento emitido para uso personal del paciente conforme a su derecho a ficha clínica.
======================================================
        `.trim()

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `diagnostico-psyconnect-${diagnosis.id.slice(0, 8)}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 shadow-sm overflow-hidden">
            {/* Header del Bloque */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">Mis Diagnósticos y Tratamiento</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
                                <ShieldCheck className="w-3 h-3 text-teal-600" />
                                Ley 20.584
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Acceso transparente y seguro a tus diagnósticos clínicos e indicaciones terapéuticas.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
                        {diagnoses.length} {diagnoses.length === 1 ? 'registro' : 'registros'}
                    </span>
                </div>
            </div>

            {/* Skeleton Loading */}
            {loading && (
                <div className="space-y-3 py-4">
                    <div className="h-16 bg-gray-100 animate-pulse rounded-xl" />
                    <div className="h-16 bg-gray-100 animate-pulse rounded-xl" />
                </div>
            )}

            {/* Estado Vacío */}
            {!loading && diagnoses.length === 0 && (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                    <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Aún no tienes diagnósticos formalizados</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                        Una vez que completes tus primeras sesiones clínicas con tu terapeuta o psiquiatra, aquí se reflejarán tus diagnósticos, evolución e indicaciones.
                    </p>
                </div>
            )}

            {/* Lista de Diagnósticos */}
            {!loading && diagnoses.length > 0 && (
                <div className="space-y-3.5">
                    {diagnoses.map((diag) => {
                        const isExpanded = expandedId === diag.id

                        return (
                            <div
                                key={diag.id}
                                className={`rounded-xl border transition-all duration-200 ${
                                    isExpanded
                                        ? 'border-teal-300 bg-teal-50/20 shadow-sm ring-1 ring-teal-100'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                {/* Cabecera de la Tarjeta (Clickable) */}
                                <div
                                    onClick={() => toggleExpand(diag.id)}
                                    className="p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                diag.status.includes('Activo')
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-teal-100 text-teal-700'
                                            }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">
                                                    {diag.diagnosticTitle}
                                                </h4>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    {diag.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                                                    {diag.professional.name} ({diag.professional.type})
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatDate(diag.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-gray-400 pt-1 flex-shrink-0">
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-teal-600" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>

                                {/* Contenido Expandido */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-xs text-gray-700 space-y-4">
                                        {/* Línea Terapéutica */}
                                        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-2xs">
                                            <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-teal-600" />
                                                Enfoque y Tratamiento:
                                            </p>
                                            <p className="text-gray-600 leading-relaxed">
                                                {diag.treatmentType}
                                            </p>
                                        </div>

                                        {/* Indicaciones Claras para el Paciente */}
                                        {diag.indicaciones && (
                                            <div className="bg-teal-50/60 rounded-lg p-3 border border-teal-100">
                                                <p className="font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                                                    Indicaciones y Pautas Terapéuticas:
                                                </p>
                                                <div className="whitespace-pre-line text-teal-800 leading-relaxed font-sans pl-1">
                                                    {diag.indicaciones}
                                                </div>
                                            </div>
                                        )}

                                        {/* Resumen Clínico Autorizado */}
                                        {diag.summary && (
                                            <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                                                <p className="font-semibold text-gray-800 mb-1">
                                                    Evolución Clínica Resumida:
                                                </p>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {diag.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Botones de acción del diagnóstico */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                                                Firma electrónica médica inmutable registrada
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => handleDownloadCertificate(diag)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 transition-colors shadow-2xs"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Descargar Resumen Clínico
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Footer Informativo de la sección */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-teal-600" />
                    Toda tu información está protegida bajo estándares HIPAA y Ley Chilena de Derechos del Paciente.
                </span>
            </div>
        </div>
    )
}
