'use client'

import { Phone, MessageCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

/**
 * Official Emergency Phone Numbers for Chile:
 * - *4141: Línea de Prevención del Suicidio (MINSAL, gratuito 24/7 desde celulares)
 * - 600 360 7777: Salud Responde (MINSAL, orientación médica y psicológica 24/7)
 * - 131: SAMU (Ambulancia y urgencias médicas)
 *
 * NOTE FOR OPS: Validate that numbers remain active according to current MINSAL health guidelines.
 */
const CRISIS_SUICIDE_PHONE = process.env.NEXT_PUBLIC_CRISIS_SUICIDE_PHONE || '*4141'
const CRISIS_FONOSALUD_PHONE = process.env.NEXT_PUBLIC_CRISIS_FONOSALUD_PHONE || '6003607777'
const CRISIS_SAMU_PHONE = process.env.NEXT_PUBLIC_CRISIS_SAMU_PHONE || '131'

export function CrisisBanner() {
  return (
    <div className="w-full max-w-full overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="container-wide py-1.5 sm:py-2 max-w-full">
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-1.5 text-xs sm:text-sm max-w-full">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>¿Emergencia?</span>
          </div>

          {/* Línea prevención suicidio *4141 */}
          <a
            href={`tel:${CRISIS_SUICIDE_PHONE}`}
            className="inline-flex items-center min-h-[44px] px-2 py-1 text-amber-950 font-bold bg-amber-100/80 rounded-md hover:bg-amber-200 transition-colors"
            aria-label="Línea de prevención del suicidio asterisco 4141 disponible 24/7"
          >
            <Phone className="w-3.5 h-3.5 mr-1 text-amber-800" aria-hidden="true" />
            <span>*4141</span>
            <span className="text-[11px] font-normal text-amber-700 ml-1">(24/7)</span>
          </a>

          {/* Salud Responde */}
          <a
            href={`tel:${CRISIS_FONOSALUD_PHONE}`}
            className="inline-flex items-center min-h-[44px] px-2 py-1 text-amber-900 hover:text-amber-700 font-medium transition-colors"
            aria-label="FonoSalud 600 360 7777 atención 24 horas"
          >
            <Phone className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="hidden xs:inline">FonoSalud:</span>
            <span className="font-bold ml-1">600 360 7777</span>
          </a>

          {/* SAMU */}
          <a
            href={`tel:${CRISIS_SAMU_PHONE}`}
            className="inline-flex items-center min-h-[44px] px-2 py-1 text-amber-900 hover:text-amber-700 font-medium transition-colors"
            aria-label="SAMU 131 urgencias"
          >
            <Phone className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="font-bold">131</span>
            <span className="text-amber-600 text-xs ml-1">SAMU</span>
          </a>

          <p className="hidden md:inline text-amber-700 text-xs text-center">
            PsyDoctor no es un servicio de emergencias.
          </p>

          <Link
            href="#chat"
            className="inline-flex items-center min-h-[44px] px-2 py-1 text-teal-700 font-semibold hover:text-teal-800 transition-colors sm:ml-auto"
          >
            <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
            <span>Orientador 24/7</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
