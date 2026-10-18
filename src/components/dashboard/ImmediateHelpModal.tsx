'use client'

import { useState } from 'react'
import { AlertCircle, Phone, X, ShieldAlert, HeartHandshake } from 'lucide-react'

export function ImmediateHelpModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón flotante o integrado en encabezado */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:text-rose-800 transition shadow-sm active:scale-95"
        aria-label="Abrir recursos de ayuda inmediata y emergencias"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
        <span className="font-medium">Necesito ayuda ahora</span>
      </button>

      {/* Modal accesible */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 text-slate-800 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              aria-label="Cerrar ventana de ayuda inmediata"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 id="emergency-title" className="text-lg font-bold text-slate-900">
                  Ayuda Inmediata y Contención
                </h3>
                <p className="text-xs text-slate-500">
                  Líneas gratuitas y confidenciales en Chile
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl mb-4 text-xs text-rose-900 leading-relaxed">
              <p className="font-semibold mb-1">Aviso importante:</p>
              PsyDoctor es un intermediario tecnológico para consultas programadas y <strong>no es un servicio de emergencias</strong>. Si estás en peligro o piensas en hacerte daño, llama ahora:
            </div>

            <div className="space-y-2.5 mb-5">
              {/* *4141 */}
              <a
                href="tel:*4141"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-rose-50/80 border border-slate-200 hover:border-rose-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    *4141
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-rose-900">
                      Línea Prevención del Suicidio
                    </p>
                    <p className="text-xs text-slate-500">
                      MINSAL • Gratuito 24/7 desde celulares
                    </p>
                  </div>
                </div>
                <Phone className="w-4 h-4 text-rose-600 shrink-0" />
              </a>

              {/* 600 360 7777 */}
              <a
                href="tel:6003607777"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-teal-50/80 border border-slate-200 hover:border-teal-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    Salud
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">
                      Salud Responde: 600 360 7777
                    </p>
                    <p className="text-xs text-slate-500">
                      Orientación médica y psicológica 24/7
                    </p>
                  </div>
                </div>
                <Phone className="w-4 h-4 text-teal-700 shrink-0" />
              </a>

              {/* 131 */}
              <a
                href="tel:131"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-red-50/80 border border-slate-200 hover:border-red-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    131
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-red-900">
                      SAMU (Urgencias Médicas)
                    </p>
                    <p className="text-xs text-slate-500">
                      Ambulancia y emergencias vitales
                    </p>
                  </div>
                </div>
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
              </a>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cerrar y volver a mi panel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ImmediateHelpModal

