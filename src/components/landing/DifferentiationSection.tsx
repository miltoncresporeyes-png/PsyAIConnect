import { Stethoscope, User, Target, Clock } from 'lucide-react'

const differentiators = [
    {
        icon: Stethoscope,
        title: 'Continuidad real',
        description: 'Tu historial viaja contigo entre profesionales. No vuelves a empezar de cero.',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
    },
    {
        icon: User,
        title: 'Tú decides',
        description: 'Control total sobre qué información compartes y con quién.',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        icon: Target,
        title: 'Sin prueba y error',
        description: 'Información clara para tomar decisiones informadas, no adivinanzas.',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
    },
    {
        icon: Clock,
        title: 'Tu ritmo',
        description: 'Sin presión. Avanzas cuando estés listo.',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
    },
]

export function DifferentiationSection() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
            {/* Background decoration mejorada */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(147,51,234,0.03)_0%,_transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(79,70,229,0.03)_0%,_transparent_50%)] pointer-events-none" />

            <div className="container-wide relative z-10">
                {/* Título mejorado */}
                <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
                    <p className="text-base font-semibold text-purple-600 mb-3 tracking-wide uppercase">Por qué somos diferentes</p>
                    <h2 className="text-2xl md:text-4xl text-gray-900 font-bold leading-tight mb-4">
                        No somos un buscador médico
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Somos una plataforma diseñada para{' '}
                        <span className="text-gray-900 font-semibold">respetar la complejidad de los procesos de salud mental</span>
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {differentiators.map((item, index) => (
                        <div
                            key={index}
                            className="group bg-white p-7 md:p-8 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-5 ${item.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                <item.icon className="w-7 h-7" strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
