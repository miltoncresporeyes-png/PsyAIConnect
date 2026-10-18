import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profesionales Verificados en Chile',
    description:
        'Directorio de psicólogos y psiquiatras verificados en Chile. Compara precios, modalidad, especialidades y cobertura previsional antes de agendar tu sesión.',
    alternates: {
        canonical: '/profesionales',
    },
}

export default function ProfesionalesLayout({ children }: { children: React.ReactNode }) {
    return children
}
