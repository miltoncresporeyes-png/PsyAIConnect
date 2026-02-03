'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react'

function VerifyCodeContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const email = searchParams.get('email') || ''
    const name = searchParams.get('name') || ''
    const password = searchParams.get('p') || '' // Encoded password
    const userType = searchParams.get('type') || 'patient'

    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [verified, setVerified] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleInputChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1)

        const newCode = [...code]
        newCode[index] = digit
        setCode(newCode)
        setError('')

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all digits are entered
        if (digit && index === 5) {
            const fullCode = [...newCode.slice(0, 5), digit].join('')
            if (fullCode.length === 6) {
                verifyCode(fullCode)
            }
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

        if (pastedData.length === 6) {
            const newCode = pastedData.split('')
            setCode(newCode)
            inputRefs.current[5]?.focus()
            verifyCode(pastedData)
        }
    }

    const verifyCode = async (codeToVerify: string) => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    email,
                    code: codeToVerify,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error)
                setCode(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
                return
            }

            setVerified(true)

            // Now complete the registration
            const completeResponse = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'complete',
                    email,
                    name,
                    password: atob(password), // Decode password
                    userType,
                }),
            })

            const completeData = await completeResponse.json()

            if (!completeResponse.ok) {
                setError(completeData.error)
                return
            }

            setSuccess(true)

            // Auto sign in
            setTimeout(async () => {
                await signIn('credentials', {
                    email,
                    password: atob(password),
                    redirect: true,
                    callbackUrl: userType === 'professional'
                        ? '/profesional/completar-perfil'
                        : '/completar-perfil',
                })
            }, 1500)

        } catch (err) {
            setError('Error al verificar el código')
        } finally {
            setIsLoading(false)
        }
    }

    const resendCode = async () => {
        setIsResending(true)
        setError('')

        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'resend',
                    email,
                    name,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error)
                return
            }

            setCountdown(60) // 60 second cooldown
            setCode(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()

        } catch (err) {
            setError('Error al reenviar el código')
        } finally {
            setIsResending(false)
        }
    }

    if (!email) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card max-w-md w-full p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        Enlace Inválido
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Este enlace de verificación no es válido. Por favor inicia el proceso de registro nuevamente.
                    </p>
                    <Link href="/registro" className="btn-primary">
                        Ir a Registro
                    </Link>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Registro Completado!
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Tu correo ha sido verificado exitosamente.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Iniciando sesión...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="card max-w-md w-full p-8">
                {/* Back button */}
                <Link
                    href="/registro"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al registro
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Verifica tu Correo
                    </h1>
                    <p className="text-gray-600">
                        Hemos enviado un código de 6 dígitos a
                    </p>
                    <p className="text-primary-600 font-medium mt-1">
                        {email}
                    </p>
                </div>

                {/* Code Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 text-center mb-3">
                        Ingresa el código de verificación
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading || verified}
                                className={`
                                    w-12 h-14 text-center text-2xl font-bold
                                    border-2 rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                                    transition-all
                                    ${verified
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : error
                                            ? 'border-red-300'
                                            : 'border-gray-200'
                                    }
                                    ${isLoading ? 'opacity-50' : ''}
                                `}
                            />
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Verified indicator */}
                {verified && !success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-700">Código verificado. Completando registro...</p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verificando...</span>
                    </div>
                )}

                {/* Resend */}
                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        ¿No recibiste el código?
                    </p>
                    {countdown > 0 ? (
                        <p className="text-sm text-gray-400">
                            Reenviar en {countdown} segundos
                        </p>
                    ) : (
                        <button
                            onClick={resendCode}
                            disabled={isResending || isLoading}
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {isResending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Reenviar código
                        </button>
                    )}
                </div>

                {/* Timer info */}
                <p className="text-xs text-gray-400 text-center mt-6">
                    El código expira en 15 minutos
                </p>
            </div>
        </div>
    )
}

export default function VerificarCodigoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        }>
            <VerifyCodeContent />
        </Suspense>
    )
}
