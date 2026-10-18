import type { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import { PendingConfigBanner } from '@/components/waitlist/PendingConfigBanner'
import { WaitlistHeroSection } from '@/components/waitlist/WaitlistHeroSection'
import { WaitlistHowItWorksSection } from '@/components/waitlist/WaitlistHowItWorksSection'
import { WaitlistWhyUsSection } from '@/components/waitlist/WaitlistWhyUsSection'
import { WaitlistFoundersProgramSection } from '@/components/waitlist/WaitlistFoundersProgramSection'
import { WaitlistFAQSection } from '@/components/waitlist/WaitlistFAQSection'
import { WaitlistTabsSection } from '@/components/waitlist/WaitlistTabsSection'
import { FloatingWhatsAppButton } from '@/components/waitlist/FloatingWhatsAppButton'

export const metadata: Metadata = {
    title: { absolute: 'PsyDoctor | Lista de Espera · Salud Mental en Chile' },
    description: 'Únete a la lista de espera de PsyDoctor. Conecta con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud con boleta para reembolso y precios claros.',
    alternates: {
        canonical: 'https://psydoctor.cl',
    },
    openGraph: {
        title: 'PsyDoctor | Lista de Espera · Salud Mental en Chile',
        description: 'Acceso prioritario a consultas de psicología y psiquiatría online en Chile. Conoce el programa de profesionales fundadores.',
        url: 'https://psydoctor.cl',
        siteName: 'PsyDoctor',
        locale: 'es_CL',
        type: 'website',
    },
}

export default function WaitlistLandingPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col w-full max-w-full overflow-x-hidden">
            {/* Aviso visible exclusivamente en desarrollo si hay variables en PENDIENTE */}
            <PendingConfigBanner />

            {/* Header público con navegación adaptada a lista de espera */}
            <Header />

            <main className="flex-1 w-full max-w-full">
                {/* 1. Hero Mobile-First */}
                <WaitlistHeroSection />

                {/* 2. Cómo funciona (3 pasos) */}
                <WaitlistHowItWorksSection />

                {/* 3. Por qué PsyDoctor */}
                <WaitlistWhyUsSection />

                {/* 4. Programa Fundadores (para profesionales) */}
                <WaitlistFoundersProgramSection />

                {/* 5. Preguntas Frecuentes (acordeón accesible) */}
                <WaitlistFAQSection />

                {/* 6. Formularios anclados (#lista-espera y #fundadores) */}
                <WaitlistTabsSection />
            </main>

            {/* Botón flotante accesible de WhatsApp */}
            <FloatingWhatsAppButton />

            {/* Footer con aviso de emergencias y enlaces legales */}
            <Footer />
        </div>
    )
}
