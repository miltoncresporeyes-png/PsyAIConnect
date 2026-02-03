'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Algo salió mal
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Ha ocurrido un error inesperado.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
