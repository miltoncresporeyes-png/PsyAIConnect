'use client'

import { useEffect, useState, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { Clock, AlertTriangle } from 'lucide-react'

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000 // 30 minutos
const WARNING_BEFORE_MS = 2 * 60 * 1000   // Aviso 2 minutos antes (a los 28 minutos)

export default function InactivityTimeoutGuard() {
  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(120)
  const lastActivityRef = useRef<number>(Date.now())
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now()
      if (showWarning) {
        setShowWarning(false)
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
        }
      }
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }))

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current

      // Si sobrepasó el límite de inactividad, forzar cierre de sesión
      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(checkInterval)
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
        signOut({ callbackUrl: '/login?motivo=inactividad' })
      } 
      // Si entra en los últimos 2 minutos y no se ha mostrado advertencia
      else if (elapsed >= INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS && !showWarning) {
        setShowWarning(true)
        const left = Math.max(0, Math.round((INACTIVITY_LIMIT_MS - elapsed) / 1000))
        setSecondsRemaining(left)

        countdownIntervalRef.current = setInterval(() => {
          setSecondsRemaining(prev => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
              signOut({ callbackUrl: '/login?motivo=inactividad' })
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }, 5000)

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity))
      clearInterval(checkInterval)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [showWarning])

  if (!showWarning) return null

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
      role="alertdialog"
      aria-labelledby="inactivity-title"
      aria-describedby="inactivity-desc"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-amber-200 text-slate-800 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <h3 id="inactivity-title" className="text-lg font-bold text-slate-900 mb-2">
          ¿Sigues ahí?
        </h3>

        <p id="inactivity-desc" className="text-xs text-slate-600 leading-relaxed mb-4">
          Por medidas de privacidad y seguridad clínica, tu sesión se cerrará automáticamente en:
        </p>

        <div className="text-2xl font-mono font-bold text-amber-700 bg-amber-50 py-2 px-4 rounded-xl mb-5 inline-block">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              lastActivityRef.current = Date.now()
              setShowWarning(false)
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
            }}
            className="flex-1 py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Mantener sesión activa
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition"
          >
            Cerrar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
