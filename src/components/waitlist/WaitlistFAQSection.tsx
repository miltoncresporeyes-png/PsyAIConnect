'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Section, Container, Heading } from './ui'

interface FAQItem {
    question: string
    answer: string
}

const FAQS: FAQItem[] = [
    {
        question: '¿Cuándo estará disponible la atención en PsyDoctor?',
        answer: 'Estamos actualmente en proceso de registro de los primeros profesionales fundadores. Quienes se inscriban en esta lista de espera recibirán acceso anticipado prioritario y notificaciones escalonadas antes del lanzamiento abierto.',
    },
    {
        question: '¿Cómo funciona la cobertura y reembolso (Isapres, seguros y Fonasa)?',
        answer: 'Los profesionales emiten boleta electrónica de honorarios para que reembolses en tu Isapre o seguro de salud complementario. En Fonasa, la cobertura aplica mediante bono según los profesionales inscritos en Modalidad Libre Elección (MLE) con convenio vigente.',
    },
    {
        question: '¿Tiene algún costo inscribirse en la lista de espera?',
        answer: 'No, la inscripción en la lista de espera es 100% gratuita y sin compromiso. Te permitirá asegurar cupos y acceder a los beneficios de lanzamiento.',
    },
    {
        question: 'Soy psicólogo/a o psiquiatra, ¿qué requisitos debo cumplir?',
        answer: 'Para formar parte de la red de profesionales, es indispensable contar con título universitario reconocido en Chile y estar registrado en el Registro Nacional de Prestadores Individuales de la Superintendencia de Salud.',
    },
    {
        question: '¿Qué hago si tengo una emergencia de salud mental ahora?',
        answer: 'PsyDoctor es una plataforma de atención ambulatoria programada y no constituye un servicio de urgencias médicas. Si estás en crisis o necesitas apoyo inmediato, llama de inmediato al Fono Salud Responde (600 360 7777), a la línea de prevención del suicidio *4141 o acude al centro de urgencia más cercano (SAMU 131).',
    },
]

export function WaitlistFAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <Section id="faq" variant="niebla" className="border-t border-bruma/50">
            <Container size="narrow">
                <div className="text-center mb-12">
                    <Heading level={2} editorial className="mt-1">
                        Preguntas Frecuentes
                    </Heading>
                    <p className="text-sm sm:text-base text-tinta/70 mt-3 max-w-xl mx-auto leading-relaxed">
                        Todo lo que necesitas saber sobre el lanzamiento y la lista de espera de PsyDoctor.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index
                        return (
                            <div
                                key={faq.question}
                                className="rounded-2xl border border-bruma bg-white transition-all overflow-hidden shadow-2xs"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${index}`}
                                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-tinta focus:outline-none focus-visible:ring-2 focus-visible:ring-pino focus-visible:ring-inset"
                                >
                                    <span className="pr-4">{faq.question}</span>
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 text-tinta/40 transition-transform duration-200 ${
                                            isOpen ? 'rotate-180 text-pino' : ''
                                        }`}
                                        aria-hidden="true"
                                    />
                                </button>
                                {isOpen && (
                                    <div
                                        id={`faq-answer-${index}`}
                                        className="px-5 pb-5 pt-3 text-sm text-tinta/75 leading-relaxed border-t border-bruma/30"
                                    >
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Container>
        </Section>
    )
}
