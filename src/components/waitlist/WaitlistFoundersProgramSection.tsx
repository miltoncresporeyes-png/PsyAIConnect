import { landingConfig } from '@/config/landing.config'
import { Container, Heading } from './ui'
import { Award, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export function WaitlistFoundersProgramSection() {
    return (
        <section
            id="fundadores"
            className="w-full max-w-full overflow-hidden py-16 sm:py-24 bg-tinta text-white border-t border-tinta"
        >
            <Container size="default">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-white/10 text-bruma border border-white/15 mb-3">
                        Para Psicólogos y Psiquiatras
                    </span>
                    <Heading level={2} editorial className="text-white mt-1">
                        Programa de Profesionales Fundadores
                    </Heading>
                    <p className="text-sm sm:text-base text-slate-300 mt-3.5 leading-relaxed max-w-xl mx-auto">
                        Buscamos a los primeros profesionales de la salud mental que liderarán el estándar de atención digital en Chile.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Tarjeta 1 */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors duration-200">
                        <div>
                            <div className="h-10 w-10 rounded-xl bg-pino/30 text-bruma border border-pino/40 flex items-center justify-center mb-5">
                                <Award className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <Heading level={3} className="text-base sm:text-lg font-semibold text-white mb-2">
                                Comisión 0% de Lanzamiento
                            </Heading>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {landingConfig.beneficioFundadores !== 'PENDIENTE'
                                    ? landingConfig.beneficioFundadores
                                    : 'Accede a condiciones preferentes sin cobro de comisión durante los primeros meses para que impulses tu consulta online.'}
                            </p>
                        </div>
                    </div>

                    {/* Tarjeta 2 */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors duration-200">
                        <div>
                            <div className="h-10 w-10 rounded-xl bg-pino/30 text-bruma border border-pino/40 flex items-center justify-center mb-5">
                                <TrendingUp className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <Heading level={3} className="text-base sm:text-lg font-semibold text-white mb-2">
                                Flujo Continuo de Pacientes
                            </Heading>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Posicionamiento destacado en nuestro directorio clínico y asignación inteligente según especialidad y previsión.
                            </p>
                        </div>
                    </div>

                    {/* Tarjeta 3 */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-colors duration-200">
                        <div>
                            <div className="h-10 w-10 rounded-xl bg-pino/30 text-bruma border border-pino/40 flex items-center justify-center mb-5">
                                <Calendar className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <Heading level={3} className="text-base sm:text-lg font-semibold text-white mb-2">
                                ERP Clínico Incluido
                            </Heading>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Ficha clínica cifrada, gestión de pagos y recaudación automática de honorarios en una sola plataforma integrada.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="#lista-espera"
                        className="inline-flex items-center gap-2 rounded-xl bg-white text-tinta px-6 py-3.5 text-sm font-semibold hover:bg-niebla transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
                    >
                        Postular como Profesional Fundador
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            </Container>
        </section>
    )
}
