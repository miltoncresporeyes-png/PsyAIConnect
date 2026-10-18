'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react'
import { useBetaWaitlist } from '@/lib/hooks/useBetaWaitlist'
import { useTranslations } from 'next-intl'

export function HeroSection() {
  const { message, handleSubmit, email, setEmail, isSubmitting } = useBetaWaitlist()
  const t = useTranslations('hero')

  return (
    <section
      className="relative w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(34,211,238,0.18),_transparent_24%),linear-gradient(180deg,_#f8fffe_0%,_#ffffff_58%,_#f6fbfb_100%)] pb-12 lg:pb-20"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
      </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 items-center gap-10 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pt-16">
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-200/70 bg-white/80 px-4 py-2 shadow-sm shadow-teal-100/40 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-700">
                {t('launchBadge')}
              </span>
            </div>

            <h1 id="hero-heading" className="mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
              {t('headline1')}
              <span className="bg-gradient-to-r from-teal-700 via-teal-500 to-cyan-500 bg-clip-text text-transparent"> {t('headlineHighlight')}</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              {t('description')}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">{t('chipVerified')}</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">{t('chipOnline')}</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">{t('chipPayments')}</span>
            </div>

             <div className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <Link
                href="/registro?tipo=paciente"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {t('ctaPatient')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/registro?tipo=profesional"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:text-teal-700"
              >
                {t('ctaProfessional')}
              </Link>
            </div>

             <form onSubmit={handleSubmit} className="mt-5 w-full max-w-2xl rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="flex flex-col gap-3">
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">{t('waitlistTitle')}</p>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{t('waitlistDesc')}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="beta-email">{t('emailLabel')}</label>
                  <input
                    id="beta-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 whitespace-nowrap rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? t('submitSending') : t('submitBtn')}
                  </button>
                </div>
              </div>

              {message && (
                <div
                  role="alert"
                  className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}
                >
                  {message.text}
                </div>
              )}
            </form>

             <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500 lg:justify-start">
              <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
              <span>{t('trustProtected')}</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
              <span>{t('trustSchedule')}</span>
            </div>
          </div>

          {/* ── Columna derecha: imagen limpia + stats bajo la foto ── */}
          <div className="order-1 flex justify-center lg:order-2">
            {/* Halo de fondo */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-teal-200 via-cyan-100 to-teal-300 opacity-50 blur-3xl sm:h-[440px] sm:w-[440px]" aria-hidden="true" />

            <div className="relative w-full max-w-md">
              {/* Tarjeta principal */}
              <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.12)]">

                {/* Imagen — completamente libre de overlays */}
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/hero-connection.jpg"
                    alt="Profesional de salud mental sonriente, representando una conexión terapéutica de calidad"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-top"
                    priority
                    quality={90}
                  />
                </div>

                {/* Strip de estado debajo de la imagen */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span className="text-xs font-semibold text-slate-700">{t('statsProfessionals')}</span>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">{t('statsBeta')}</span>
                </div>

                {/* Métricas en fila */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
                  <div className="flex flex-col items-center py-3">
                    <span className="text-base font-bold text-slate-900">{t('stats24h')}</span>
                    <span className="text-[10px] text-slate-500">{t('statsAgenda')}</span>
                  </div>
                  <div className="flex flex-col items-center py-3">
                    <span className="text-base font-bold text-slate-900">100%</span>
                    <span className="text-[10px] text-slate-500">{t('statsConfidential')}</span>
                  </div>
                  <div className="flex flex-col items-center py-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                      <span className="text-base font-bold text-slate-900">CLP</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{t('statsLocalPayment')}</span>
                  </div>
                </div>
              </div>

              {/* Pill flotante — fuera de la tarjeta, esquina inferior derecha, sin pisar la imagen */}
              <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:block">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t('privacyTitle')}</p>
                    <p className="text-[10px] text-slate-500">{t('privacyLaw')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
