'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import ImmediateHelpModal from '@/components/dashboard/ImmediateHelpModal'
import {
  UserCheck,
  Calendar,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Loader2,
  DollarSign,
  MapPin,
  ShieldCheck,
} from 'lucide-react'

export default function MiProfesionalPage() {
  const [loading, setLoading] = useState(true)
  const [professional, setProfessional] = useState<any>(null)

  useEffect(() => {
    async function loadAssignedProfessional() {
      try {
        const res = await fetch('/api/paciente/mi-profesional')
        if (res.ok) {
          const data = await res.json()
          setProfessional(data.professional || null)
        }
      } catch (err) {
        console.error('Error fetching assigned professional:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAssignedProfessional()
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
          title="Mi profesional"
          description="Detalles de tu terapeuta o especialista de salud mental"
        />

        {!professional ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Todavía no tienes un profesional
            </h3>
            <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              Cuando estés listo/a, podemos ayudarte a encontrar apoyo con psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud.
            </p>
            <Link
              href="/buscar"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition"
            >
              Encontrar apoyo
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center overflow-hidden shrink-0 border border-teal-100">
                {professional.image ? (
                  <Image
                    src={professional.image}
                    alt={professional.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-teal-700">
                    {professional.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {professional.name}
                  </h3>
                  {professional.isFounder && (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                      Profesional Fundador
                    </span>
                  )}
                </div>

                <p className="text-xs text-teal-800 font-medium mb-2">
                  {professional.specialty || 'Psicología Clínica'}
                </p>

                {professional.registroSuperintendencia && (
                  <a
                    href="https://rnpi.superdesalud.gob.cl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>Registro Superintendencia Nº {professional.registroSuperintendencia}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-100 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Modalidad de atención:</p>
                <p className="font-semibold text-slate-800">
                  {professional.modality === 'ONLINE' ? 'Atención Online por Videollamada' : 'Atención Presencial / Mixta'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Tarifa por sesión:</p>
                <p className="font-semibold text-slate-800">
                  ${(professional.sessionPrice || 0).toLocaleString('es-CL')} CLP
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-5">
              <Link
                href="/dashboard/mensajes"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar mensaje</span>
              </Link>
              <Link
                href={`/reservar/${professional.slug || professional.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar nueva sesión</span>
              </Link>
              <Link
                href="/buscar"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 transition ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cambiar de profesional</span>
              </Link>
            </div>
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  )
}
