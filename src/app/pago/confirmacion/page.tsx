'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, XCircle, Calendar } from 'lucide-react'

function ConfirmacionContent() {
    const searchParams = useSearchParams()
    const status = searchParams.get('status') || 'success'
    const appointmentId = searchParams.get('appointmentId')

    const isSuccess = status === 'success' || status === '2' // Flow status 2 = completed

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-3">
                    ¡Pago confirmado!
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    Tu cita ha sido agendada exitosamente. Te enviamos un correo
                    con los detalles de la sesión.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Próximos pasos
                    </h3>
                    <ul className="space-y-2 text-green-700">
                        <li className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                            Revisa tu correo electrónico con los detalles de la cita
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                            Prepárate para conectarte 5 minutos antes de la sesión
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                            Si necesitas cancelar, hazlo al menos 24 horas antes
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/dashboard/citas"
                        className="btn-primary inline-flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Ver mis citas
                    </Link>
                    <Link
                        href="/dashboard"
                        className="btn-secondary inline-flex items-center justify-center gap-2"
                    >
                        Ir al dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-3">
                Pago no completado
            </h1>

            <p className="text-lg text-gray-600 mb-8">
                Hubo un problema al procesar tu pago. No se realizó ningún cargo.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                <p className="text-amber-800">
                    Puedes intentar nuevamente o contactarnos si el problema persiste.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/buscar"
                    className="btn-primary inline-flex items-center justify-center gap-2"
                >
                    Buscar profesionales
                </Link>
                <Link
                    href="/dashboard"
                    className="btn-secondary inline-flex items-center justify-center gap-2"
                >
                    Ir al dashboard
                </Link>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Verificando pago...</p>
        </div>
    )
}

export default function ConfirmacionPagoPage() {
    return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-lg">
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
                        <ConfirmacionContent />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
