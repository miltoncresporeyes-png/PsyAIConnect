import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { UnifiedFAQSection } from '@/components/landing/FAQSection'
import { BackButton } from '@/components/ui/BackButton'

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes | PsyDoctor',
    description: 'Resolvemos las dudas más comunes de pacientes y profesionales de salud mental sobre PsyDoctor.',
}

export default function FAQPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen page-shell">
                <div className="page-frame">
                    <BackButton variant="chevron" className="mb-6" />

                    {/* Header */}
                    <div className="page-intro">
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-3">
                            Preguntas Frecuentes
                        </h1>
                        <p className="text-lg text-gray-600">
                            Resolvemos tus dudas sobre PsyDoctor
                        </p>
                    </div>

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
                                    href="mailto:hola@psydoctor.cl"
                                    className="btn bg-white text-primary-900 hover:bg-gray-100 px-6 py-3"
                                >
                                    Escríbenos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}
