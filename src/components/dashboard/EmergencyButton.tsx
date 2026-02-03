'use client'

import { useState } from 'react'
import { AlertCircle, Phone, X } from 'lucide-react'

interface EmergencyButtonProps {
    position?: 'bottom-right' | 'bottom-left' | 'top-right'
}

export function EmergencyButton({ position = 'bottom-right' }: EmergencyButtonProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
    }

    return (
        <>
            {/* Emergency Button - Always Visible */}
            <div className={`fixed ${positionClasses[position]} z-50`}>
                {isExpanded ? (
                    // Expanded Card
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">¿Necesitas ayuda urgente?</h3>
                                    <p className="text-xs text-gray-600">Estamos aquí para ti</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Cerrar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Crisis Nacional (24/7) */}
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                <p className="text-sm font-semibold text-gray-900 mb-2">
                                    Salud Responde (24/7)
                                </p>
                                <a
                                    href="tel:600360777"
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span className="text-lg">600 360 7777</span>
                                </a>
                                <p className="text-xs text-gray-600 mt-1">
                                    Orientación en salud mental (gratuita)
                                </p>
                            </div>

                            {/* Prevención de Suicidio */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <p className="text-sm font-semibold text-gray-900 mb-2">
                                    Todo Mejora (LGBTIQ+)
                                </p>
                                <a
                                    href="tel:56950632777"
                                    className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-bold transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span className="text-lg">+56 9 5063 2777</span>
                                </a>
                                <p className="text-xs text-gray-600 mt-1">
                                    WhatsApp de apoyo emocional
                                </p>
                            </div>

                            {/* Urgencias generales */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm font-semibold text-gray-900 mb-2">
                                    Urgencias médicas
                                </p>
                                <a
                                    href="tel:131"
                                    className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-bold transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span className="text-lg">131 (SAMU)</span>
                                </a>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Si estás en crisis, no dudes en llamar. La ayuda existe.
                        </p>
                    </div>
                ) : (
                    // Compact Button
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="group bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        aria-label="Emergencia - Ver contactos de ayuda"
                    >
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" strokeWidth={2.5} />
                            <span className="hidden sm:inline text-sm font-semibold">Emergencia</span>
                        </div>
                    </button>
                )}
            </div>

            {/* Backdrop when expanded (optional) */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/10 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </>
    )
}
