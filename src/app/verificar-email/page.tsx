'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Token de verificación no encontrado')
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Error al verificar el email')
                }

                setStatus('success')
                setMessage(data.message)
            } catch (err) {
                setStatus('error')
                setMessage(err instanceof Error ? err.message : 'Error al verificar el email')
            }
        }

        verifyEmail()
    }, [token])

    if (status === 'loading') {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Verificando tu email...
                </h1>
                <p className="text-gray-600">
                    Por favor espera mientras verificamos tu cuenta.
                </p>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    ¡Email verificado!
                </h1>
                <p className="text-gray-600 mb-6">
                    {message}
                </p>
                <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                    Ir al dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Error de verificación
            </h1>
            <p className="text-gray-600 mb-6">
                {message}
            </p>
            <div className="space-y-3">
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 w-full justify-center">
                    Ir al login
                </Link>
                <p className="text-sm text-gray-500">
                    ¿Necesitas un nuevo enlace?{' '}
                    <Link href="/dashboard/cuenta" className="text-primary-600 hover:underline">
                        Solicítalo aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}

function VerifyEmailFallback() {
    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Cargando...
            </h1>
        </div>
    )
}

export default function VerificarEmailPage() {
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
                    <Suspense fallback={<VerifyEmailFallback />}>
                        <VerifyEmailContent />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
