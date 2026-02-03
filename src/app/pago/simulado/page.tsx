'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'

function SimuladorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const appointmentId = searchParams.get('appointmentId')

    const [isProcessing, setIsProcessing] = useState(false)

    const handlePayment = async (success: boolean) => {
        setIsProcessing(true)

        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, 1500))

        // In dev mode, redirect to confirmation with simulated status
        router.push(`/pago/confirmacion?status=${success ? 'success' : 'failed'}&appointmentId=${appointmentId}`)
    }

    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-amber-600" />
            </div>

            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Simulador de Pagos
            </h1>

            <p className="text-gray-600 mb-8">
                Este es un simulador para desarrollo. En producción, serás redirigido
                a Flow.cl para procesar el pago real.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
                <p className="flex items-center gap-2 justify-center">
                    <span className="font-semibold">🔧 Modo Desarrollo</span>
                </p>
                <p className="mt-1">
                    Flow.cl no está configurado (sin FLOW_API_KEY)
                </p>
            </div>

            {appointmentId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                    <p className="text-sm text-gray-500">ID de Cita</p>
                    <p className="font-mono text-sm text-gray-700">{appointmentId}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handlePayment(true)}
                    disabled={isProcessing}
                    className="flex flex-col items-center gap-2 p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all disabled:opacity-50"
                >
                    {isProcessing ? (
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    ) : (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    )}
                    <span className="font-medium text-green-700">Simular Pago Exitoso</span>
                </button>

                <button
                    onClick={() => handlePayment(false)}
                    disabled={isProcessing}
                    className="flex flex-col items-center gap-2 p-6 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all disabled:opacity-50"
                >
                    {isProcessing ? (
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <span className="font-medium text-red-700">Simular Pago Fallido</span>
                </button>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    )
}

export default function SimuladorPagoPage() {
    return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <span className="font-heading font-semibold text-2xl text-gray-900">
                            PsyConnect
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <Suspense fallback={<LoadingFallback />}>
                        <SimuladorContent />
                    </Suspense>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Esta página solo aparece en modo desarrollo
                </p>
            </div>
        </div>
    )
}
