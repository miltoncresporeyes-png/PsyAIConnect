'use client'

import { useState, useCallback } from 'react'
import { LAUNCH_DATE } from '@/lib/constants'

interface UseBetaWaitlistReturn {
    email: string
    setEmail: (email: string) => void
    isSubmitting: boolean
    message: { type: 'success' | 'error'; text: string } | null
    daysRemaining: number
    handleSubmit: (e: React.FormEvent) => Promise<void>
    setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void
}

export function useBetaWaitlist(): UseBetaWaitlistReturn {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const daysRemaining = (() => {
        const now = new Date()
        const diff = LAUNCH_DATE.getTime() - now.getTime()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    })()

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    }, [email])

    return {
        email,
        setEmail,
        isSubmitting,
        message,
        daysRemaining,
        handleSubmit,
        setMessage,
    }
}
