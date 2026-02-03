import type { Metadata } from 'next'
import './globals.css'
import { CrisisBanner } from '@/components/layout/CrisisBanner'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
    title: 'PsyConnect | Encuentra tu profesional de salud mental en Chile',
    description: 'Conectamos pacientes con psicólogos y psiquiatras verificados en Chile. Agenda online, precios transparentes, sesiones en minutos.',
    keywords: ['psicólogo', 'psicólogo online', 'salud mental', 'terapia', 'Chile', 'psiquiatra'],
    authors: [{ name: 'PsyConnect' }],
    icons: {
        icon: '/icon.svg',
    },
    openGraph: {
        title: 'PsyConnect | Salud Mental Accesible',
        description: 'Encuentra tu profesional de salud mental en Chile. Agenda en minutos.',
        url: 'https://psyconnect.cl',
        siteName: 'PsyConnect',
        locale: 'es_CL',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PsyConnect | Salud Mental Accesible',
        description: 'Encuentra tu profesional de salud mental en Chile.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className="min-h-screen bg-white antialiased">
                <Providers>
                    <CrisisBanner />
                    <main>
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    )
}
