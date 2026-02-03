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
        <section className="py-6 md:py-10 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-50/50 via-white to-white -z-10" />

            <div className="container-wide">
                <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
                    <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed text-balance">
                        No somos un buscador médico. Somos una plataforma diseñada para
                        <span className="text-primary-700 font-semibold block mt-2">respetar la complejidad de los procesos de salud mental.</span>
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    {differentiators.map((item, index) => (
                        <div
                            key={index}
                            className="group bg-white p-6 md:p-8 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 text-sm md:text-[0.95rem] leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
