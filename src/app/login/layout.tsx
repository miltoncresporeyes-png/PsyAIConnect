import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Iniciar Sesión',
    description: 'Inicia sesión en PsyDoctor para agendar, gestionar tus sesiones y tus notas clínicas.',
    robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children
}
