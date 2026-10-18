import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Buscar Psicólogo y Psiquiatra en Chile | PsyDoctor',
    description:
        'Encuentra psicólogos y psiquiatras habilitados en Chile: consulta disponibilidad online o presencial, aranceles y emisión de boleta para reembolso en Isapres y seguros.',
    alternates: {
        canonical: '/buscar',
    },
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
    return children
}
