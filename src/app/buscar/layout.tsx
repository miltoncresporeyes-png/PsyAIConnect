import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Buscar Psicólogos y Psiquiatras en Chile | PsyDoctor',
    description:
        'Encuentra psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud: precios claros y emisión de boleta para reembolso en tu Isapre o seguro según tu plan.',
    alternates: {
        canonical: '/buscar',
    },
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
    return children
}
