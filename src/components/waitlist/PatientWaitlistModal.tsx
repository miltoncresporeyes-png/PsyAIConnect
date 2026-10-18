'use client'

import React from 'react'
import { X } from 'lucide-react'
import { PatientWaitlistForm } from './PatientWaitlistForm'

interface PatientWaitlistModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    subtitle?: string
}

export function PatientWaitlistModal({
    isOpen,
    onClose,
    title = 'Lista de espera de pacientes',
    subtitle = 'Déjanos tus datos y te avisaremos cuando haya disponibilidad en tu comuna.',
}: PatientWaitlistModalProps) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-modal-title"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all max-h-[90dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    aria-label="Cerrar modal"
                >
                    <X className="h-5 w-5" />
                </button>

                <PatientWaitlistForm
                    title={title}
                    subtitle={subtitle}
                    onSuccess={() => {
                        // Modal keeps success view visible for user feedback
                    }}
                />
            </div>
        </div>
    )
}
