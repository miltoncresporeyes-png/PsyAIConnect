import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Orientador de Bienestar',
    description:
        'Resuelve dudas sobre salud mental, terapia y cobertura de sesiones con el orientador de bienestar de PsyDoctor. Orientación inicial gratuita y confidencial.',
    alternates: {
        canonical: '/orientador',
    },
}

export default function OrientadorLayout({ children }: { children: React.ReactNode }) {
    return children
}
