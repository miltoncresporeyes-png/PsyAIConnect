import { Header, Footer } from '@/components/layout'
import { HeroSection } from '@/components/landing/HeroSection'
import { AdministrativeValueSection } from '@/components/landing/AdministrativeValueSection'
import { DifferentiationSection } from '@/components/landing/DifferentiationSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { ForProfessionalsSection } from '@/components/landing/ForProfessionalsSection'
import { CTASection } from '@/components/landing/CTASection'

export default function HomePage() {
    return (
        <>
            <Header />

            <HeroSection />

            <AdministrativeValueSection />

            <DifferentiationSection />

            <HowItWorksSection />

            <ForProfessionalsSection />

            <CTASection />

            <Footer />
        </>
    )
}
