'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Check, Users } from 'lucide-react'
import { PatientWaitlistModal } from '@/components/waitlist/PatientWaitlistModal'

export function CTASection() {
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

    return (
        <section 
            className="relative overflow-hidden bg-[linear-gradient(135deg,_#0d3d36_0%,_#0f766e_50%,_#134e4a_100%)] py-16 md:py-20"
            aria-labelledby="cta-heading"
        >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
                <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-400/8 blur-3xl" />
            </div>

            <div className="container-wide">
                <div className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-white/[0.07] p-7 text-center shadow-[0_34px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-10">
                    <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50">
                        Plataforma de salud mental creada para Chile
                    </div>

                    <h2 id="cta-heading" className="mx-auto max-w-3xl text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                        Da el primer paso hacia tu bienestar, con certeza y transparencia
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/78 md:text-xl">
                        Acceso a psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud, precios claros y boleta para reembolso según tu plan de Isapre o seguro.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3" role="list">
                        <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90" role="listitem">
                            Inscritos en el Registro de la Superintendencia de Salud
                        </div>
                        <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90" role="listitem">
                            Boleta para reembolso Isapre
                        </div>
                        <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90" role="listitem">
                            Tus datos protegidos por ley
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                        <button 
                            type="button"
                            onClick={() => setIsWaitlistOpen(true)} 
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-semibold text-slate-900 transition-all shadow-lg hover:-translate-y-0.5 hover:bg-slate-100 cursor-pointer"
                        >
                            <span>Avísame cuando abran</span>
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <Link 
                            href="/registro?tipo=profesional" 
                            className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-8 py-4 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                        >
                            Soy profesional
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-teal-950/30 p-5">
                            <div className="mb-3 flex items-center gap-2 text-white">
                                <Check className="w-5 h-5 text-emerald-300" aria-hidden="true" />
                                <span className="text-sm font-semibold">Para pacientes</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/75">
                                Encuentra al profesional indicado según tu motivo de consulta, reserva online y mantén el control ético de tu ficha.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-teal-950/30 p-5">
                            <div className="mb-3 flex items-center gap-2 text-white">
                                <Shield className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                                <span className="text-sm font-semibold">Privacidad</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/75">
                                Diseñada considerando la normativa chilena de protección de datos y derechos del paciente. Cifrado en tránsito (TLS) y en reposo (AES-256).
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-teal-950/30 p-5">
                            <div className="mb-3 flex items-center gap-2 text-white">
                                <Users className="w-5 h-5 text-teal-300" aria-hidden="true" />
                                <span className="text-sm font-semibold">Para profesionales</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/75">
                                Gestiona tu agenda, recibe pagos automáticos y enfócate en lo que importa: tus pacientes.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-8" role="list">
                        <div className="flex items-center gap-2" role="listitem">
                            <Check className="w-5 h-5 text-white" aria-hidden="true" />
                            <span className="text-sm text-white/90">Profesionales inscritos en el Registro de la Superintendencia de Salud</span>
                        </div>
                        <div className="flex items-center gap-2" role="listitem">
                            <Shield className="w-5 h-5 text-white" aria-hidden="true" />
                            <span className="text-sm text-white/90">Datos protegidos por ley</span>
                        </div>
                        <div className="flex items-center gap-2" role="listitem">
                            <Users className="w-5 h-5 text-white" aria-hidden="true" />
                            <span className="text-sm text-white/90">Sin cobros sorpresa</span>
                        </div>
                    </div>
                </div>
            </div>

            <PatientWaitlistModal
                isOpen={isWaitlistOpen}
                onClose={() => setIsWaitlistOpen(false)}
            />
        </section>
    )
}
