'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Award, Sparkles, UserCheck, MessageSquare, ArrowRight, UserPlus, MapPin } from 'lucide-react'
import { PatientWaitlistModal } from '@/components/waitlist/PatientWaitlistModal'

const FOUNDER_BENEFITS = [
    {
        icon: Award,
        title: 'Plan gratuito de por vida',
        description: 'Beneficio exclusivo y vitalicio para los primeros 20 profesionales fundadores.',
    },
    {
        icon: Sparkles,
        title: 'Perfil destacado en lanzamiento',
        description: 'Máxima visibilidad ante pacientes que busquen tu especialidad en las primeras semanas.',
    },
    {
        icon: UserCheck,
        title: 'Sin comisión por tus pacientes',
        description: 'Cero comisión por las citas de pacientes que tú mismo traigas a la plataforma.',
    },
    {
        icon: MessageSquare,
        title: 'Contacto directo con el equipo',
        description: 'Canal prioritario con fundadores para pedir mejoras y ajustar herramientas a tu consulta.',
    },
]

export function FoundersSection() {
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)

    return (
        <section
            id="fundadores"
            className="relative overflow-hidden bg-slate-50/70 py-16 md:py-24 border-t border-slate-200/60"
            aria-labelledby="founders-heading"
        >
            <div className="container-wide">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/90 px-3.5 py-1 text-xs font-semibold text-teal-800 shadow-2xs mb-4">
                        <Sparkles className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                        <span>Convocatoria inicial</span>
                    </div>

                    <h2
                        id="founders-heading"
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight"
                    >
                        Estamos formando nuestra red inicial de profesionales
                    </h2>

                    <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#374151] max-w-2xl mx-auto">
                        Si eres psicólogo o psiquiatra inscrito en el Registro de la Superintendencia de Salud, únete como Profesional Fundador. Todavía no hay pacientes en la plataforma: estás ayudando a construirla desde el inicio.
                    </p>
                </div>

                {/* Grid of 4 Founder Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                    {FOUNDER_BENEFITS.map((benefit, index) => {
                        const Icon = benefit.icon
                        return (
                            <div
                                key={benefit.title}
                                className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-teal-300 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800 mb-4 border border-teal-100">
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                                    Beneficio 0{index + 1}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Primary Founder CTA & Secondary Patient Card */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-stretch max-w-5xl mx-auto">
                    {/* Primary Founder Card */}
                    <div className="rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-7 sm:p-9 text-white shadow-xl flex flex-col justify-between">
                        <div>
                            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-200 mb-3">
                                Red de Fundadores
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">
                                ¿Quieres liderar el cambio en salud mental en Chile?
                            </h3>
                            <p className="text-sm text-teal-100/85 leading-relaxed">
                                Participa en la fase cero con condiciones preferenciales permanentes. Solo necesitas tu inscripción oficial en la Superintendencia de Salud.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
                            <Link
                                href="/registro?tipo=profesional"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-teal-50"
                            >
                                <UserPlus className="h-4 w-4 text-teal-800" aria-hidden="true" />
                                <span>Quiero ser Profesional Fundador</span>
                            </Link>
                            <span className="text-xs text-teal-200/80">
                                Sin costo de incorporación.
                            </span>
                        </div>
                    </div>

                    {/* Secondary Patient Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 mb-3 border border-teal-100">
                                <MapPin className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                ¿Eres paciente?
                            </h3>
                            <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
                                Estamos convocando a profesionales en tu zona. Deja tus datos para avisarte apenas abramos disponibilidad.
                            </p>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsPatientModalOpen(true)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-teal-700 bg-teal-50/60 px-5 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-100/70 transition"
                            >
                                <span>Avísame cuando abran en mi comuna</span>
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PatientWaitlistModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
            />
        </section>
    )
}
