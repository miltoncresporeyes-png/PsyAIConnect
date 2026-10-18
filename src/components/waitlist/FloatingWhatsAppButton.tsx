'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageCircle,
  X,
  Clock,
  ArrowRight,
  User,
  Stethoscope,
  Send,
  HelpCircle,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { track } from '@/lib/track'

type UserProfile = 'patient' | 'professional' | null
type Step = 'select_profile' | 'filter_question' | 'out_of_hours_capture' | 'ready_to_connect'

export function FloatingWhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(null)
  const [selectedIntent, setSelectedIntent] = useState<string>('')
  const [step, setStep] = useState<Step>('select_profile')
  const [leadDetail, setLeadDetail] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWithinHours, setIsWithinHours] = useState(true)
  const [currentTimeStr, setCurrentTimeStr] = useState('')

  // Número oficial de WhatsApp de PsyDoctor
  const whatsappNumber = '56983414730'

  // Verificar horario laboral en Chile (09:00 a 19:00 hrs)
  useEffect(() => {
    const checkChileTime = () => {
      try {
        const now = new Date()
        // Formatear hora de Chile (America/Santiago)
        const chileTimeStr = now.toLocaleTimeString('es-CL', {
          timeZone: 'America/Santiago',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        const [hourStr, minStr] = chileTimeStr.split(':')
        const currentHour = parseInt(hourStr, 10)
        const dayOfWeek = now.toLocaleDateString('es-CL', {
          timeZone: 'America/Santiago',
          weekday: 'short',
        }).toLowerCase()

        // Horario de atención activa: Lunes a Viernes de 9:00 a 19:00
        const isWeekday = !dayOfWeek.startsWith('sáb') && !dayOfWeek.startsWith('dom') && !dayOfWeek.startsWith('sat') && !dayOfWeek.startsWith('sun')
        const inWorkHours = isWeekday && currentHour >= 9 && currentHour < 19

        setIsWithinHours(inWorkHours)
        setCurrentTimeStr(`${chileTimeStr} hrs (Chile)`)
      } catch {
        // Fallback horario local
        const localHour = new Date().getHours()
        setIsWithinHours(localHour >= 9 && localHour < 19)
      }
    }

    checkChileTime()
    const timer = setInterval(checkChileTime, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    track('click_whatsapp', { source: 'floating_widget_open' })
  }

  const handleClose = () => {
    setIsOpen(false)
    // Mantener estado o resetear tras cerrar
  }

  const handleSelectProfile = (selected: UserProfile) => {
    setProfile(selected)
    setStep('filter_question')
    track('click_whatsapp', { source: `select_profile_${selected}` })
  }

  const handleSelectIntent = (intentLabel: string, intentText: string) => {
    setSelectedIntent(intentText)
    if (isWithinHours) {
      // En horario de atención: conectar directo con el mensaje filtrado y estructurado
      redirectToWhatsApp(profile, intentText)
    } else {
      // Fuera de horario: captura inteligente para respuesta a primera hora
      setStep('out_of_hours_capture')
    }
  }

  const redirectToWhatsApp = (prof: UserProfile, intentMessage: string, extraNote?: string) => {
    const greeting = isWithinHours
      ? '¡Hola equipo PsyDoctor!'
      : 'Hola equipo PsyDoctor (Mensaje fuera de horario)'

    const roleTag = prof === 'professional' ? '[Profesional de la Salud]' : '[Paciente / Consulta]'
    const timeNote = !isWithinHours ? `\nDejo mi consulta para ser atendido/a al inicio de la jornada de mañana.` : ''
    const detailNote = extraNote ? `\nDetalle: ${extraNote}` : ''
    const contactNote = contactInfo ? `\nContacto preferente: ${contactInfo}` : ''

    const fullMessage = `${greeting} ${roleTag}\n${intentMessage}${detailNote}${contactNote}\nSitio web: psydoctor.cl`

    track('click_whatsapp', {
      source: 'whatsapp_redirect',
      profile: prof,
      isWithinHours,
    })

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`, '_blank', 'noopener,noreferrer')
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactInfo.trim() && !leadDetail.trim()) return

    setIsSubmitting(true)
    try {
      // Intentar guardar como lead prioritario en endpoint de waitlist / contacto
      await fetch('/api/beta-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactInfo.includes('@') ? contactInfo : `whatsapp_${Date.now()}@lead.psydoctor.cl`,
          role: profile === 'professional' ? 'PROFESSIONAL' : 'PATIENT',
          notes: `[WhatsApp Lead Fuera de Horario] Consulta: ${selectedIntent}. Detalle: ${leadDetail}. Contacto: ${contactInfo}`,
        }),
      }).catch(() => null)

      setIsSent(true)
      setIsSubmitting(false)

      // También abrir WhatsApp opcionalmente para que le quede el chat registrado en su teléfono
      setTimeout(() => {
        redirectToWhatsApp(profile, selectedIntent, leadDetail)
      }, 1200)
    } catch {
      setIsSent(true)
      setIsSubmitting(false)
      redirectToWhatsApp(profile, selectedIntent, leadDetail)
    }
  }

  const resetFlow = () => {
    setProfile(null)
    setSelectedIntent('')
    setStep('select_profile')
    setLeadDetail('')
    setContactInfo('')
    setIsSent(false)
  }

  // Opciones de filtrado inteligente para Pacientes
  const patientIntents = [
    {
      id: 'buscar_profesional',
      icon: <User className="w-4 h-4 text-teal-700" />,
      label: 'Buscar psicólogo o psiquiatra',
      text: 'Hola, busco atención con un profesional de la salud mental según mi motivo de consulta.',
    },
    {
      id: 'dudas_precios',
      icon: <FileText className="w-4 h-4 text-teal-700" />,
      label: 'Precios y boleta para Isapre',
      text: 'Hola, quisiera información sobre los precios de las sesiones y la boleta para reembolso en Isapre o seguro.',
    },
    {
      id: 'agendamiento',
      icon: <Calendar className="w-4 h-4 text-teal-700" />,
      label: 'Agendamiento o citas online',
      text: 'Hola, necesito orientación para coordinar o consultar sobre una cita de teleatención.',
    },
    {
      id: 'otro_paciente',
      icon: <HelpCircle className="w-4 h-4 text-teal-700" />,
      label: 'Otra consulta o hablar con ejecutivo',
      text: 'Hola, tengo una duda específica sobre la plataforma y me gustaría asistencia directa.',
    },
  ]

  // Opciones de filtrado inteligente para Profesionales
  const professionalIntents = [
    {
      id: 'unirme_fundadores',
      icon: <Sparkles className="w-4 h-4 text-teal-700" />,
      label: 'Programa Profesionales Fundadores',
      text: 'Hola, soy psicólogo/psiquiatra con inscripción en la Superintendencia y me interesa postular al Programa Fundadores.',
    },
    {
      id: 'software_planes',
      icon: <FileText className="w-4 h-4 text-teal-700" />,
      label: 'Planes, comisiones y ficha clínica',
      text: 'Hola, quisiera conocer más sobre el software de gestión de agenda, ficha clínica y condiciones para profesionales.',
    },
    {
      id: 'soporte_profesional',
      icon: <HelpCircle className="w-4 h-4 text-teal-700" />,
      label: 'Soporte o activación de cuenta',
      text: 'Hola, ya tengo un perfil o estoy en proceso de validación y necesito asistencia con mi cuenta.',
    },
  ]

  return (
    <aside
      aria-label="Asistente WhatsApp de PsyDoctor"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end"
    >
      {/* Ventana de Asistente Conversacional */}
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-5.5rem)] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header Superior del Chat */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-3.5 sm:p-4 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xs">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  </div>
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${isWithinHours ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight">Asistente WhatsApp · PsyDoctor</h3>
                  <p className="text-[10px] sm:text-[11px] text-teal-200 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 inline-block" />
                    {isWithinHours ? 'Conectado ahora · Respuestas en minutos' : 'Fuera de horario · Atención 09:00 - 19:00'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar ventana de WhatsApp"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Aviso de atención humana / disponibilidad */}
            <div className="mt-2.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-[10px] sm:text-[11px] text-teal-100 flex items-start gap-1.5">
              <span className="font-medium text-white shrink-0">🕒 Horario:</span>
              <span>Lunes a Viernes de 09:00 a 19:00 hrs. {isWithinHours ? 'Equipo activo.' : 'Deja tu consulta y la responderemos prioritariamente.'}</span>
            </div>
          </div>

          {/* Cuerpo del Asistente */}
          <div className="p-3.5 sm:p-4 bg-slate-50/70 flex-1 overflow-y-auto overscroll-contain flex flex-col gap-2.5 text-xs sm:text-sm">
            {/* Mensaje de bienvenida inicial */}
            <div className="rounded-2xl rounded-tl-none bg-white p-3.5 shadow-xs border border-slate-100 text-slate-800 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">¡Hola! Qué gusto saludarte 👋</p>
              <p className="text-slate-600">
                Para derivarte con la persona adecuada y darte una respuesta certera sin demoras, cuéntanos:
              </p>
            </div>

            {/* PASO 1: Selección de Perfil */}
            {step === 'select_profile' && (
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-1">
                  ¿Cómo te gustaría identificarte?
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectProfile('patient')}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-teal-700 hover:bg-teal-50/50 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-teal-900">Soy Paciente</p>
                    <p className="text-[11px] text-slate-500 truncate">Busco atención psicológica o psiquiátrica</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-700 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectProfile('professional')}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-teal-700 hover:bg-teal-50/50 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-teal-900">Soy Profesional de la Salud</p>
                    <p className="text-[11px] text-slate-500 truncate">Inscrito en la Superintendencia de Salud</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-700 transition" />
                </button>
              </div>
            )}

            {/* PASO 2: Pregunta filtro según perfil */}
            {step === 'filter_question' && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {profile === 'patient' ? 'Selecciona tu motivo principal' : 'Asunto para profesionales'}
                  </p>
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="text-[11px] text-teal-700 hover:underline"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  {(profile === 'patient' ? patientIntents : professionalIntents).map((intent) => (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => handleSelectIntent(intent.label, intent.text)}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs transition hover:border-teal-700 hover:bg-teal-50/40 group"
                    >
                      <div className="mt-0.5 shrink-0">{intent.icon}</div>
                      <span className="font-medium text-slate-800 group-hover:text-teal-900 flex-1 leading-snug">
                        {intent.label}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-700 shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 3: Captura inteligente FUERA DE HORARIO para no perder Leads */}
            {step === 'out_of_hours_capture' && !isSent && (
              <form onSubmit={handleLeadSubmit} className="flex flex-col gap-3 mt-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-900 leading-normal border border-amber-200/60">
                  <p className="font-semibold mb-0.5">Estamos fuera del horario de atención activa ({currentTimeStr}).</p>
                  <p className="text-amber-800">
                    No te preocupes: deja tu teléfono o correo y el detalle de tu consulta. Tu mensaje quedará agendado con máxima prioridad para atenderte apenas comience la jornada (09:00 hrs).
                  </p>
                </div>

                <div>
                  <label htmlFor="lead-contact" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tu WhatsApp o Correo electrónico <span className="text-teal-700">*</span>
                  </label>
                  <input
                    id="lead-contact"
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="+569... o tu@correo.cl"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="lead-detail" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ¿Algo en específico que debamos saber con anticipación? (opcional)
                  </label>
                  <textarea
                    id="lead-detail"
                    rows={2}
                    value={leadDetail}
                    onChange={(e) => setLeadDetail(e.target.value)}
                    placeholder="Ej: Tengo Isapre Colmena, busco terapia para adultos los días sábado..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-700 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#20bd5a] transition disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Guardando consulta...' : 'Enviar y abrir WhatsApp'}
                  </button>
                </div>
              </form>
            )}

            {/* Confirmación de recepción fuera de horario */}
            {isSent && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center text-emerald-900 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="font-semibold text-xs sm:text-sm">¡Consulta registrada con prioridad!</p>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Tu mensaje ya está en cola prioritaria. También hemos abierto tu chat de WhatsApp para que tengas el respaldo en tu teléfono. Te responderemos a primera hora desde las 09:00 hrs.
                </p>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="mt-3 text-xs font-semibold text-emerald-900 underline"
                >
                  Hacer otra consulta
                </button>
              </div>
            )}
          </div>

          {/* Footer de la ventanita con aviso de urgencias obligatorio */}
          <div className="border-t border-slate-100 bg-white px-3.5 py-2.5 text-center text-[10px] text-slate-500">
            ¿Emergencia de salud mental? Llama gratis al <strong className="text-slate-800">*4141</strong> o acude a urgencias.
          </div>
        </div>
      )}

      {/* Botón Flotante de WhatsApp */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        aria-label="Abrir asistente de WhatsApp"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 motion-reduce:transform-none relative"
      >
        <span className="sr-only">Contactar por WhatsApp</span>
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7 fill-current" aria-hidden="true" />
            {/* Indicador de estado */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWithinHours ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white ${isWithinHours ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
          </>
        )}
      </button>
    </aside>
  )
}
