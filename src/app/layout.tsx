import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CrisisBanner, WhatsAppAssistant } from '@/components/layout'
import { NewsletterPopup } from '@/components/newsletter/NewsletterPopup'
import { Providers } from '@/components/providers/Providers'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Script from 'next/script'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#0d9488',
}

export const metadata: Metadata = {
    title: {
        default: 'PsyDoctor | Psicólogos y psiquiatras online en Chile',
        template: '%s | PsyDoctor',
    },
    description: 'Plataforma chilena para conectar con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud. Atención online, precios claros y boleta para reembolso. Únete a la lista de espera.',
    keywords: [
        // Búsquedas principales
        'psicólogo Chile',
        'psicólogo online',
        'psicólogo online Chile',
        'salud mental Chile',
        'terapia online',
        'psiquiatra Chile',
        'psiquiatra online Chile',
        'atención psicológica',
        'buscar psicólogo',
        'agenda psicólogo',
        'psicología clínica',
        'salud mental accesible',
        // Por ciudad
        'psicólogo Santiago',
        'psicólogo Santiago online',
        'psiquiatra Santiago',
        'terapia psicológica Santiago',
        'psicólogo Valparaíso',
        'psicólogo Concepción',
        // Cobertura previsional y reembolso
        'reembolso psicólogo Isapre',
        'boleta honorarios psicólogo',
        'psicólogo seguro complementario',
        // Reserva y plataforma
        'reservar hora psicólogo',
        'agenda online psicólogo',
        'directorio psicólogos Chile',
        'psicólogos Registro Superintendencia de Salud',
        'plataforma salud mental Chile',
        'precios transparentes psicólogo',
        // Tipos de terapia
        'terapia cognitivo conductual Chile',
        'terapia de pareja Chile',
        'psicólogo adolescentes Chile',
        'psicólogo infantil Chile',
        // Condiciones (long-tail)
        'psicólogo ansiedad Chile',
        'psicólogo depresión Chile',
        'apoyo psicológico online',
        'psicólogo duelo Chile',
        'psicólogo estrés laboral',
        // Profesionales
        'plataforma para psicólogos Chile',
        'gestión agenda psicólogo online',
        'boleta electrónica psicólogo',
        // Internacional
        'psychologist Chile',
        'mental health Chile',
        'online therapy Chile',
        'online psychologist Chile',
    ],
    authors: [{ name: 'PsyDoctor SpA', url: 'https://psydoctor.cl' }],
    creator: 'PsyDoctor SpA',
    publisher: 'PsyDoctor SpA',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://psydoctor.cl'),
    openGraph: {
        title: 'PsyDoctor | Psicólogos y psiquiatras online en Chile',
        description: 'Plataforma chilena para conectar con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud. Atención online, precios claros y boleta para reembolso. Únete a la lista de espera.',
        url: 'https://psydoctor.cl',
        siteName: 'PsyDoctor',
        locale: 'es_CL',
        type: 'website',
        images: [
            {
                url: '/images/og-homepage.png',
                width: 1200,
                height: 630,
                alt: 'PsyDoctor: psicólogos y psiquiatras inscritos en el Registro',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PsyDoctor | Psicólogo online en Chile',
        description: 'Plataforma chilena para conectar con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud. Atención online, precios claros y boleta para reembolso. Únete a la lista de espera.',
        images: ['/images/og-homepage.png'],
        site: '@psydoctor_cl',
        creator: '@psydoctor_cl',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    category: 'health',
    alternates: {
        canonical: '/',
        languages: {
            'es-CL': '/',
            en: '/en',
            fr: '/fr',
            pt: '/pt',
        },
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
        ? {
            verification: {
                google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
            },
        }
        : {}),
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const locale = await getLocale()
    const messages = await getMessages()
    const htmlLang = locale === 'es' ? 'es-CL' : locale
    return (
        <html lang={htmlLang}>
            <head>
                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-81WFYEW04G"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-81WFYEW04G');
                        `,
                    }}
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            </head>
            <body className="min-h-screen bg-white antialiased">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@graph': [
                                {
                                    '@type': 'MedicalOrganization',
                                    '@id': 'https://psydoctor.cl/#organization',
                                    name: 'PsyDoctor',
                                    legalName: 'PsyDoctor SpA',
                                    description:
                                        'Plataforma de intermediación tecnológica para salud mental en Chile. Conecta pacientes con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud, con boleta para reembolso.',
                                    url: 'https://psydoctor.cl',
                                    logo: 'https://psydoctor.cl/icon.svg',
                                    image: 'https://psydoctor.cl/images/hero-illustration.png',
                                    telephone: '+56983414730',
                                    email: 'contacto@psydoctor.cl',
                                    priceRange: '$$',
                                    currenciesAccepted: 'CLP',
                                    paymentAccepted: 'Tarjeta de crédito, transferencia, boleta electrónica',
                                    medicalSpecialty: ['Psychiatry', 'MentalHealth', 'Psychology'],
                                    availableService: [
                                        { '@type': 'MedicalTherapy', name: 'Terapia psicológica online', url: 'https://psydoctor.cl/buscar' },
                                        { '@type': 'MedicalTherapy', name: 'Consulta psiquiátrica online', url: 'https://psydoctor.cl/buscar' },
                                        { '@type': 'MedicalTherapy', name: 'Terapia cognitivo conductual (TCC)', url: 'https://psydoctor.cl/buscar' },
                                        { '@type': 'MedicalTherapy', name: 'Terapia de pareja', url: 'https://psydoctor.cl/buscar' },
                                    ],
                                    address: {
                                        '@type': 'PostalAddress',
                                        addressCountry: 'CL',
                                        addressLocality: 'Santiago',
                                        addressRegion: 'Región Metropolitana',
                                    },
                                    geo: {
                                        '@type': 'GeoCoordinates',
                                        latitude: -33.4489,
                                        longitude: -70.6693,
                                    },
                                    openingHoursSpecification: [{
                                        '@type': 'OpeningHoursSpecification',
                                        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                        opens: '09:00',
                                        closes: '18:00',
                                    }],
                                    areaServed: {
                                        '@type': 'Country',
                                        name: 'Chile',
                                    },
                                    contactPoint: [{
                                        '@type': 'ContactPoint',
                                        contactType: 'customer support',
                                        telephone: '+56983414730',
                                        email: 'contacto@psydoctor.cl',
                                        areaServed: 'CL',
                                        availableLanguage: ['es', 'en', 'pt'],
                                    }],
                                    sameAs: [
                                        'https://www.instagram.com/psydoctor_cl',
                                        'https://www.linkedin.com/company/psydoctor',
                                    ],
                                },
                                {
                                    '@type': 'WebSite',
                                    '@id': 'https://psydoctor.cl/#website',
                                    name: 'PsyDoctor',
                                    url: 'https://psydoctor.cl',
                                    inLanguage: 'es-CL',
                                    publisher: { '@id': 'https://psydoctor.cl/#organization' },
                                    potentialAction: {
                                        '@type': 'SearchAction',
                                        target: {
                                            '@type': 'EntryPoint',
                                            urlTemplate: 'https://psydoctor.cl/buscar?q={search_term_string}',
                                        },
                                        'query-input': 'required name=search_term_string',
                                    },
                                },
                            ],
                        }),
                    }}
                />
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <NewsletterPopup />
                        <main className="w-full max-w-full min-w-0">{children}</main>
                        <WhatsAppAssistant />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
