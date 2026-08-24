import Link from 'next/link'
import { Home, ArrowLeft, Lock } from 'lucide-react'

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Acceso denegado
                </h2>
                <p className="text-gray-500 mb-8">
                    No tienes permisos para acceder a esta página. Solo los administradores pueden ver este contenido.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Ir al inicio
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver atrás
                    </Link>
                </div>
            </div>
        </div>
    )
}
