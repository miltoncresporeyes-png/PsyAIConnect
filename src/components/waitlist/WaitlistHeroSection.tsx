'use client'

import Link from 'next/link'
import { landingConfig } from '@/config/landing.config'
import { track } from '@/lib/track'
import { ArrowRight, ShieldCheck, HeartPulse, Clock, Sparkles } from 'lucide-react'
import { Section, Container, Heading, Button } from '@/components/waitlist/ui'

export function WaitlistHeroSection() {
    return (
        <Section variant="niebla" className="pt-10 pb-14 md:pt-16 md:pb-20 border-b border-bruma/60">
            <Container size="wide" className="text-center">
                
                {/* Badge sobrio */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-bruma bg-white px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-medium text-tinta shadow-2xs mb-6 max-w-full text-center">
                    <Sparkles className="h-3.5 w-3.5 text-pino" aria-hidden="true" />
                    <span>Lanzamiento Oficial Chile · Lista de Espera Abierta</span>
                </div>

                {/* Titular Editorial Calmo (Serif Cálido) con animación sutil respetando prefers-reduced-motion */}
                <Heading level={1} editorial className="max-w-3xl mx-auto text-tinta animate-fade-in motion-reduce:animate-none">
                    Salud mental accesible en Chile,{' '}
                    <span className="text-pino italic">
                        diseñada para conectar.
                    </span>
                </Heading>

                {/* Bajada con longitud de línea óptima (< 75 caracteres) */}
                <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-sansClean">
                    Estamos reuniendo a psicólogos y psiquiatras habilitados en la Superintendencia de Salud para ofrecer atención online transparente, con boleta para reembolso y sin barreras.
                </p>

                {/* CTAs con Ámbar solo en principal y foco visible */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                    <Button
                        variant="primary"
                        size="lg"
                        asAnchor
                        href="#lista-espera"
                        onClick={() => track('cta_paciente', { source: 'hero_primary' })}
                        className="w-full sm:w-auto"
                    >
                        Unirme a la lista de espera
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        asAnchor
                        href="#fundadores"
                        onClick={() => track('cta_profesional', { source: 'hero_secondary' })}
                        className="w-full sm:w-auto text-slate-700"
                    >
                        Soy profesional de la salud
                    </Button>
                </div>

                {/* Garantías clínicas sobrias */}
                <div className="mt-12 pt-8 border-t border-bruma/70 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                    <div className="flex items-start gap-3 p-2 rounded-xl transition-colors">
                        <div className="h-9 w-9 rounded-lg bg-white border border-bruma flex items-center justify-center text-pino shrink-0 shadow-2xs">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xs font-semibold text-tinta tracking-normal">Prestadores Inscritos</h2>
                            <p className="text-xs text-slate-600 mt-0.5 leading-normal">Inscripción en el Registro de la Superintendencia de Salud (SIS).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-xl transition-colors">
                        <div className="h-9 w-9 rounded-lg bg-white border border-bruma flex items-center justify-center text-pino shrink-0 shadow-2xs">
                            <HeartPulse className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xs font-semibold text-tinta tracking-normal">Boleta para Reembolso</h2>
                            <p className="text-xs text-slate-600 mt-0.5 leading-normal">Boleta de honorarios para reembolso en Isapres y seguros complementarios.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-xl transition-colors">
                        <div className="h-9 w-9 rounded-lg bg-white border border-bruma flex items-center justify-center text-pino shrink-0 shadow-2xs">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xs font-semibold text-tinta tracking-normal">Acceso Prioritario</h2>
                            <p className="text-xs text-slate-600 mt-0.5 leading-normal">Accede a los primeros cupos y condiciones especiales de apertura.</p>
                        </div>
                    </div>
                </div>

            </Container>
        </Section>
    )
}
