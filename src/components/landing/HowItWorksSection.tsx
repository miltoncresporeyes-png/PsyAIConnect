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
        <section id="como-funciona" className="py-16 md:py-24 bg-white">
            <div className="container-wide">
                {/* Encabezado mejorado */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 font-semibold text-sm rounded-full mb-4 uppercase tracking-wide">
                        Para Pacientes
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Cómo funciona
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Un proceso pensado para respetar tu tiempo y tu proceso
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Línea de conexión mejorada (Desktop) */}
                    <div className="hidden lg:block absolute top-20 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-purple-200 via-indigo-200 to-rose-200 -z-10 opacity-40" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="relative bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 h-full">
                                {/* Número con mejor diseño */}
                                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-sm">{step.number}</span>
                                </div>

                                {/* Icono mejorado */}
                                <div className={`w-16 h-16 rounded-xl ${step.iconBg} border-2 ${step.iconBorder} flex items-center justify-center mb-5 ${step.iconHoverBg} ${step.iconHoverBorder} group-hover:scale-110 transition-all duration-300 shadow-sm mt-4`}>
                                    <step.icon className={`w-8 h-8 ${step.iconColor}`} strokeWidth={2} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-base leading-relaxed">
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
