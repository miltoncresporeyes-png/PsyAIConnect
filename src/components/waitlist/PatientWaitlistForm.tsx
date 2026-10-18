'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { CHILE_REGIONS } from '@/constants/chile-data'

interface PatientWaitlistFormProps {
    className?: string
    onSuccess?: () => void
    title?: string
    subtitle?: string
    compact?: boolean
}

export function PatientWaitlistForm({
    className = '',
    onSuccess,
    title = 'Lista de espera de pacientes',
    subtitle = 'Déjanos tus datos y te avisaremos cuando abramos disponibilidad en tu zona.',
    compact = false,
}: PatientWaitlistFormProps) {
    const [email, setEmail] = useState('')
    const [comuna, setComuna] = useState('')
    const [careType, setCareType] = useState<'psicologia' | 'psiquiatria' | 'no_estoy_seguro'>('psicologia')
    const [modality, setModality] = useState<'online' | 'presencial' | 'ambas'>('online')
    const [consent, setConsent] = useState(false)
    const [honeypot, setHoneypot] = useState('')
    const [renderedAt] = useState(() => Date.now())

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    // Flatten Chilean comunas for quick selection / autocomplete
    const allComunas = React.useMemo(() => {
        const set = new Set<string>()
        CHILE_REGIONS.forEach((r) => {
            r.comunas.forEach((c) => set.add(`${c} (${r.nombre})`))
        })
        return Array.from(set).sort()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        if (!email.trim()) {
            setErrorMessage('Ingresa tu correo electrónico.')
            return
        }

        if (!comuna.trim()) {
            setErrorMessage('Indica tu comuna o región.')
            return
        }

        if (!consent) {
            setErrorMessage('Debes aceptar la Política de Privacidad para continuar.')
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch('/api/waitlist/patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    comuna: comuna.trim(),
                    careType,
                    modality,
                    consentAccepted: true,
                    consentVersion: '2.0',
                    website: honeypot,
                    renderedAt,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setErrorMessage(data.error || 'Ocurrió un error. Por favor intenta más tarde.')
                setIsSubmitting(false)
                return
            }

            setIsSuccess(true)
            setSuccessMessage(data.message || 'Gracias. Te avisaremos cuando haya profesionales disponibles en tu zona.')
            if (onSuccess) onSuccess()
        } catch {
            setErrorMessage('Error de conexión. Intenta nuevamente en unos instantes.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className={`rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8 text-center text-slate-800 ${className}`}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-2">¡Solicitud recibida!</h3>
                <p className="text-sm text-emerald-900 leading-relaxed max-w-md mx-auto">
                    {successMessage}
                </p>
                <p className="mt-4 text-xs text-emerald-700">
                    Tus datos están protegidos bajo la ley chilena y no serán compartidos con terceros.
                </p>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm text-left ${className}`}
        >
            {!compact && (
                <div className="mb-5">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/80 px-3 py-1 text-xs font-semibold text-teal-800 mb-2">
                        <Sparkles className="h-3 w-3 text-teal-600" aria-hidden="true" />
                        <span>Pre-lanzamiento exclusivo</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
                    <p className="text-xs sm:text-sm text-[#374151] mt-1">{subtitle}</p>
                </div>
            )}

            {/* Honeypot anti-bot */}
            <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
            />

            <div className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="patient-waitlist-email" className="block text-xs font-semibold text-slate-700 mb-1">
                        Correo electrónico <span className="text-rose-600">*</span>
                    </label>
                    <input
                        id="patient-waitlist-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.cl"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
                    />
                </div>

                {/* Comuna o región */}
                <div>
                    <label htmlFor="patient-waitlist-comuna" className="block text-xs font-semibold text-slate-700 mb-1">
                        Comuna o región <span className="text-rose-600">*</span>
                    </label>
                    <input
                        id="patient-waitlist-comuna"
                        type="text"
                        list="comunas-list"
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        placeholder="Ej: Providencia, Concepción, Temuco..."
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
                    />
                    <datalist id="comunas-list">
                        {allComunas.slice(0, 80).map((c) => (
                            <option key={c} value={c} />
                        ))}
                    </datalist>
                </div>

                {/* Tipo de atención */}
                <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Tipo de atención buscada
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                            { id: 'psicologia', label: 'Psicología' },
                            { id: 'psiquiatria', label: 'Psiquiatría' },
                            { id: 'no_estoy_seguro', label: 'No estoy seguro/a' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setCareType(item.id as any)}
                                className={`rounded-xl border px-3 py-2 text-xs font-medium transition text-center ${
                                    careType === item.id
                                        ? 'border-teal-700 bg-teal-50/90 text-teal-900 font-semibold shadow-2xs'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modalidad */}
                <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Modalidad preferida
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'online', label: 'Online' },
                            { id: 'presencial', label: 'Presencial' },
                            { id: 'ambas', label: 'Ambas' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setModality(item.id as any)}
                                className={`rounded-xl border px-3 py-2 text-xs font-medium transition text-center ${
                                    modality === item.id
                                        ? 'border-teal-700 bg-teal-50/90 text-teal-900 font-semibold shadow-2xs'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Consent checkbox */}
                <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                            required
                        />
                        <span className="text-xs text-[#374151] leading-relaxed">
                            Acepto que PsyDoctor use mis datos para avisarme del lanzamiento, según la{' '}
                            <Link href="/privacidad" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                                Política de Privacidad
                            </Link>
                            .
                        </span>
                    </label>
                </div>

                {errorMessage && (
                    <div
                        role="alert"
                        className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        <span>Avísame cuando abran</span>
                    )}
                </button>
            </div>
        </form>
    )
}
