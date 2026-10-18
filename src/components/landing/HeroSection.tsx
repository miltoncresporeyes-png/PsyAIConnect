'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'
import { PatientWaitlistModal } from '@/components/waitlist/PatientWaitlistModal'

export function HeroSection() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-50/50 pb-16 pt-12 md:pb-24 md:pt-20"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <h1
              id="hero-heading"
              className="max-w-2xl text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px] lg:leading-[1.25]"
            >
              Psicólogos y psiquiatras inscritos en el registro oficial. Atención online en todo Chile.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#374151] sm:text-lg">
              Reserva con precios claros desde el inicio y recibe boleta para solicitar reembolso a tu Isapre, según tu plan. Tus datos de salud están protegidos por la ley chilena.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                Inscritos en el Registro de la Superintendencia de Salud
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                Terapia online en todo Chile
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                Pagos seguros en CLP
              </span>
            </div>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsWaitlistOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 cursor-pointer"
              >
                <span>Avísame cuando abran</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link
                href="/registro?tipo=profesional"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Unirme como Profesional Fundador
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 lg:justify-start">
              <Shield className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Diseñada considerando la normativa chilena de protección de datos y derechos del paciente.</span>
            </div>
          </div>

          {/* ── Columna derecha: foto con marco neutro ── */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/hero-connection.jpg"
                    alt="Atención y acompañamiento en salud mental"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-top"
                    priority
                    quality={90}
                  />
                </div>

                {/* Pie de imagen: texto descriptivo neutro */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-teal-600" aria-hidden="true" />
                    <span className="text-xs font-medium text-slate-700">Atención online, a tu ritmo</span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Todo Chile</span>
                </div>

                {/* Métricas discretas y neutrales */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/70">
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-semibold text-slate-800">Online</span>
                    <span className="text-[10px] text-slate-500">videollamada segura</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-semibold text-slate-800">Boleta</span>
                    <span className="text-[10px] text-slate-500">para reembolso Isapre</span>
                  </div>
                </div>
              </div>

              {/* Nota de privacidad al pie */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>Cifrado en tránsito (TLS) y en reposo (AES-256)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PatientWaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        title="Lista de espera de pacientes"
        subtitle="Déjanos tus datos y te avisaremos cuando abramos disponibilidad en tu zona."
      />
    </section>
  )
}
