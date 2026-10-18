import { Metadata } from 'next'
import { getMessages } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { UnifiedFAQSection } from '@/components/landing/FAQSection'
import { BackButton } from '@/components/ui/BackButton'
import { PageContainer, PageHeader } from '@/components/layout/shell'

export const metadata: Metadata = {
    title: { absolute: 'Preguntas Frecuentes | PsyDoctor' },
    description:
        'Resolvemos las dudas más comunes de pacientes y profesionales de salud mental sobre PsyDoctor: aranceles, boleta para reembolso, privacidad y cómo agendar.',
    alternates: {
        canonical: '/faq',
    },
}

interface FaqItem {
    question: string
    answer: string
}

export default async function FAQPage() {
    // El esquema se genera desde el mismo contenido que renderiza la página
    // (pestaña "Para Pacientes", visible por defecto) para que el markup
    // estructurado coincida con el texto mostrado.
    const messages = await getMessages()
    const faq = (messages as Record<string, unknown>).faq as
        | { patient?: FaqItem[] }
        | undefined
    const patientFaq = faq?.patient ?? []

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: patientFaq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    }

    return (
        <>
            <Header />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <PageContainer variant="default" size="wide">
                <BackButton variant="chevron" className="mb-6" />

                <PageHeader
                    title="Preguntas Frecuentes"
                    description="Resolvemos tus dudas sobre PsyDoctor"
                    titleClassName="text-3xl md:text-4xl"
                />

                {/* Unified FAQ with tabs */}
                <div className="page-panel px-5 py-6 md:px-8 md:py-8">
                    <UnifiedFAQSection />
                </div>

                {/* Contact Section */}
                <div className="max-w-3xl mx-auto mt-10">
                    <div className="bg-primary-900 rounded-[28px] p-7 md:p-8 text-center text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                        <h2 className="text-2xl font-heading font-bold mb-4">
                            ¿Tienes más preguntas?
                        </h2>
                        <p className="text-white/80 mb-6">
                            Estamos aquí para ayudarte
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:contacto@psydoctor.cl"
                                className="btn bg-white text-primary-900 hover:bg-gray-100 px-6 py-3"
                            >
                                Escríbenos
                            </a>
                        </div>
                    </div>
                </div>
            </PageContainer>

            <Footer />
        </>
    )
}