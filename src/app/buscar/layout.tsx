import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Buscar Psicólogo y Psiquiatra en Chile',
    description:
        'Encuentra psicólogos y psiquiatras verificados en Chile: filtra por cobertura Fonasa e Isapre, modalidad online o presencial, comuna y precio. Agenda sin lista de espera.',
    alternates: {
        canonical: '/buscar',
    },
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
    return children
}
