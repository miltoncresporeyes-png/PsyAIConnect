'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function OlvideContrasenaPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar la solicitud')
            }

            setIsSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar el correo')
        } finally {
            setIsLoading(false)
        }
    }

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
                    {isSuccess ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                ¡Revisa tu correo!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Si existe una cuenta con el email <strong>{email}</strong>,
                                recibirás un enlace para restablecer tu contraseña.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                El enlace expirará en 1 hora.
                            </p>
                            <Link
                                href="/login"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver
                            </Link>

                            <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                                ¿Olvidaste tu contraseña?
                            </h1>
                            <p className="text-gray-600 text-center mb-8">
                                No te preocupes, te enviaremos instrucciones para restablecerla.
                            </p>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="label">
                                        Email de tu cuenta
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input pl-10"
                                            placeholder="tu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Enviar instrucciones'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Links */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Recordaste tu contraseña?{' '}
                    <Link href="/login" className="text-primary-600 font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
