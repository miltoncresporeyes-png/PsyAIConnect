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
import { FAQSection } from '@/components/landing/FAQSection'
import { ProfessionalDirectory } from '@/components/directory/ProfessionalDirectory'
import WaitlistLandingPage from '@/components/waitlist/WaitlistLandingPage'

export const metadata: Metadata = {
    title: { absolute: 'PsyDoctor | Psicólogo Online en Chile | Agenda con Fonasa e Isapre' },
    description: 'Encuentra psicólogos y psiquiatras verificados en Chile. Agenda sesiones online hoy, con cobertura Fonasa e Isapre, precios transparentes y sin lista de espera.',
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

            <FAQSection />

            <ProfessionalDirectory limit={12} />

            <CTASection />

            <Footer />
        </>
    )
}
