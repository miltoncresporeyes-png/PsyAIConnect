import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CrisisBanner, WhatsAppAssistant } from '@/components/layout'
import { Providers } from '@/components/providers/Providers'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#0d9488',
}

export const metadata: Metadata = {
    title: {
        default: 'PsyDoctor | Salud Mental Accesible en Chile | psicólogos y psiquiatras',
        template: '%s | PsyDoctor',
    },
    description: 'Conecta con psicólogos y psiquiatras verificados en Chile. Agenda sesiones online en minutos, precios transparentes, y continúa tu proceso terapéutico sin interrupciones.',
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
        // Cobertura previsional (alta intención en Chile)
        'psicólogo Fonasa',
        'psicólogo Isapre',
        'psicólogo bonificación Isapre',
        'terapia cobertura Fonasa',
        'reembolso psicólogo Isapre',
        'salud mental Fonasa',
        // Reserva y plataforma
        'reservar hora psicólogo',
        'agenda online psicólogo',
        'directorio psicólogos Chile',
        'psicólogos verificados Chile',
        'plataforma salud mental Chile',
        'primera sesión psicólogo',
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
    alternates: {
        canonical: 'https://psydoctor.cl',
        languages: {
            'es-CL': 'https://psydoctor.cl',
            'en': 'https://psydoctor.cl/en',
            'fr': 'https://psydoctor.cl/fr',
            'pt-BR': 'https://psydoctor.cl/pt',
            'x-default': 'https://psydoctor.cl',
        },
    },
    openGraph: {
        title: 'PsyDoctor | Psicólogo Online en Chile | Agenda tu sesión hoy',
        description: 'Encuentra psicólogos y psiquiatras verificados en Chile. Agenda con cobertura Fonasa e Isapre. Precios transparentes, sin lista de espera.',
        url: 'https://psydoctor.cl',
        siteName: 'PsyDoctor',
        locale: 'es_CL',
        type: 'website',
        images: [
            {
                url: '/images/og-homepage.jpg',
                width: 1200,
                height: 630,
                alt: 'PsyDoctor - Plataforma de salud mental en Chile',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PsyDoctor | Psicólogo Online Chile | Fonasa e Isapre',
        description: 'Psicólogos y psiquiatras verificados en Chile. Agenda online, cobertura Fonasa/Isapre, precios transparentes. ¡Primera sesión hoy!',
        images: ['/images/og-homepage.jpg'],
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
    verification: {
        google: 'google-site-verification-code',
    },
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const locale = await getLocale()
    const messages = await getMessages()
    return (
        <html lang={locale}>
            <head>
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
                            '@type': 'MedicalOrganization',
                            name: 'PsyDoctor',
                            description: 'Plataforma de intermediación tecnológica para salud mental en Chile. Conecta pacientes con psicólogos y psiquiatras verificados con cobertura Fonasa e Isapre.',
                            url: 'https://psydoctor.cl',
                            logo: 'https://psydoctor.cl/icon.svg',
                            image: 'https://psydoctor.cl/images/hero-illustration.png',
                            telephone: '+56983414730',
                            email: 'contacto@psydoctor.cl',
                            medicalSpecialty: [
                                'Psychiatry',
                                'MentalHealth',
                                'Psychology',
                            ],
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
                            },
                            geo: {
                                '@type': 'GeoCoordinates',
                                latitude: -33.4489,
                                longitude: -70.6693,
                            },
                            openingHoursSpecification: {
                                '@type': 'OpeningHoursSpecification',
                                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                opens: '09:00',
                                closes: '21:00',
                            },
                            areaServed: {
                                '@type': 'Country',
                                name: 'Chile',
                            },
                            sameAs: [
                                'https://www.instagram.com/psydoctor_cl',
                                'https://www.linkedin.com/company/psydoctor',
                            ],
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'PsyDoctor',
                            url: 'https://psydoctor.cl',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: {
                                    '@type': 'EntryPoint',
                                    urlTemplate: 'https://psydoctor.cl/buscar?q={search_term_string}',
                                },
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: [
                                {
                                    '@type': 'Question',
                                    name: '¿Puedo usar Fonasa o Isapre para pagar la sesión?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'Sí. Los profesionales en PsyDoctor emiten boleta electrónica que puedes usar para solicitar reembolso a tu Isapre o bonificar con Fonasa, según tu plan de salud.',
                                    },
                                },
                                {
                                    '@type': 'Question',
                                    name: '¿Cómo agendo una sesión con un psicólogo online?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'Usa el buscador de PsyDoctor, filtra por especialidad, precio o disponibilidad, elige al profesional y reserva tu hora en menos de 3 minutos. Recibirás confirmación por email.',
                                    },
                                },
                                {
                                    '@type': 'Question',
                                    name: '¿Los psicólogos de PsyDoctor están verificados?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'Sí. Todos los profesionales pasan un proceso de verificación de título, colegiatura y antecedentes antes de publicar su perfil en la plataforma.',
                                    },
                                },
                                {
                                    '@type': 'Question',
                                    name: '¿Cuánto cuesta una sesión de psicología online en Chile?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'Los precios varían según el profesional. En PsyDoctor los ves antes de reservar: desde $25.000 hasta $80.000 CLP por sesión, con precios transparentes y sin costos ocultos.',
                                    },
                                },
                                {
                                    '@type': 'Question',
                                    name: '¿PsyDoctor funciona fuera de Santiago?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'Sí. Al ser una plataforma 100% online, puedes conectarte con psicólogos desde cualquier región de Chile: Valparaíso, Concepción, La Serena, Temuco y más.',
                                    },
                                },
                            ],
                        }),
                    }}
                />
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <CrisisBanner />
                        <main>{children}</main>
                        <WhatsAppAssistant />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
