import type { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import { HeroSection } from '@/components/landing/HeroSection'
import { AdministrativeValueSection } from '@/components/landing/AdministrativeValueSection'
import { DifferentiationSection } from '@/components/landing/DifferentiationSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { ForProfessionalsSection } from '@/components/landing/ForProfessionalsSection'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'

export const metadata: Metadata = {
    title: 'PsyDoctor | Psicólogo Online en Chile | Agenda con Fonasa e Isapre',
    description: 'Encuentra psicólogos y psiquiatras verificados en Chile. Agenda sesiones online hoy, con cobertura Fonasa e Isapre, precios transparentes y sin lista de espera.',
    alternates: {
        canonical: 'https://psydoctor.cl',
    },
}

export default function HomePage() {
    return (
        <>
            <Header />

            <HeroSection />

            <AdministrativeValueSection />

            <DifferentiationSection />

            <HowItWorksSection />

            <ForProfessionalsSection />

            <FAQSection />

            <CTASection />

            <Footer />
        </>
    )
}
