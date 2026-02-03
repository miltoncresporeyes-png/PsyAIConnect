'use client'

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

interface WaitlistFormProps {
    variant?: 'default' | 'hero'
    type?: 'patient' | 'professional'
}

export function WaitlistForm({ variant = 'default', type = 'patient' }: WaitlistFormProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, type }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al registrar')
            }

            setIsSuccess(true)
            setEmail('')
            setName('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className={`flex items-center gap-3 ${variant === 'hero' ? 'text-white' : 'text-green-600'}`}>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-semibold">¡Estás en la lista!</p>
                    <p className="text-sm opacity-80">Te avisaremos cuando lancemos.</p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${variant === 'hero'
                        ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-white/30 focus:bg-white/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-primary-500'
                        }`}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${variant === 'hero'
                        ? 'bg-white text-primary-700 hover:bg-gray-100'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                        } disabled:opacity-50`}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Unirme
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}

            <p className={`mt-3 text-xs ${variant === 'hero' ? 'text-white/80' : 'text-gray-500'}`}>
                Sin spam. Solo te avisaremos cuando lancemos.
            </p>
        </form>
    )
}
