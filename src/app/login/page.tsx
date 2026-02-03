'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Briefcase, AlertCircle, ArrowLeft } from 'lucide-react'

type UserType = 'patient' | 'professional' | null

const userTypeContent = {
    patient: {
        title: 'Iniciar como Paciente',
        subtitle: 'Accede a tu espacio personal',
        icon: User,
        registerLink: '/registro?tipo=paciente',
        registerText: 'Crear cuenta de paciente',
    },
    professional: {
        title: 'Iniciar como Profesional',
        subtitle: 'Accede a tu panel profesional',
        icon: Briefcase,
        registerLink: '/registro?tipo=profesional',
        registerText: 'Crear cuenta profesional',
    },
}

function LoginForm({ userType, onBack }: { userType: 'patient' | 'professional'; onBack: () => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
    const error = searchParams.get('error')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [wrongTypeError, setWrongTypeError] = useState(false)

    const content = userTypeContent[userType]
    const Icon = content.icon

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setFormError('')
        setWrongTypeError(false)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                // Check if the error indicates wrong user type
                if (result.error.includes('tipo') || result.error.includes('type')) {
                    setWrongTypeError(true)
                } else {
                    setFormError(result.error)
                }
            } else {
                router.push(callbackUrl)
            }
        } catch (err) {
            setFormError('Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        await signIn('google', { callbackUrl })
    }

    return (
        <>
            {/* User type indicator */}
            <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-primary-50 rounded-full mx-auto w-fit">
                <Icon className="w-4 h-4 text-primary-700" />
                <span className="text-sm font-medium text-primary-700">
                    {userType === 'patient' ? 'Cuenta de paciente' : 'Cuenta profesional'}
                </span>
            </div>

            {/* Wrong type error message */}
            {wrongTypeError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 mb-1">
                                Tipo de cuenta incorrecto
                            </p>
                            <p className="text-sm text-amber-700">
                                {userType === 'patient'
                                    ? 'Esta cuenta está registrada como profesional. Por favor, selecciona "Soy Profesional" para iniciar sesión correctamente.'
                                    : 'Esta cuenta está registrada como paciente. Por favor, selecciona "Busco Apoyo" para iniciar sesión correctamente.'
                                }
                            </p>
                            <button
                                onClick={onBack}
                                className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                            >
                                Cambiar tipo de cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Regular error messages */}
            {(error || formError) && !wrongTypeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {formError || (error === 'CredentialsSignin' ? 'Email o contraseña incorrectos' : 'Error al iniciar sesión')}
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
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                )}
                Continuar con Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">o</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="label">
                        Email
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

                <div>
                    <label htmlFor="password" className="label">
                        Contraseña
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
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Iniciar Sesión'
                    )}
                </button>
            </form>

            {/* Forgot password link */}
            <div className="mt-4 text-center">
                <Link
                    href="/olvide-contrasena"
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            {/* Register link */}
            <div className="mt-4 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link href={content.registerLink} className="text-primary-600 font-medium hover:underline">
                    {content.registerText}
                </Link>
            </div>

            {/* Back button */}
            <div className="mt-6 text-center">
                <button
                    onClick={onBack}
                    className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Cambiar tipo de cuenta
                </button>
            </div>
        </>
    )
}

function UserTypeSelector({ onSelect }: { onSelect: (type: 'patient' | 'professional') => void }) {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                Iniciar Sesión
            </h1>
            <p className="text-gray-600 text-center mb-8">
                Selecciona tu tipo de cuenta
            </p>

            <button
                onClick={() => onSelect('patient')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <User className="w-6 h-6 text-primary-700" />
                </div>
                <div className="text-left">
                    <p className="font-semibold text-gray-900">Busco Apoyo</p>
                    <p className="text-sm text-gray-500">Soy paciente</p>
                </div>
            </button>

            <button
                onClick={() => onSelect('professional')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                    <Briefcase className="w-6 h-6 text-accent-700" />
                </div>
                <div className="text-left">
                    <p className="font-semibold text-gray-900">Soy Profesional</p>
                    <p className="text-sm text-gray-500">Psicólogo/a o Psiquiatra</p>
                </div>
            </button>

            {/* Register link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-primary-600 font-medium hover:underline">
                    Regístrate gratis
                </Link>
            </div>

            {/* Back to home */}
            <div className="mt-4 text-center">
                <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>
            </div>
        </div>
    )
}

function LoginFormFallback() {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    )
}

function LoginContent() {
    const searchParams = useSearchParams()
    const tipoParam = searchParams.get('tipo')

    // Determine initial user type from URL param
    const getInitialType = (): UserType => {
        if (tipoParam === 'paciente' || tipoParam === 'patient') return 'patient'
        if (tipoParam === 'profesional' || tipoParam === 'professional') return 'professional'
        return null
    }

    const [userType, setUserType] = useState<UserType>(getInitialType())

    const handleBack = () => {
        setUserType(null)
    }

    if (!userType) {
        return <UserTypeSelector onSelect={setUserType} />
    }

    const content = userTypeContent[userType]

    return (
        <>
            <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                {content.title}
            </h1>
            <p className="text-gray-600 text-center mb-6">
                {content.subtitle}
            </p>
            <LoginForm userType={userType} onBack={handleBack} />
        </>
    )
}

export default function LoginPage() {
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
                    <Suspense fallback={<LoginFormFallback />}>
                        <LoginContent />
                    </Suspense>
                </div>

                {/* Legal */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Al iniciar sesión, aceptas nuestros{' '}
                    <Link href="/terminos" className="underline">Términos</Link> y{' '}
                    <Link href="/privacidad" className="underline">Política de Privacidad</Link>
                </p>
            </div>
        </div>
    )
}
