import Link from 'next/link'
import { ArrowRight, Shield, Check, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function CTASection() {
    const t = await getTranslations('cta')
    return (
        <section 
            className="relative overflow-hidden bg-[linear-gradient(135deg,_#0d3d36_0%,_#0f766e_50%,_#134e4a_100%)] py-16 md:py-20"
            aria-labelledby="cta-heading"
        >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
                <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-400/8 blur-3xl" />
            </div>

            <div className="container-wide">
                <div className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-white/[0.07] p-7 text-center shadow-[0_34px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-10">
                    <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50">
                        {t('badge')}
                    </div>

                    <h2 id="cta-heading" className="mx-auto max-w-3xl text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                        {t('heading')}
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/78 md:text-xl">
                        {t('subheading')}
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3" role="list" aria-label={t('heading')}>
                        <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90" role="listitem">{t('tag1')}</div>
                        <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90" role="listitem">{t('tag2')}</div>
                        <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90" role="listitem">{t('tag3')}</div>
                    </div>

                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row" role="group" aria-label={t('ctaPatient')}>
                        <Link 
                            href="/registro?tipo=paciente" 
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-semibold text-slate-900 transition-all shadow-lg hover:-translate-y-0.5 hover:bg-slate-100"
                        >
                            {t('ctaPatient')}
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </Link>
                        <Link 
                            href="/registro?tipo=profesional" 
                            className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-8 py-4 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                        >
                            {t('ctaProfessional')}
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-teal-950/30 p-5">
                            <div className="mb-3 flex items-center gap-2 text-white">
                                <Check className="w-5 h-5 text-emerald-300" aria-hidden="true" />
                                <span className="text-sm font-semibold">{t('card1Title')}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/75">{t('card1Desc')}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-teal-950/30 p-5">
                            <div className="mb-3 flex items-center gap-2 text-white">
                                <Shield className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                                <span className="text-sm font-semibold">{t('card2Title')}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/75">{t('card2Desc')}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-teal-950/30 p-5">
                            <div className="mb-3 flex items-center gap-2 text-white">
                                <Users className="w-5 h-5 text-teal-300" aria-hidden="true" />
                                <span className="text-sm font-semibold">{t('card3Title')}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/75">{t('card3Desc')}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-8" role="list" aria-label={t('heading')}>
                        <div className="flex items-center gap-2" role="listitem">
                            <Check className="w-5 h-5 text-white" aria-hidden="true" />
                            <span className="text-sm text-white/90">{t('trust1')}</span>
                        </div>
                        <div className="flex items-center gap-2" role="listitem">
                            <Shield className="w-5 h-5 text-white" aria-hidden="true" />
                            <span className="text-sm text-white/90">{t('trust2')}</span>
                        </div>
                        <div className="flex items-center gap-2" role="listitem">
                            <Users className="w-5 h-5 text-white" aria-hidden="true" />
                            <span className="text-sm text-white/90">{t('trust3')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
