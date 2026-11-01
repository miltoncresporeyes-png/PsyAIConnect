'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, CheckCircle2, Search } from 'lucide-react'
import { analyticsEvents } from '@/lib/analytics'

export function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-slate-50/50 pb-16 pt-12 md:pb-24 md:pt-20"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-4 shadow-2xs">
              <Shield className="h-3.5 w-3.5 text-teal-700" />
              <span>Plataforma SaaS para Profesionales de Salud Mental · Chile</span>
            </span>

            <h1
              id="hero-heading"
              className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.2]"
            >
              Gestiona tu consulta, organiza tus pacientes y desarrolla tu presencia profesional.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#374151] sm:text-lg">
              La plataforma digital integral para psicólogos y psiquiatras en Chile: agenda médica online, ficha clínica protegida (Ley 20.584) y directorio profesional para conectar con nuevos consultantes.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                Agenda online y teleconsulta segura
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                Fichas clínicas con estándar Ley 20.584
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                Directorio verificado Superintendencia
              </span>
            </div>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Link
                href="/registro?tipo=profesional&programa=fundador"
                onClick={() => analyticsEvents.founderCtaClick('hero_primary')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
              >
                <span>Postula al Programa Fundadores</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/profesionales"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
              >
                Conoce la plataforma
              </Link>
            </div>

            {/* Acceso para pacientes secundario */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 lg:justify-start">
              <span>¿Buscas atención psicológica o psiquiátrica?</span>
              <Link
                href="/buscar"
                className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:text-teal-900 underline underline-offset-2"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Encuentra un especialista en el directorio</span>
              </Link>
            </div>
          </div>

          {/* ── Columna derecha: foto con marco profesional ── */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/hero-connection.jpg"
                    alt="Gestión moderna de consulta médica y psicológica en Chile"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-top"
                    priority
                    quality={90}
                  />
                </div>

                {/* Pie descriptivo del SaaS */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-teal-600" aria-hidden="true" />
                    <span className="text-xs font-semibold text-slate-800">Programa Fundadores · 20 Cupos</span>
                  </div>
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200">12 Meses Gratis</span>
                </div>

                {/* Pilares clave */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/70">
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-semibold text-slate-800">Agenda SaaS</span>
                    <span className="text-[10px] text-slate-500">sin software local</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-semibold text-slate-800">Boletas & Pagos</span>
                    <span className="text-[10px] text-slate-500">en pesos chilenos</span>
                  </div>
                </div>
              </div>

              {/* Nota de privacidad al pie */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>Cumplimiento normativo Ley 20.584 y preparación Ley 21.719</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
