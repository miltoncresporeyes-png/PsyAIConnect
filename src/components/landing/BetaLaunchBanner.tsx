'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react'
import { LAUNCH_DATE_END_OF_DAY } from '@/lib/constants'

interface BetaLaunchBannerProps {
    variant?: 'default' | 'compact'
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="bg-white/14 backdrop-blur-sm border border-white/22 rounded-xl p-2.5 text-center shadow-inner w-full max-w-[130px] transition-transform duration-250 hover:bg-white/22 hover:-translate-y-1">
            <div className="text-3.6 font-black text-white leading-none text-shadow-sm">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-[0.625rem] text-white/95 uppercase tracking-[0.75px] font-bold mt-1">
                {label}
            </div>
        </div>
    )
}

export function BetaLaunchBanner({ variant = 'default' }: BetaLaunchBannerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const distance = LAUNCH_DATE_END_OF_DAY.getTime() - now

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
            }

            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            }
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMessage(null)

        try {
            const response = await fetch('/api/beta-waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: '¡Registro exitoso! Revisa tu correo para más información.',
                })
                setEmail('')
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Hubo un error. Por favor, intenta de nuevo.',
                })
            }
        } catch {
            setMessage({
                type: 'error',
                text: 'Error de conexión. Por favor, intenta de nuevo.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (variant === 'compact') {
        return (
            <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-[80%] -translate-y-1/2 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl" />
                </div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-white text-center sm:text-left">
                            <p className="font-bold text-lg">
                                {timeLeft.days > 0
                                    ? `Lanzamiento en ${timeLeft.days} ${timeLeft.days === 1 ? 'día' : 'días'}`
                                    : '¡El futuro está aquí!'}
                            </p>
                            <p className="text-sm text-white/80">Únete a la versión Beta exclusiva</p>
                        </div>
                        <form onSubmit={handleSubmit} className="flex w-full sm:w-auto gap-2">
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                                className="flex-1 sm:w-64 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-70 whitespace-nowrap"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Asegurar mi cabo'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mt-3 text-center text-sm ${
                                message.type === 'success' ? 'text-green-300' : 'text-red-300'
                            }`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </div>
            </section>
        )
    }

    return (
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 py-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-[80%] -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                        {timeLeft.days > 0
                            ? `El futuro de la salud mental llega en ${timeLeft.days} ${timeLeft.days === 1 ? 'día' : 'días'}.`
                            : 'El futuro de la salud mental está aquí.'}
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mx-auto">
                        Únete a la versión Beta exclusiva. Orientación inteligente para pacientes y autonomía administrativa total para profesionales.
                    </p>
                </motion.div>

                {timeLeft.days > 0 && (
                    <div className="flex justify-center mb-8">
                        <div className="grid grid-cols-4 gap-3.5 max-w-[540px] w-full">
                            <CountdownUnit value={timeLeft.days} label="Días" />
                            <CountdownUnit value={timeLeft.hours} label="Horas" />
                            <CountdownUnit value={timeLeft.minutes} label="Min" />
                            <CountdownUnit value={timeLeft.seconds} label="Seg" />
                        </div>
                    </div>
                )}

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="max-w-lg mx-auto"
                >
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-3.5 rounded-xl bg-white border border-gray-200/10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg text-base"
                            aria-label="Correo electrónico"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-7 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    Asegurar mi cabo
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
                                message.type === 'success'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-red-500/90 text-white'
                            }`}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    <p className="mt-4 text-sm text-white/90 text-center">
                        Tus datos están protegidos. No compartimos información personal.
                    </p>
                </motion.form>
            </div>
        </section>
    )
}
