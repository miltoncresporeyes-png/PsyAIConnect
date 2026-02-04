'use client'

import React, { useState } from 'react'
import { Clock } from 'lucide-react'

export function HeroSection() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '¡Registro exitoso! Revisa tu correo.',
        })
        setEmail('')
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error. Intenta de nuevo.',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión. Intenta de nuevo.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative w-full bg-gradient-to-b from-purple-50/30 via-white to-white overflow-hidden">
      
      {/* Contenedor Principal: Centrado y con márgenes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* GRID: Aquí ocurre la magia. En móvil es 1 columna, en PC son 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-16 md:py-28 items-center">

          {/* COLUMNA IZQUIERDA: Texto y Formulario */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 order-2 md:order-1">
            
            {/* 1. Contador (Estilo Badge suave) */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full border border-purple-200/50 shadow-sm">
               <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
               <span className="text-sm font-semibold text-gray-700">
                 Lanzamiento Beta: <span className="text-purple-700 font-bold">10 Días</span>
               </span>
            </div>

            {/* 2. Titulares */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              El futuro de la gestión en{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">salud mental</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
              Únete a la versión Beta exclusiva. <span className="font-semibold text-gray-800">Orientación inteligente</span> para pacientes y <span className="font-semibold text-gray-800">autonomía administrativa total</span> para profesionales.
            </p>

            {/* 3. El Formulario (Versión Pro Corregida) */}
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3 mt-2">
              <input 
                type="email" 
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="flex-1 w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all hover:border-gray-300 shadow-sm disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Enviando...' : 'Asegurar cupo'}
              </button>
            </form>

            {/* Mensaje de respuesta */}
            {message && (
              <div className={`w-full max-w-md px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            {/* Texto de seguridad pequeño */}
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Tus datos están protegidos. Sin spam.
            </p>
          </div>

          {/* COLUMNA DERECHA: Imagen */}
          <div className="relative order-1 md:order-2 flex justify-center">
            {/* Círculos decorativos con gradientes sutiles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-3xl -z-10 opacity-40 animate-pulse"></div>
            <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-gradient-to-tr from-pink-100 to-purple-100 rounded-full blur-2xl -z-10 opacity-30"></div>
            
            {/* Imagen con mejor tratamiento visual */}
            <div className="relative">
              <img 
                src="/images/hero-illustration.png" 
                alt="Paciente utilizando PsyConnect" 
                className="w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl transform hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              {/* Sombra personalizada debajo de la imagen */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-purple-200/30 to-transparent rounded-full blur-xl"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
