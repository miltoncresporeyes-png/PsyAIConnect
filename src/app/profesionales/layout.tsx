import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profesionales de la Salud Mental en Chile',
    description:
        'Directorio de psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud en Chile. Conoce aranceles claros y boleta para reembolso.',
    alternates: {
        canonical: '/profesionales',
    },
}

export default function ProfesionalesLayout({ children }: { children: React.ReactNode }) {
    return children
}
