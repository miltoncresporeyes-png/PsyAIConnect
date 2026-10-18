import { Section, Container, Heading } from './ui'

export function WaitlistHowItWorksSection() {
    return (
        <Section id="como-funciona" variant="niebla" className="border-t border-bruma/60">
            <Container size="narrow">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-white text-pino border border-bruma mb-3 shadow-2xs">
                        Proceso Simple
                    </span>
                    <Heading level={2} editorial className="mt-1">
                        ¿Cómo funcionará PsyDoctor?
                    </Heading>
                    <p className="text-sm sm:text-base text-tinta/70 mt-3 max-w-xl mx-auto leading-relaxed">
                        Tres pasos transparentes para acceder a terapia psicológica o consulta psiquiátrica.
                    </p>
                </div>

                {/* Recorrido vertical continuo */}
                <div className="relative max-w-xl mx-auto">
                    {/* Línea vertical conectora continua */}
                    <div
                        className="absolute left-5 sm:left-6 top-6 bottom-8 w-px bg-bruma"
                        aria-hidden="true"
                    />

                    <div className="space-y-10 sm:space-y-12">
                        {/* Paso 1 */}
                        <div className="relative flex items-start gap-5 sm:gap-6 group">
                            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border-2 border-pino text-pino font-serif-warm font-bold text-sm sm:text-base shadow-xs transition-colors duration-200">
                                1
                            </div>
                            <div className="pt-1.5 flex-1">
                                <Heading level={3} className="text-lg sm:text-xl font-semibold mb-2">
                                    Encuentra a tu profesional
                                </Heading>
                                <p className="text-sm text-tinta/75 leading-relaxed max-w-prose">
                                    Filtra por motivo de consulta, enfoque terapéutico, previsión (Fonasa o Isapre) y disponibilidad horaria real.
                                </p>
                            </div>
                        </div>

                        {/* Paso 2 */}
                        <div className="relative flex items-start gap-5 sm:gap-6 group">
                            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border-2 border-pino text-pino font-serif-warm font-bold text-sm sm:text-base shadow-xs transition-colors duration-200">
                                2
                            </div>
                            <div className="pt-1.5 flex-1">
                                <Heading level={3} className="text-lg sm:text-xl font-semibold mb-2">
                                    Agenda y atiende online
                                </Heading>
                                <p className="text-sm text-tinta/75 leading-relaxed max-w-prose">
                                    Reserva tu sesión en minutos. Ingresa a una sala de videollamada cifrada y segura sin necesidad de descargar aplicaciones complejas.
                                </p>
                            </div>
                        </div>

                        {/* Paso 3 */}
                        <div className="relative flex items-start gap-5 sm:gap-6 group">
                            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white border-2 border-pino text-pino font-serif-warm font-bold text-sm sm:text-base shadow-xs transition-colors duration-200">
                                3
                            </div>
                            <div className="pt-1.5 flex-1">
                                <Heading level={3} className="text-lg sm:text-xl font-semibold mb-2">
                                    Reembolsa con tu boleta
                                </Heading>
                                <p className="text-sm text-tinta/75 leading-relaxed max-w-prose">
                                    Recibe tu boleta de honorarios electrónica oficial y el kit de reembolso médico listo para presentar en tu Isapre o seguro complementario.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    )
}
