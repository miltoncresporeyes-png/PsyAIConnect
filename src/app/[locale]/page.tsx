import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { Header, Footer } from '@/components/layout'
import { HeroSection } from '@/components/landing/HeroSection'
import { AdministrativeValueSection } from '@/components/landing/AdministrativeValueSection'
import { DifferentiationSection } from '@/components/landing/DifferentiationSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { ForProfessionalsSection } from '@/components/landing/ForProfessionalsSection'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'

interface Props {
    params: { locale: string }
}

const localeMeta: Record<string, { title: string; description: string; canonical: string }> = {
    en: {
        title: 'PsyDoctor | Find a Psychologist in Chile | Online Therapy',
        description: 'Connect with verified psychologists and psychiatrists in Chile. Book online therapy sessions in minutes. Transparent pricing, no waiting list.',
        canonical: 'https://psydoctor.cl/en',
    },
    fr: {
        title: 'PsyDoctor | Trouver un Psychologue au Chili | Thérapie en Ligne',
        description: 'Trouvez des psychologues et psychiatres vérifiés au Chili. Réservez des séances de thérapie en ligne en quelques minutes. Prix transparents.',
        canonical: 'https://psydoctor.cl/fr',
    },
    pt: {
        title: 'PsyDoctor | Encontre um Psicólogo no Chile | Terapia Online',
        description: 'Conecte-se com psicólogos e psiquiatras verificados no Chile. Agende sessões de terapia online em minutos. Preços transparentes, sem lista de espera.',
        canonical: 'https://psydoctor.cl/pt',
    },
}

export function generateMetadata({ params: { locale } }: Props): Metadata {
    const meta = localeMeta[locale]
    if (!meta) return {}
    return {
        title: { absolute: meta.title },
        description: meta.description,
        alternates: {
            canonical: meta.canonical,
            languages: {
                'es-CL': 'https://psydoctor.cl',
                'en': 'https://psydoctor.cl/en',
                'fr': 'https://psydoctor.cl/fr',
                'pt': 'https://psydoctor.cl/pt',
                'x-default': 'https://psydoctor.cl',
            },
        },
    }
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

import WaitlistLandingPage from '@/components/waitlist/WaitlistLandingPage'

export default async function LocalePage({ params: { locale } }: Props) {
    if (process.env.WAITLIST_MODE === 'true') {
        return <WaitlistLandingPage />
    }

    // Activa las traducciones para Server Components bajo esta ruta
    setRequestLocale(locale)
    const t = await getTranslations()

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

