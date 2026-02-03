'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    // Password strength indicators
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    }

    const isPasswordStrong = Object.values(passwordChecks).every(Boolean)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!token) {
            setError('Token de recuperación no encontrado')
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (!isPasswordStrong) {
            setError('La contraseña no cumple con los requisitos de seguridad')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al restablecer la contraseña')
            }

            setIsSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña')
        } finally {
            setIsLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Enlace inválido
                </h1>
                <p className="text-gray-600 mb-6">
                    El enlace de recuperación es inválido o ha expirado.
                </p>
                <Link href="/olvide-contrasena" className="btn-primary inline-flex items-center gap-2">
                    Solicitar nuevo enlace
                </Link>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    ¡Contraseña actualizada!
                </h1>
                <p className="text-gray-600 mb-6">
                    Tu contraseña ha sido restablecida exitosamente.
                    Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                    Iniciar sesión
                </Link>
            </div>
        )
    }

    return (
        <>
            <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                Nueva contraseña
            </h1>
            <p className="text-gray-600 text-center mb-8">
                Ingresa tu nueva contraseña segura
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="label">
                        Nueva contraseña
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input pl-10 pr-10"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Password strength indicators */}
                    {password && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 font-medium">Tu contraseña debe tener:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`flex items-center gap-1 text-xs ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordChecks.length ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" />}
                                    Al menos 8 caracteres
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordChecks.uppercase ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" />}
                                    Una mayúscula
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordChecks.lowercase ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" />}
                                    Una minúscula
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${passwordChecks.number ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordChecks.number ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" />}
                                    Un número
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="label">
                        Confirmar contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input"
                        placeholder="Repite tu contraseña"
                        required
                    />
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !isPasswordStrong}
                    className="btn-primary w-full"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Actualizar contraseña'
                    )}
                </button>
            </form>
        </>
    )
}

function FormFallback() {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    )
}

export default function RestablecerContrasenaPage() {
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
                    <Suspense fallback={<FormFallback />}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
