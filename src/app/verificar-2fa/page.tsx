'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Loader2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react'

function safeNext(value: string | null): string {
    // Solo rutas internas, para evitar redirecciones abiertas.
    if (value && value.startsWith('/') && !value.startsWith('//')) return value
    return '/dashboard'
}

function TwoFactorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status, update } = useSession()
    const next = safeNext(searchParams?.get('next') ?? null)

    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const sentOnce = useRef(false)

    // Sin sesion: al login. Con sesion ya completa: directo a destino.
    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login')
        if (status === 'authenticated' && !session?.mfaPending) router.replace(next)
    }, [status, session, router, next])

    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const sendCode = useCallback(async () => {
        setIsSending(true)
        setError('')
        setInfo('')
        try {
            const res = await fetch('/api/auth/2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send' }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.error || 'No pudimos enviar el código')
                return
            }
            if (data.cooldown) setCountdown(data.cooldown)
            setInfo('Te enviamos un código de 6 dígitos a tu correo.')
        } catch {
            setError('No pudimos enviar el código. Revisa tu conexión.')
        } finally {
            setIsSending(false)
        }
    }, [])

    // Envio automatico al llegar (una sola vez)
    useEffect(() => {
        if (status === 'authenticated' && session?.mfaPending && !sentOnce.current) {
            sentOnce.current = true
            void sendCode()
        }
    }, [status, session, sendCode])

    const verify = async (digits: string[]) => {
        const value = digits.join('')
        if (value.length !== 6) return
        setIsVerifying(true)
        setError('')
        try {
            const res = await fetch('/api/auth/2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', code: value }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.error || 'Código incorrecto')
                setCode(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
                return
            }
            // El callback jwt confirma la prueba en la BD y libera la sesion.
            await update()
            router.replace(next)
            router.refresh()
        } catch {
            setError('No pudimos verificar el código. Inténtalo de nuevo.')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleChange = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, '').slice(-1)
        const updated = [...code]
        updated[index] = digit
        setCode(updated)
        if (digit && index < 5) inputRefs.current[index + 1]?.focus()
        if (updated.every((d) => d !== '')) void verify(updated)
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (!pasted) return
        e.preventDefault()
        const updated = ['', '', '', '', '', '']
        pasted.split('').forEach((d, i) => (updated[i] = d))
        setCode(updated)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
        if (pasted.length === 6) void verify(updated)
    }

    if (status === 'loading' || (status === 'authenticated' && !session?.mfaPending)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/60 to-white px-4">
            <div className="w-full max-w-md card rounded-[28px] p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] bg-white">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                    <ShieldCheck className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-2">
                    Confirma tu inicio de sesión
                </h1>
                <p className="text-gray-600 text-center mb-6 text-sm">
                    Ingresa el código de 6 dígitos que enviamos a tu correo para proteger tu cuenta.
                </p>

                {error && (
                    <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {info && !error && (
                    <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm text-teal-900">{info}</div>
                )}

                <div className="flex justify-center gap-2 mb-6">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                inputRefs.current[i] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={i === 0 ? 'one-time-code' : 'off'}
                            maxLength={1}
                            value={digit}
                            disabled={isVerifying}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            aria-label={`Dígito ${i + 1}`}
                            className="h-12 w-11 rounded-xl border border-slate-300 text-center text-xl font-semibold text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:opacity-50"
                        />
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm">
                    {isVerifying ? (
                        <span className="inline-flex items-center gap-2 text-slate-600">
                            <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={sendCode}
                            disabled={isSending || countdown > 0}
                            className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:text-teal-900 disabled:text-slate-400"
                        >
                            <RefreshCw className={`h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
                            {countdown > 0 ? `Reenviar código en ${countdown}s` : 'Reenviar código'}
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="mt-6 block w-full text-center text-xs text-slate-500 hover:text-slate-700"
                >
                    Cancelar e iniciar sesión con otra cuenta
                </button>
            </div>
        </div>
    )
}

export default function VerificarDosPasosPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
                </div>
            }
        >
            <TwoFactorContent />
        </Suspense>
    )
}
