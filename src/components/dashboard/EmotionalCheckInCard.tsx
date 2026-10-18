'use client'

import { useState, useEffect } from 'react'
import { Heart, CheckCircle2, AlertCircle, Trash2, Shield } from 'lucide-react'
import ImmediateHelpModal from './ImmediateHelpModal'

interface CheckInRecord {
  id: string
  estado: string
  createdAt: string
}

export default function EmotionalCheckInCard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState<CheckInRecord[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showConsecutiveAlert, setShowConsecutiveAlert] = useState(false)
  const [loading, setLoading] = useState(false)

  // Cargar historial reciente del paciente
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/paciente/checkin-emocional')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
        // Verificar 3 "mal" consecutivos
        const recent = (data.history || []).slice(0, 3)
        if (recent.length === 3 && recent.every((r: CheckInRecord) => r.estado === 'mal')) {
          setShowConsecutiveAlert(true)
        } else {
          setShowConsecutiveAlert(false)
        }
      }
    } catch {
      // Ignorar errores de red silenciosamente
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSelect = async (estado: string) => {
    setSelected(estado)
    setLoading(true)
    setSavedSuccess(false)

    try {
      const res = await fetch('/api/paciente/checkin-emocional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })

      if (res.ok) {
        setSavedSuccess(true)
        await fetchHistory()
        setTimeout(() => setSavedSuccess(false), 4000)
      }
    } catch {
      // Manejar error silenciosamente
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs mb-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            ¿Cómo te sientes hoy?
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Opcional</span>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        No tienes que sentirte bien para estar aquí. Esto es solo para ti y no reemplaza la atención de un profesional.
      </p>

      {/* Botones de selección */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {[
          { key: 'mal', label: 'Mal', emoji: '😔', color: 'hover:border-rose-300 hover:bg-rose-50/50' },
          { key: 'regular', label: 'Regular', emoji: '😐', color: 'hover:border-amber-300 hover:bg-amber-50/50' },
          { key: 'bien', label: 'Bien', emoji: '🙂', color: 'hover:border-emerald-300 hover:bg-emerald-50/50' },
          { key: 'muy_bien', label: 'Muy bien', emoji: '✨', color: 'hover:border-teal-300 hover:bg-teal-50/50' },
        ].map((item) => {
          const isChosen = selected === item.key
          return (
            <button
              key={item.key}
              onClick={() => handleSelect(item.key)}
              disabled={loading}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 active:scale-95 ${
                isChosen
                  ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-700'
                  : `border-slate-200 bg-slate-50/50 text-slate-700 ${item.color}`
              }`}
            >
              <span className="text-xl" role="img" aria-label={item.label}>
                {item.emoji}
              </span>
              <span className="text-xs">{item.label}</span>
            </button>
          )
        })}
      </div>

      {savedSuccess && (
        <p className="text-xs text-teal-700 flex items-center gap-1.5 mt-2 bg-teal-50 p-2 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Registrado solo para ti. Puedes borrar tu historial cuando desees desde Privacidad.
        </p>
      )}

      {/* Alerta amable si marcó "Mal" 3 veces consecutivas */}
      {showConsecutiveAlert && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold mb-1">
                Hemos notado días difíciles. Queremos que sepas que no estás solo/a.
              </h4>
              <p className="text-xs text-rose-900/90 leading-relaxed mb-3">
                Si sientes que la carga es muy pesada o necesitas apoyo inmediato, estamos aquí para conectarte con profesionales o con líneas de ayuda gratuitas disponibles en todo Chile.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ImmediateHelpModal />
                <a
                  href="/buscar"
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-800 text-white hover:bg-teal-900 transition"
                >
                  Encontrar apoyo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
