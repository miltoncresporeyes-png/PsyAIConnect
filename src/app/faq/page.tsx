import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { UnifiedFAQSection } from '@/components/landing/FAQSection'

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes | PsyConnect',
    description: 'Resolvemos las dudas más comunes de pacientes y profesionales de salud mental sobre PsyConnect.',
}

export default function FAQPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-gradient-to-b from-secondary-50 to-white">
                <div className="container-wide py-12 md:py-16">
                    {/* Back link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-900 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio
                    </Link>

                    {/* Header */}
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
                            Preguntas Frecuentes
                        </h1>
                        <p className="text-lg text-gray-600">
                            Resolvemos tus dudas sobre PsyConnect
                        </p>
                    </div>

                    {/* Unified FAQ with tabs */}
                    <UnifiedFAQSection />

                    {/* Contact Section */}
                    <div className="max-w-3xl mx-auto mt-12">
                        <div className="bg-primary-900 rounded-2xl p-8 md:p-10 text-center text-white">
                            <h2 className="text-2xl font-heading font-bold mb-4">
                                ¿Tienes más preguntas?
                            </h2>
                            <p className="text-white/80 mb-6">
                                Estamos aquí para ayudarte
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:hola@psyconnect.cl"
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
