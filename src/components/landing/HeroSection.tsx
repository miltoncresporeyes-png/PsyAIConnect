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
      className="relative w-full overflow-hidden bg-slate-50/50 pb-16 pt-8 md:pb-24 md:pt-14"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700">
                {t('launchBadge')}
              </span>
            </div>

            <h1 id="hero-heading" className="mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[40px] lg:leading-[1.2]">
              {t('headline1')}{' '}
              <span className="text-teal-800">
                {t('headlineHighlight')}
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#374151] sm:text-lg">
              {t('description')}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">{t('chipVerified')}</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">{t('chipOnline')}</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">{t('chipPayments')}</span>
            </div>

            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Link
                href="/registro?tipo=paciente"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
              >
                {t('ctaPatient')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/profesionales"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {t('ctaProfessional')}
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2.5">
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-900">{t('waitlistTitle')}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t('waitlistDesc')}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="beta-email">{t('emailLabel')}</label>
                  <input
                    id="beta-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? t('submitSending') : t('submitBtn')}
                  </button>
                </div>
              </div>

              {message && (
                <div
                  role="alert"
                  className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}
                >
                  {message.text}
                </div>
              )}
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 lg:justify-start">
              <Shield className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>{t('trustProtected')}</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
              <span>{t('trustSchedule')}</span>
            </div>
          </div>

          {/* ── Columna derecha: foto con marco sobrio y datos informativos ── */}
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

                {/* Pie de imagen: texto descriptivo sobrio sin atribuciones equívocas */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-teal-600" aria-hidden="true" />
                    <span className="text-xs font-medium text-slate-700">Espacio de atención online</span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Todo Chile</span>
                </div>

                {/* Métricas discretas */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/70">
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-semibold text-slate-800">Online</span>
                    <span className="text-[10px] text-slate-500">videollamada</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-semibold text-slate-800">100%</span>
                    <span className="text-[10px] text-slate-500">confidencial</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-teal-700" aria-hidden="true" />
                      <span className="text-sm font-semibold text-slate-800">Boleta</span>
                    </div>
                    <span className="text-[10px] text-slate-500">reembolsable</span>
                  </div>
                </div>
              </div>

              {/* Nota de privacidad al pie sin flotantes distractores */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>Datos protegidos bajo Ley 19.628 (adaptada a Ley 21.719)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
