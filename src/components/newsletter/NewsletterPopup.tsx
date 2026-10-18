'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Mail, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface NewsletterPopupProps {
  title?: string
  description?: string
  buttonText?: string
  placeholder?: string
}

const STORAGE_KEY_DISMISSED = 'newsletter_popup_dismissed'
const STORAGE_KEY_REGISTERED = 'newsletter_popup_registered'

export function NewsletterPopup({
  title = 'Acceso anticipado y novedades de PsyDoctor',
  description = 'Únete a nuestra comunidad. Sé de los primeros en acceder a psicólogos y psiquiatras habilitados en la Superintendencia de Salud, con boleta para reembolso.',
  buttonText = 'Quiero acceso anticipado',
  placeholder = 'tu@email.com',
}: NewsletterPopupProps) {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Si el usuario ya está autenticado en la plataforma, no mostrar
    if (session?.user) {
      return
    }

    // Verificar si ya se registró previamente o si ya cerró la ventana
    const isRegistered = localStorage.getItem(STORAGE_KEY_REGISTERED) === 'true'
    const isDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true'

    if (isRegistered || isDismissed) {
      return
    }

    // Retrasar aparición a 10 segundos
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [session])

  const handleClose = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, 'true')
    } catch {
      // Ignorar errores en modo incógnito/privado estricto
    }
  }

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Ingresa tu correo electrónico')
      return
    }
    if (!validateEmail(cleanEmail)) {
      setError('Correo electrónico inválido')
      return
    }

    setIsSubmitting(true)

    try {
      // Registrar en lista de espera / newsletter
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          source: 'newsletter_popup',
        }),
      })

      // Marcar como registrado permanentemente en localStorage
      localStorage.setItem(STORAGE_KEY_REGISTERED, 'true')
      setSubmitted(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 2500)
    } catch {
      // Aun si falla la red, registramos localmente para no hostigar al usuario
      localStorage.setItem(STORAGE_KEY_REGISTERED, 'true')
      setSubmitted(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 2500)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop sutil */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={`
          relative w-full max-w-xl
          bg-white rounded-3xl shadow-2xl border border-slate-100
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Newsletter"
      >
        <div className="relative p-5 md:p-6">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="hidden md:flex flex-shrink-0 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              {!submitted ? (
                <>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {description}
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('')
                      }}
                      placeholder={placeholder}
                      className={`
                        min-w-0 flex-1 rounded-xl border bg-gray-50 px-4 py-2.5 text-sm
                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-100
                        transition-all
                        ${error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-teal-400'}
                      `}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="shrink-0 whitespace-nowrap rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-teal-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Registrando...' : buttonText}
                    </button>
                  </form>
                  {error && (
                    <p className="mt-2 text-xs text-red-500">{error}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      ¡Listo! Pronto recibirás novedades.
                    </p>
                    <p className="text-sm text-gray-500">
                      Te avisaremos apenas PsyDoctor esté disponible.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-b-2xl" />
      </div>
    </div>
  )
}
