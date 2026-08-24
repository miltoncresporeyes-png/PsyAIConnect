'use client'

import { useState, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
    const t = useTranslations('faq')
    const professionalFAQData = t.raw('professional') as FAQItem[]
    return (
        <section id="faq" className="py-16 md:py-20 bg-slate-50">
            <div className="container-wide">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="text-primary-900 font-semibold text-sm uppercase tracking-wider mb-3 block">
                            {t('sectionLabel')}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            {t('heading')}
                        </h2>
                        <p className="text-lg text-gray-600">
                            {t('subheadingPro')}
                        </p>
                    </div>

                    {/* Accordion */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
                        <FAQAccordion items={professionalFAQData} />
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-10 text-center">
                        <p className="text-gray-600 mb-4">
                            {t('moreQuestions')}
                        </p>
                        <a
                            href="mailto:profesionales@psydoctor.cl"
                            className="text-primary-700 font-medium hover:text-primary-800 hover:underline transition-colors"
                        >
                            {t('contactEmail')}
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
    const t = useTranslations('faq')
    const patientFAQData = t.raw('patient') as FAQItem[]
    return (
        <section id="faq-pacientes" className="section bg-gradient-to-b from-white to-primary-50/30">
            <div className="container-wide">
                <div className="max-w-3xl mx-auto">
                    {/* Header - Warm and welcoming */}
                    <div className="text-center mb-12">
                        <span className="text-primary-700 font-medium text-sm uppercase tracking-wider mb-3 block">
                            {t('sectionLabel')}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            {t('headingPatient')}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            {t('subheadingPatient')}
                        </p>
                    </div>

                    {/* Accordion with calming styling */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                        <FAQAccordion items={patientFAQData} />
                    </div>

                    {/* Supportive CTA */}
                    <div className="mt-10 text-center">
                        <p className="text-gray-600 mb-4">
                            {t('readyToSearch')}
                        </p>
                        <a
                            href="/registro?tipo=paciente"
                            className="inline-flex items-center gap-2 text-primary-700 font-medium hover:text-primary-800 transition-colors"
                        >
                            {t('startSearch')}
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
    const t = useTranslations('faq')
    const patientFAQData = t.raw('patient') as FAQItem[]
    const professionalFAQData = t.raw('professional') as FAQItem[]

    const tabs = [
        { id: 'patients' as TabType, label: t('tabPatients') },
        { id: 'professionals' as TabType, label: t('tabProfessionals') },
    ]

    return (
        <div className="max-w-3xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 bg-[#e0f7f7] text-[#008080] hover:bg-[#b2ebeb] border-none cursor-pointer"
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
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
                        <p className="text-gray-600 mb-3">{t('readyToSearch')}</p>
                        <a
                            href="/registro?tipo=paciente"
                            className="text-primary-700 font-medium hover:text-primary-800 hover:underline transition-colors"
                        >
                            {t('startSearch')}
                        </a>
                    </>
                ) : (
                    <>
                        <p className="text-gray-600 mb-3">{t('joinPsyConnect')}</p>
                        <a
                            href="/registro?tipo=profesional"
                            className="text-primary-700 font-medium hover:text-primary-800 hover:underline transition-colors"
                        >
                            {t('createProfile')}
                        </a>
                    </>
                )}
            </div>
        </div>
    )
}

export default FAQSection
