import { Section, Container, Heading } from './ui'
import { Lock, FileText, Clock, CheckCircle } from 'lucide-react'

export function WaitlistWhyUsSection() {
    return (
        <Section variant="white" className="border-t border-bruma/50">
            <Container size="default">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-niebla text-pino border border-bruma mb-3 shadow-2xs">
                        Nuestra Propuesta
                    </span>
                    <Heading level={2} editorial className="mt-1">
                        Por qué elegir PsyDoctor
                    </Heading>
                    <p className="text-sm sm:text-base text-tinta/70 mt-3 max-w-xl mx-auto leading-relaxed">
                        Eliminamos las barreras administrativas para que te concentres exclusivamente en tu bienestar.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
                    {/* Item 1 */}
                    <div className="rounded-2xl border border-bruma bg-white p-6 sm:p-7 hover:border-pino/40 transition-colors duration-200">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-niebla border border-bruma flex items-center justify-center text-pino shrink-0">
                                <Lock className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <Heading level={4} className="text-base font-semibold text-tinta">
                                Privacidad y Secreto Médico
                            </Heading>
                        </div>
                        <p className="text-sm text-tinta/70 leading-relaxed pl-[3.25rem]">
                            Cumplimiento estricto de la Ley N° 20.584. Fichas clínicas cifradas con AES-256 en reposo y en tránsito donde solo tú y tu profesional acceden al contenido.
                        </p>
                    </div>

                    {/* Item 2 */}
                    <div className="rounded-2xl border border-bruma bg-white p-6 sm:p-7 hover:border-pino/40 transition-colors duration-200">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-niebla border border-bruma flex items-center justify-center text-pino shrink-0">
                                <FileText className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <Heading level={4} className="text-base font-semibold text-tinta">
                                Boleta y Reembolso Inmediato
                            </Heading>
                        </div>
                        <p className="text-sm text-tinta/70 leading-relaxed pl-[3.25rem]">
                            Emisión automática de boleta de honorarios electrónica para reembolso en tu Isapre o seguro complementario sin trámites manuales engorrosos.
                        </p>
                    </div>

                    {/* Item 3 */}
                    <div className="rounded-2xl border border-bruma bg-white p-6 sm:p-7 hover:border-pino/40 transition-colors duration-200">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-niebla border border-bruma flex items-center justify-center text-pino shrink-0">
                                <Clock className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <Heading level={4} className="text-base font-semibold text-tinta">
                                Avanzas a Tu Ritmo
                            </Heading>
                        </div>
                        <p className="text-sm text-tinta/70 leading-relaxed pl-[3.25rem]">
                            Elige con calma el momento que mejor se ajuste a tus horarios y confirma directamente desde tu celular.
                        </p>
                    </div>

                    {/* Item 4 */}
                    <div className="rounded-2xl border border-bruma bg-white p-6 sm:p-7 hover:border-pino/40 transition-colors duration-200">
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-niebla border border-bruma flex items-center justify-center text-pino shrink-0">
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <Heading level={4} className="text-base font-semibold text-tinta">
                                Precios Transparentes
                            </Heading>
                        </div>
                        <p className="text-sm text-tinta/70 leading-relaxed pl-[3.25rem]">
                            Valores claros por sesión desde el primer minuto. Conoce con anticipación tu costo real antes de confirmar cualquier hora.
                        </p>
                    </div>
                </div>
            </Container>
        </Section>
    )
}
