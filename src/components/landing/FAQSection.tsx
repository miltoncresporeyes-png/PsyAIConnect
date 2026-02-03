'use client'

import { useState, useId } from 'react'
import { ChevronDown } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    items: FAQItem[]
    className?: string
}

interface FAQItemProps {
    item: FAQItem
    isOpen: boolean
    onToggle: () => void
    id: string
}

// ============================================================================
// FAQ Data (i18n-ready)
// ============================================================================

export const professionalFAQData: FAQItem[] = [
    {
        question: '¿Qué es PsyConnect y para quién está pensada?',
        answer: 'PsyConnect es una plataforma digital diseñada para profesionales de la salud mental que ejercen de forma independiente o en consulta privada. Facilita la gestión operativa sin interferir en el criterio clínico ni en la relación terapéutica.',
    },
    {
        question: '¿PsyConnect reemplaza mi consulta o forma de trabajo actual?',
        answer: 'No. PsyConnect complementa tu práctica. Tú decides cómo atender, a quién aceptar y qué información compartir.',
    },
    {
        question: '¿Cómo llegan los pacientes a mi perfil?',
        answer: 'Los pacientes pasan previamente por un proceso de orientación según síntomas y contexto. Esto permite que lleguen a tu perfil personas que buscan tu especialidad y enfoque, reduciendo desajustes y abandonos tempranos.',
    },
    {
        question: '¿Puedo rechazar o derivar pacientes?',
        answer: 'Sí. Mantienes control total sobre a quién atender. PsyConnect no obliga a aceptar pacientes ni condiciona tu práctica clínica.',
    },
    {
        question: '¿Qué tipo de información clínica se comparte?',
        answer: 'Solo información básica y resumida definida por el profesional y el paciente (por ejemplo: motivo de consulta, tratamientos previos relevantes). Nunca notas completas sin consentimiento.',
    },
    {
        question: '¿Qué pasa si un paciente cambia de profesional?',
        answer: 'Si el paciente lo decide, puede compartir un resumen de su proceso para evitar comenzar desde cero. Esto favorece la continuidad terapéutica y el cuidado ético del paciente.',
    },
    {
        question: '¿Cómo se protege la confidencialidad del paciente?',
        answer: 'PsyConnect cumple con estándares de privacidad y confidencialidad. Toda información clínica se gestiona con consentimiento informado y no se utiliza con fines comerciales ni publicitarios.',
    },
]

// ============================================================================
// FAQ Data for Patients (i18n-ready)
// ============================================================================

export const patientFAQData: FAQItem[] = [
    {
        question: '¿Qué es PsyConnect y cómo me puede ayudar?',
        answer: 'PsyConnect es una plataforma que te conecta con psicólogos y psiquiatras verificados en Chile. Nuestro objetivo es facilitar tu camino hacia el bienestar, ayudándote a encontrar al profesional adecuado para ti, a tu ritmo y sin presiones.',
    },
    {
        question: '¿Cómo sé que los profesionales son confiables?',
        answer: 'Todos los profesionales de PsyConnect pasan por un proceso de verificación que incluye validación de su título universitario y registro profesional. Solo trabajan en nuestra plataforma profesionales habilitados para ejercer en Chile.',
    },
    {
        question: '¿Mis conversaciones son privadas?',
        answer: 'Absolutamente. Tu privacidad es nuestra prioridad. Toda la información que compartas está protegida por secreto profesional y encriptación de datos. Ni PsyConnect ni terceros tienen acceso a tus conversaciones con tu profesional.',
    },
    {
        question: '¿Cuánto cuesta una consulta?',
        answer: 'Cada profesional define sus propios honorarios. Puedes ver el precio de cada sesión antes de agendar. Muchos profesionales ofrecen una primera sesión a precio reducido o gratuita para que puedas conocerlos.',
    },
    {
        question: '¿Qué pasa si siento que mi profesional no es el indicado para mí?',
        answer: 'Es completamente normal. La conexión con tu profesional es importante para tu proceso. En PsyConnect puedes cambiar de profesional cuando lo necesites, sin compromisos ni explicaciones. Tu bienestar es lo primero.',
    },
    {
        question: '¿Puedo tener sesiones online?',
        answer: 'Sí. Muchos profesionales ofrecen sesiones presenciales, online o ambas modalidades. Tú eliges lo que te resulte más cómodo. Las sesiones online son seguras y funcionan directamente desde la plataforma.',
    },
    {
        question: '¿Necesito tener un diagnóstico para buscar ayuda?',
        answer: 'No. No necesitas un diagnóstico ni saber exactamente qué te pasa. Puedes buscar apoyo simplemente porque sientes que lo necesitas, porque quieres entenderte mejor, o porque atraviesas un momento difícil. El profesional te ayudará a explorar lo que necesites.',
    },
]

// ============================================================================
// Components
// ============================================================================

/**
 * Individual FAQ Item with accordion behavior
 * Accessible: keyboard navigation, aria attributes
 */
