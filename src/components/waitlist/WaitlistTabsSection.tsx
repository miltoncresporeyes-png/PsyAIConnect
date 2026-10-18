'use client'

import { useState } from 'react'
import { PatientWaitlistForm } from './PatientWaitlistForm'
import { ProfessionalWaitlistForm } from './ProfessionalWaitlistForm'
import { UserCheck, Stethoscope } from 'lucide-react'
import { Section, Container, Heading } from './ui'

export function WaitlistTabsSection() {
    const [activeTab, setActiveTab] = useState<'patient' | 'professional'>('patient')

    return (
        <Section id="lista-espera" variant="white" className="border-t border-bruma/50">
            <Container size="narrow">
                <div className="text-center mb-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-niebla text-pino border border-bruma mb-3 shadow-2xs">
                        Acceso Prioritario
                    </span>
                    <Heading level={2} editorial className="mt-1">
                        Únete al lanzamiento de PsyDoctor
                    </Heading>
                    <p className="text-sm sm:text-base text-tinta/70 mt-3 max-w-xl mx-auto leading-relaxed">
                        Selecciona tu perfil para reservar tu lugar o postular como profesional fundador.
                    </p>
                </div>

                {/* Tabs Accessible */}
                <div
                    className="flex rounded-2xl bg-niebla p-1.5 border border-bruma shadow-xs mb-8 max-w-md mx-auto"
                    role="tablist"
                >
                    <button
                        role="tab"
                        id="tab-paciente"
                        aria-selected={activeTab === 'patient'}
                        aria-controls="panel-paciente"
                        onClick={() => setActiveTab('patient')}
                        className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pino ${
                            activeTab === 'patient'
                                ? 'bg-pino text-white shadow-sm'
                                : 'text-tinta/70 hover:text-tinta hover:bg-white/60'
                        }`}
                    >
                        <UserCheck className="h-4 w-4" aria-hidden="true" />
                        Soy Paciente
                    </button>
                    <button
                        role="tab"
                        id="tab-profesional"
                        aria-selected={activeTab === 'professional'}
                        aria-controls="panel-profesional"
                        onClick={() => setActiveTab('professional')}
                        className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pino ${
                            activeTab === 'professional'
                                ? 'bg-pino text-white shadow-sm'
                                : 'text-tinta/70 hover:text-tinta hover:bg-white/60'
                        }`}
                    >
                        <Stethoscope className="h-4 w-4" aria-hidden="true" />
                        Soy Profesional
                    </button>
                </div>

                {/* Tab Panels */}
                <div className="rounded-3xl border border-bruma bg-white p-6 sm:p-9 shadow-sm">
                    {activeTab === 'patient' && (
                        <div id="panel-paciente" role="tabpanel" aria-labelledby="tab-paciente">
                            <Heading level={3} className="text-xl font-semibold text-tinta mb-1">
                                Inscripción de Paciente
                            </Heading>
                            <p className="text-xs sm:text-sm text-tinta/60 mb-6">
                                Te notificaremos de forma prioritaria con beneficios en tu primera sesión.
                            </p>
                            <PatientWaitlistForm />
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div id="panel-profesional" role="tabpanel" aria-labelledby="tab-profesional">
                            <Heading level={3} className="text-xl font-semibold text-tinta mb-1">
                                Postulación al Programa Fundadores
                            </Heading>
                            <p className="text-xs sm:text-sm text-tinta/60 mb-6">
                                Cupos limitados para psicólogos y psiquiatras con registro en la Superintendencia de Salud.
                            </p>
                            <ProfessionalWaitlistForm />
                        </div>
                    )}
                </div>
            </Container>
        </Section>
    )
}
