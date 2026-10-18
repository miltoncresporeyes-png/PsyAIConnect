'use client'

import { useState, useCallback } from 'react'

interface UseBetaWaitlistReturn {
    email: string
    setEmail: (email: string) => void
    isSubmitting: boolean
    message: { type: 'success' | 'error'; text: string } | null
    handleSubmit: (e: React.FormEvent) => Promise<void>
    setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void
}

export function useBetaWaitlist(): UseBetaWaitlistReturn {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
        handleSubmit,
        setMessage,
    }
}
