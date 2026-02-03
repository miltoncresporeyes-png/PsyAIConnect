'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, User, UserCog, ArrowLeft } from 'lucide-react'

type UserType = 'patient' | 'professional'

// ============================================================================
// Content Configuration (i18n-ready)
// ============================================================================

const content = {
    patient: {
        title: 'Crea tu cuenta',
        subtitle: 'Encuentra tu profesional de salud mental',
        icon: User,
        iconBgClass: 'bg-primary-100',
        iconColorClass: 'text-primary-600',
        buttonText: 'Crear cuenta de paciente',
        googleText: 'Continuar con Google',
    },
    professional: {
        title: 'Registro Profesional',
        subtitle: 'Comienza a recibir pacientes en PsyConnect',
        icon: UserCog,
        iconBgClass: 'bg-secondary-100',
        iconColorClass: 'text-secondary-600',
        buttonText: 'Crear cuenta profesional',
        googleText: 'Continuar con Google',
    },
    select: {
        title: 'Crea tu cuenta',
        subtitle: '¿Cómo quieres usar PsyConnect?',
    },
}

// ============================================================================
// Inner Component (uses useSearchParams)
// ============================================================================

function RegistroContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Check for tipo parameter in URL
    const tipoParam = searchParams.get('tipo')

    const [step, setStep] = useState<'select' | 'form'>('select')
    const [userType, setUserType] = useState<UserType | null>(null)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)

    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [error, setError] = useState('')

    // Auto-select user type if provided via URL parameter
    useEffect(() => {
        if (tipoParam === 'profesional' || tipoParam === 'professional') {
            setUserType('professional')
            setStep('form')
        } else if (tipoParam === 'paciente' || tipoParam === 'patient') {
            setUserType('patient')
            setStep('form')
        }
    }, [tipoParam])

    const handleTypeSelect = (type: UserType) => {
        setUserType(type)
        setStep('form')
    }

    const handleBack = () => {
        // If came from URL param, go back to landing page
        if (tipoParam) {
            router.push('/')
        } else {
            setStep('select')
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        // Store userType in session storage for callback handling
        if (userType) {
            sessionStorage.setItem('pendingUserType', userType)
        }
        await signIn('google', {
            callbackUrl: userType === 'professional' ? '/profesional/completar-perfil' : '/completar-perfil'
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        if (!acceptTerms) {
            setError('Debes aceptar los términos y condiciones')
            return
        }

        setIsLoading(true)

        try {
            // Step 1: Send verification code
            const verifyResponse = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send',
                    email,
                    name,
                }),
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
                throw new Error(verifyData.error || 'Error al enviar código de verificación')
            }

            // Step 2: Redirect to verification page with encoded params
            const encodedPassword = btoa(password) // Base64 encode password for safe URL transport
            router.push(
                `/verificar-codigo?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&p=${encodeURIComponent(encodedPassword)}&type=${userType}`
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar')
        } finally {
            setIsLoading(false)
        }
    }

    // Get current content based on user type
    const currentContent = userType ? content[userType] : content.select
    const CurrentIcon = userType ? content[userType].icon : null

    return (
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
                {step === 'select' ? (
                    <>
                        <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                            {content.select.title}
                        </h1>
                        <p className="text-gray-600 text-center mb-8">
                            {content.select.subtitle}
                        </p>

                        <div className="space-y-4">
                            {/* Patient Option */}
                            <button
                                onClick={() => handleTypeSelect('patient')}
                                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                        <User className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Busco un profesional
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Quiero encontrar un psicólogo o psiquiatra para comenzar mi proceso.
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Professional Option */}
                            <button
                                onClick={() => handleTypeSelect('professional')}
                                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition-all group text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                                        <UserCog className="w-6 h-6 text-secondary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Soy profesional
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Soy psicólogo/a o psiquiatra y quiero ofrecer mis servicios.
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Back button */}
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {tipoParam ? 'Volver al inicio' : 'Cambiar tipo de cuenta'}
                        </button>

                        {/* User type indicator */}
                        {CurrentIcon && (
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-xl ${content[userType!].iconBgClass} flex items-center justify-center`}>
                                    <CurrentIcon className={`w-5 h-5 ${content[userType!].iconColorClass}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    {userType === 'professional' ? 'Cuenta profesional' : 'Cuenta paciente'}
                                </span>
                            </div>
                        )}

                        <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                            {currentContent.title}
                        </h1>
                        <p className="text-gray-600 text-center mb-8">
                            {currentContent.subtitle}
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            {content[userType!].googleText}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-gray-500">o con email</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="label">Nombre completo</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input"
                                    placeholder="Tu nombre"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="label">Email</label>
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

                            <div>
                                <label htmlFor="password" className="label">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input pl-10 pr-10"
                                        placeholder="Mínimo 8 caracteres"
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
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="label">Confirmar contraseña</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input"
                                    placeholder="Repite tu contraseña"
                                    required
                                />
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    Acepto los{' '}
                                    <Link href="/terminos" className="text-primary-600 hover:underline">
                                        Términos y Condiciones
                                    </Link>{' '}
                                    y la{' '}
                                    <Link href="/privacidad" className="text-primary-600 hover:underline">
                                        Política de Privacidad
                                    </Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    content[userType!].buttonText
                                )}
                            </button>
                        </form>
                    </>
                )}

                {/* Link to login */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-primary-600 font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Main Page Component with Suspense
// ============================================================================

export default function RegistroPage() {
    return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
            <Suspense fallback={
                <div className="w-full max-w-md flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            }>
                <RegistroContent />
            </Suspense>
        </div>
    )
}
