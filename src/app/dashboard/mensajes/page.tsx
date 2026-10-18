'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import ImmediateHelpModal from '@/components/dashboard/ImmediateHelpModal'
import {
  MessageSquare,
  AlertTriangle,
  Send,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react'

export default function MensajesPage() {
  const [loading, setLoading] = useState(true)
  const [hasProfessional, setHasProfessional] = useState(false)

  useEffect(() => {
    async function checkAssignedProfessional() {
      try {
        const res = await fetch('/api/paciente/mi-profesional')
        if (res.ok) {
          const data = await res.json()
          setHasProfessional(!!data.professional)
        }
      } catch (err) {
        console.error('Error checking professional for chat:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAssignedProfessional()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <PageContainer variant="dashboard" size="medium">
        <div className="flex items-center justify-between mb-4">
          <BackToDashboard />
          <ImmediateHelpModal />
        </div>

        <PageHeader
          title="Mensajes"
          description="Comunicación asincrónica y consultas breves con tu profesional"
        />

        {/* Aviso Fijo Obligatorio de No Emergencia */}
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl mb-6 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold mb-1">Los mensajes no son para emergencias.</p>
            <p className="text-amber-900/90 leading-relaxed mb-2">
              Si necesitas ayuda urgente o contención inmediata, por favor usa el botón:
            </p>
            <ImmediateHelpModal />
          </div>
        </div>

        {!hasProfessional ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Aún no tienes un profesional asignado
            </h3>
            <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              El canal de mensajes se activa automáticamente cuando reservas tu primera sesión con un psicólogo o psiquiatra.
            </p>
            <Link
              href="/buscar"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition"
            >
              Encontrar apoyo
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Próximamente disponible</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Módulo de Mensajería Asincrónica
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
              Estamos preparando un canal directo y ordenado para acordar detalles previos a la sesión. Mientras tanto, tu profesional te contactará directamente a través del correo o teléfono registrado.
            </p>
            <Link
              href="/dashboard/citas"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Ver mis citas programadas
            </Link>
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  )
}
