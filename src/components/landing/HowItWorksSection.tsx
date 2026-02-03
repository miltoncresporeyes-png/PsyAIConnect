import { Search, Calendar, LayoutDashboard, ArrowRightLeft } from 'lucide-react'

const steps = [
    {
        number: '01',
        icon: Search,
        title: 'Encuentra orientación',
        description: 'Filtra por especialidad, modalidad y ubicación. Sin llamadas, sin esperas.',
        iconBg: 'bg-emerald-50',
        iconBorder: 'border-emerald-100',
        iconColor: 'text-emerald-700',
        iconHoverBg: 'group-hover:bg-emerald-100',
        iconHoverBorder: 'group-hover:border-emerald-200',
    },
    {
        number: '02',
        icon: Calendar,
        title: 'Agenda cuando quieras',
        description: 'Elige horario, confirma online. Recordatorios automáticos.',
        iconBg: 'bg-indigo-50',
        iconBorder: 'border-indigo-100',
        iconColor: 'text-indigo-700',
        iconHoverBg: 'group-hover:bg-indigo-100',
        iconHoverBorder: 'group-hover:border-indigo-200',
    },
    {
        number: '03',
        icon: LayoutDashboard,
        title: 'Tu espacio personal',
        description: 'Historial de sesiones, notas compartidas, todo en un lugar.',
        iconBg: 'bg-violet-50',
        iconBorder: 'border-violet-100',
        iconColor: 'text-violet-700',
        iconHoverBg: 'group-hover:bg-violet-100',
        iconHoverBorder: 'group-hover:border-violet-200',
    },
    {
        number: '04',
        icon: ArrowRightLeft,
        title: 'Continuidad garantizada',
        description: 'Si cambias de profesional, tu proceso no se pierde.',
        iconBg: 'bg-rose-50',
        iconBorder: 'border-rose-100',
        iconColor: 'text-rose-700',
        iconHoverBg: 'group-hover:bg-rose-100',
        iconHoverBorder: 'group-hover:border-rose-200',
    },
]

export function HowItWorksSection() {
    return (
        <section id="como-funciona" className="section pt-4 pb-12 bg-gradient-to-b from-white via-secondary-50/30 to-white">
            <div className="container-wide">
                <div className="max-w-2xl mb-12">
                    <span className="text-primary-600 font-bold text-xs uppercase tracking-[0.15em] mb-4 block">
                        PARA PACIENTES
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-2 text-balance">
                        Cómo funciona
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mb-8">
                        Un proceso pensado para respetar tu tiempo y tu proceso.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[88px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="relative bg-white">
                                {/* Number */}
                                <div className="text-[10px] font-bold text-gray-400 mb-6 font-mono tracking-widest pl-1">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-[1.25rem] ${step.iconBg} border ${step.iconBorder} flex items-center justify-center mb-6 ${step.iconHoverBg} ${step.iconHoverBorder} group-hover:scale-105 transition-all duration-300`}>
                                    <step.icon className={`w-7 h-7 ${step.iconColor} transition-colors`} strokeWidth={1.5} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 text-[0.95rem] leading-relaxed pr-4">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
