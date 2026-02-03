/**
 * Isapre Guide Component
 * 
 * Displays step-by-step instructions for submitting reimbursement
 * to a specific Isapre
 */

'use client'

import { useState } from 'react'
import { Globe, Smartphone, MapPin, Phone, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import type { IsapreGuide as IsapreGuideType } from '@/lib/isapreGuides'

interface IsapreGuideProps {
    guide: IsapreGuideType
    onMarkAsSubmitted?: () => void
}

export default function IsapreGuide({ guide, onMarkAsSubmitted }: IsapreGuideProps) {
    const [activeTab, setActiveTab] = useState<'web' | 'app' | 'inPerson'>('web')

    const getRequirementBadge = (requirement: boolean | 'required' | 'recommended' | 'optional') => {
        if (requirement === true || requirement === 'required') {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Obligatorio</span>
        }
        if (requirement === 'recommended') {
            return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">Recomendado</span>
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">Opcional</span>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{guide.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{guide.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <a
                            href={guide.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1"
                        >
                            Portal Web
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Cobertura típica</p>
                        <p className="font-semibold text-gray-900">{guide.coverageRange}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tiempo de respuesta</p>
                        <p className="font-semibold text-gray-900">{guide.responseTime}</p>
                    </div>
                </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Requisitos
                </h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Boleta de honorarios electrónica</span>
                        {getRequirementBadge(guide.requirements.invoice)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Derivación o interconsulta médica</span>
                        {getRequirementBadge(guide.requirements.medicalReferral)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Certificado de asistencia</span>
                        {getRequirementBadge(guide.requirements.attendanceCertificate)}
                    </div>
                </div>

                {guide.requirements.medicalReferral === 'required' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-900">Derivación médica obligatoria</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Sin una orden médica, tu solicitud será rechazada. Asegúrate de tenerla antes de continuar.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Method Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        {guide.steps.web && (
                            <button
                                onClick={() => setActiveTab('web')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'web'
                                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Globe className="w-5 h-5 mx-auto mb-1" />
                                Portal Web
                            </button>
                        )}
                        {guide.steps.app && (
                            <button
                                onClick={() => setActiveTab('app')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'app'
                                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Smartphone className="w-5 h-5 mx-auto mb-1" />
                                App Móvil
                            </button>
                        )}
                        {guide.steps.inPerson && (
                            <button
                                onClick={() => setActiveTab('inPerson')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'inPerson'
                                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <MapPin className="w-5 h-5 mx-auto mb-1" />
                                Presencial
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'web' && guide.steps.web && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Pasos para solicitar por Portal Web:</h4>
                            {guide.steps.web.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-700 pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'app' && guide.steps.app && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Pasos para solicitar por App Móvil:</h4>
                            {guide.steps.app.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-700 pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'inPerson' && guide.steps.inPerson && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Pasos para solicitar en Sucursal:</h4>
                            {guide.steps.inPerson.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-700 pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tips */}
            {guide.tips && guide.tips.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-3">💡 Consejos útiles:</h3>
                    <ul className="space-y-2">
                        {guide.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-blue-800 flex gap-2">
                                <span className="text-blue-600">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Codes */}
            {guide.codes && (
                <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Código de prestación:</h3>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-mono text-lg font-bold text-gray-900">
                            {guide.codes.prestacion}
                        </div>
                        <div className="text-sm text-gray-600">
                            {guide.codes.description}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Button */}
            {onMarkAsSubmitted && (
                <div className="flex gap-3">
                    <button
                        onClick={onMarkAsSubmitted}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        Marcar como Tramitado
                    </button>
                </div>
            )}
        </div>
    )
}
