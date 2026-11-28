import type { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import SupportContent from './SupportContent'

export const metadata: Metadata = {
    title: 'Soporte y feedback | PsyDoctor',
    description: 'Cuéntanos un problema, una sugerencia o una duda sobre PsyDoctor.',
    alternates: { canonical: 'https://psydoctor.cl/soporte' },
}

export default function SoportePage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-10">
                <div className="mx-auto max-w-2xl px-4">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Soporte y feedback</h1>
                    <p className="mb-8 mt-2 text-slate-600">
                        Tu experiencia nos importa. Si algo no funciona, tienes una idea o una duda, cuéntanoslo aquí.
                    </p>
                    <SupportContent />
                    <p className="mt-8 text-xs text-slate-500">
                        PsyDoctor no es un servicio de emergencias. Si tú o alguien cercano está en peligro, llama al
                        *4141 (Línea de Prevención del Suicidio), al 600 360 7777 (Salud Responde) o al 131 (SAMU).
                    </p>
                </div>
            </main>
            <Footer />
        </>
    )
}
