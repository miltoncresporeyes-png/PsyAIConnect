import type { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import { HeroSection } from '@/components/landing/HeroSection'
import { AdministrativeValueSection } from '@/components/landing/AdministrativeValueSection'
import { DifferentiationSection } from '@/components/landing/DifferentiationSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { VerificationSection } from '@/components/landing/VerificationSection'
import { PricingGuidanceSection } from '@/components/landing/PricingGuidanceSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { ForProfessionalsSection } from '@/components/landing/ForProfessionalsSection'
import { CTASection } from '@/components/landing/CTASection'
import { UnifiedFAQSection } from '@/components/landing/FAQSection'
import { ProfessionalDirectory } from '@/components/directory/ProfessionalDirectory'
import WaitlistLandingPage from '@/components/waitlist/WaitlistLandingPage'

export const metadata: Metadata = {
    title: { absolute: 'PsyDoctor | Psicólogos y Psiquiatras en Chile | Boleta para Reembolso' },
    description: 'Encuentra psicólogos y psiquiatras registrados en la Superintendencia de Salud. Agenda online según disponibilidad, precios transparentes y boleta para reembolso.',
    alternates: {
        canonical: 'https://psydoctor.cl',
        languages: {
            'es-CL': 'https://psydoctor.cl',
            en: 'https://psydoctor.cl/en',
            fr: 'https://psydoctor.cl/fr',
            pt: 'https://psydoctor.cl/pt',
            'x-default': 'https://psydoctor.cl',
        },
    },
}

export default function HomePage() {
    if (process.env.WAITLIST_MODE === 'true') {
        return <WaitlistLandingPage />
    }

    return (
        <>
            <Header />

            <HeroSection />

            <AdministrativeValueSection />

            <DifferentiationSection />

            <VerificationSection />

            <TestimonialsSection />

            <PricingGuidanceSection />

            <HowItWorksSection />

            <ForProfessionalsSection />

            <section id="faq" className="py-16 md:py-20 bg-slate-50">
                <div className="container-wide">
                    <UnifiedFAQSection />
                </div>
            </section>

            <ProfessionalDirectory limit={12} />

            <CTASection />

            <Footer />
        </>
    )
}