function FAQItemComponent({ item, isOpen, onToggle, id }: FAQItemProps) {
    const questionId = `faq-question-${id}`
    const answerId = `faq-answer-${id}`

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onToggle()
                    }
                }}
                className="w-full flex items-center justify-between py-5 px-1 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg transition-colors"
            >
                <span className="text-base md:text-lg font-medium text-gray-900 pr-4 group-hover:text-primary-700 transition-colors">
                    {item.question}
                </span>
                <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-primary-100' : ''
                        }`}
                    aria-hidden="true"
                >
                    <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-primary-700' : 'text-gray-500 group-hover:text-primary-600'
                        }`} />
                </span>
            </button>

            <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="text-gray-600 leading-relaxed text-justify pl-1 pr-1">
                    {item.answer}
                </p>
            </div>
        </div>
    )
}

/**
 * FAQ Accordion Component
 * - Only one item open at a time
 * - Smooth animations
 * - Accessible (WCAG AA compliant)
 * - Mobile-first design
 */
export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const baseId = useId()

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className={`divide-gray-200 ${className}`}>
            {items.map((item, index) => (
                <FAQItemComponent
                    key={`${baseId}-${index}`}
                    item={item}
                    isOpen={openIndex === index}
                    onToggle={() => handleToggle(index)}
                    id={`${baseId}-${index}`}
                />
            ))}
        </div>
    )
}

// ============================================================================
// FAQ Section for Landing Page
// ============================================================================

export function FAQSection() {
    return (
        <section id="faq" className="section bg-white">
            <div className="container-wide">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="text-primary-900 font-semibold text-sm uppercase tracking-wider mb-3 block">
                            Preguntas frecuentes
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Resolvemos tus dudas
                        </h2>
                        <p className="text-lg text-gray-600">
                            Información importante para profesionales de salud mental
                        </p>
                    </div>

                    {/* Accordion */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                        <FAQAccordion items={professionalFAQData} />
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-10 text-center">
                        <p className="text-gray-600 mb-4">
                            ¿Tienes más preguntas?
                        </p>
                        <a
                            href="mailto:profesionales@psyconnect.cl"
                            className="text-primary-700 font-medium hover:text-primary-800 hover:underline transition-colors"
                        >
                            Escríbenos a profesionales@psyconnect.cl
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ============================================================================
// Patient FAQ Section (Warm, calming design for patients)
// ============================================================================

export function PatientFAQSection() {
    return (
        <section id="faq-pacientes" className="section bg-gradient-to-b from-white to-primary-50/30">
            <div className="container-wide">
                <div className="max-w-3xl mx-auto">
                    {/* Header - Warm and welcoming */}
                    <div className="text-center mb-12">
                        <span className="text-primary-700 font-medium text-sm uppercase tracking-wider mb-3 block">
                            Preguntas frecuentes
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            Estamos aquí para ayudarte
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Sabemos que dar el primer paso puede generar dudas.
                            Aquí respondemos las más comunes.
                        </p>
                    </div>

                    {/* Accordion with calming styling */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                        <FAQAccordion items={patientFAQData} />
                    </div>

                    {/* Supportive CTA */}
                    <div className="mt-10 text-center">
                        <p className="text-gray-600 mb-4">
                            ¿Listo para encontrar a tu profesional?
                        </p>
                        <a
                            href="/registro?tipo=paciente"
                            className="inline-flex items-center gap-2 text-primary-700 font-medium hover:text-primary-800 transition-colors"
                        >
                            Comienza tu búsqueda
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ============================================================================
// Unified FAQ Section with Tabs (Patients + Professionals)
// ============================================================================

type TabType = 'patients' | 'professionals'

export function UnifiedFAQSection() {
    const [activeTab, setActiveTab] = useState<TabType>('patients')

    const tabs = [
        { id: 'patients' as TabType, label: 'Para Pacientes', icon: '❤️' },
        { id: 'professionals' as TabType, label: 'Para Profesionales', icon: '🩺' },
    ]

    return (
        <div className="max-w-3xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-gray-100 rounded-xl p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-white text-primary-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                {activeTab === 'patients' ? (
                    <FAQAccordion items={patientFAQData} />
                ) : (
                    <FAQAccordion items={professionalFAQData} />
                )}
            </div>

            {/* Contextual CTA based on active tab */}
            <div className="mt-8 text-center">
                {activeTab === 'patients' ? (
                    <>
                        <p className="text-gray-600 mb-3">¿Listo para encontrar apoyo?</p>
                        <a
                            href="/registro?tipo=paciente"
                            className="text-primary-700 font-medium hover:text-primary-800 hover:underline transition-colors"
                        >
                            Comienza tu búsqueda →
                        </a>
                    </>
                ) : (
                    <>
                        <p className="text-gray-600 mb-3">¿Quieres unirte a PsyConnect?</p>
                        <a
                            href="/registro?tipo=profesional"
                            className="text-primary-700 font-medium hover:text-primary-800 hover:underline transition-colors"
                        >
                            Crear mi perfil profesional →
                        </a>
                    </>
                )}
            </div>
        </div>
    )
}

export default FAQSection
