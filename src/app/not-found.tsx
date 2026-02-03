import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <>
            <Header />

            <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-16">
                <div className="text-center px-4">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="text-9xl font-heading font-bold text-primary-100">
                            404
                        </div>
                        <div className="relative -mt-16">
                            <span className="text-6xl">🔍</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                        Página no encontrada
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Lo sentimos, la página que buscas no existe o ha sido movida.
                        Pero no te preocupes, podemos ayudarte a encontrar lo que necesitas.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="btn-primary inline-flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Volver al inicio
                        </Link>
                        <Link
                            href="/buscar"
                            className="btn-secondary inline-flex items-center justify-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            Buscar profesional
                        </Link>
                    </div>

                    {/* Help text */}
                    <p className="mt-12 text-sm text-gray-500">
                        ¿Necesitas ayuda? Contáctanos en{' '}
                        <a href="mailto:soporte@psyconnect.cl" className="text-primary-600 hover:underline">
                            soporte@psyconnect.cl
                        </a>
                    </p>
                </div>
            </div>

            <Footer />
        </>
    )
}
