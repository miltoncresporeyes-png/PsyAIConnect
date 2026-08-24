import { Award, Shield, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function AdministrativeValueSection() {
    const t = await getTranslations('adminBanner')
    return (
        <section 
            className="py-8 md:py-10 bg-gradient-to-r from-teal-50 via-white to-cyan-50 border-y border-teal-100/80"
            aria-label={t('title')}
        >
            <div className="container-wide">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-600/20" aria-hidden="true">
                            <Award className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-sm font-semibold text-slate-900">
                                {t('title')}
                            </p>
                            <p className="text-xs text-slate-500">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-teal-200/70" aria-hidden="true" />

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100" aria-hidden="true">
                                <Shield className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            </div>
                            <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                                {t('compliance')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100" aria-hidden="true">
                                <Users className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            </div>
                            <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                                {t('activePros')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
