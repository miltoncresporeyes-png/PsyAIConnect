import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Crear Cuenta',
    description: 'Regístrate en PsyDoctor como paciente o profesional de la salud mental. Verificación de correo y de credenciales.',
    robots: { index: false, follow: true },
}

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
    return children
}
