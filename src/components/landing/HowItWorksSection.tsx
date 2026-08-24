import { Search, Calendar, LayoutDashboard, ArrowRightLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const iconList = [Search, Calendar, LayoutDashboard, ArrowRightLeft]
const stepNumbers = ['01', '02', '03', '04']
const stepStyles = [
    { iconBg: 'bg-teal-50',    iconBorder: 'border-teal-200',    iconColor: 'text-teal-700',    cardBg: 'bg-white', accentBorder: 'hover:border-teal-300 hover:shadow-teal-100/60' },
    { iconBg: 'bg-cyan-50',    iconBorder: 'border-cyan-200',    iconColor: 'text-cyan-700',    cardBg: 'bg-white', accentBorder: 'hover:border-cyan-300 hover:shadow-cyan-100/60' },
    { iconBg: 'bg-emerald-50', iconBorder: 'border-emerald-200', iconColor: 'text-emerald-700', cardBg: 'bg-white', accentBorder: 'hover:border-emerald-300 hover:shadow-emerald-100/60' },
    { iconBg: 'bg-teal-50/70', iconBorder: 'border-teal-100',    iconColor: 'text-teal-600',    cardBg: 'bg-white', accentBorder: 'hover:border-teal-200 hover:shadow-teal-100/50' },
]

export async function HowItWorksSection() {
    const t = await getTranslations('howItWorks')
    const steps = t.raw('steps') as Array<{ title: string; description: string }>

    return (
        <section 
            id="como-funciona"
            className="py-16 md:py-20 bg-slate-50"
            aria-labelledby="how-it-works-heading"
        >
            <div className="container-wide">
                <header className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
                    <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 font-semibold text-sm rounded-full mb-4 uppercase tracking-wide">
                        {t('sectionLabel')}
                    </span>
                    <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('heading')}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t('subheading')}
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {steps.map((step, index) => {
                        const Icon = iconList[index]
                        const s = stepStyles[index]
                        return (
                            <article 
                                key={index}
                                className={`relative flex flex-col ${s.cardBg} p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg ${s.accentBorder} hover:-translate-y-0.5 transition-all duration-300`}
                            >
                                <div 
                                    className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                                    aria-hidden="true"
                                >
                                    <span className="text-white text-sm font-bold">{stepNumbers[index]}</span>
                                </div>

                                <div 
                                    className={`w-16 h-16 rounded-xl ${s.iconBg} border-2 ${s.iconBorder} flex items-center justify-center mb-4 shadow-md`}
                                    aria-hidden="true"
                                >
                                    <Icon className={`w-8 h-8 ${s.iconColor}`} strokeWidth={2} />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
