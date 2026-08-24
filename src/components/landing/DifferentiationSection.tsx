import { Stethoscope, User, Target, Clock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const iconList = [Stethoscope, User, Target, Clock]
const styles = [
    { iconBg: 'bg-teal-50',    iconColor: 'text-teal-600',    borderAccent: 'border-l-[3px] border-l-teal-400',    bgGradient: 'bg-gradient-to-br from-white to-teal-50/40' },
    { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', borderAccent: 'border-l-[3px] border-l-emerald-400', bgGradient: 'bg-gradient-to-br from-white to-emerald-50/40' },
    { iconBg: 'bg-cyan-50',    iconColor: 'text-cyan-600',    borderAccent: 'border-l-[3px] border-l-cyan-400',    bgGradient: 'bg-gradient-to-br from-white to-cyan-50/40' },
    { iconBg: 'bg-teal-50/80', iconColor: 'text-teal-500',    borderAccent: 'border-l-[3px] border-l-teal-300',    bgGradient: 'bg-gradient-to-br from-white to-teal-50/30' },
]

export async function DifferentiationSection() {
    const t = await getTranslations('differentiation')
    const items = t.raw('items') as Array<{ title: string; description: string }>

    return (
        <section 
            className="py-16 md:py-20 bg-white"
            aria-labelledby="differentiators-heading"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(20,184,166,0.04) 0%, transparent 60%)' }}
        >
            <div className="container-wide">
                <header className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
                    <p className="text-sm font-semibold text-teal-600 mb-3 tracking-wide uppercase">
                        {t('sectionLabel')}
                    </p>
                    <h2 id="differentiators-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('heading')}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t('subheading')}{' '}
                        <span className="font-semibold text-gray-900">{t('subheadingBold')}</span>
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="list" aria-label={t('sectionLabel')}>
                    {items.map((item, index) => {
                        const Icon = iconList[index]
                        const s = styles[index]
                        return (
                            <article 
                                key={index}
                                className={`flex flex-col ${s.bgGradient} p-7 rounded-3xl border border-slate-100/80 ${s.borderAccent} shadow-sm hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-0.5 transition-all duration-300`}
                                role="listitem"
                            >
                                <div 
                                    className={`w-14 h-14 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 ${s.iconColor} shadow-md`}
                                    aria-hidden="true"
                                >
                                    <Icon className="w-7 h-7" strokeWidth={2} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
