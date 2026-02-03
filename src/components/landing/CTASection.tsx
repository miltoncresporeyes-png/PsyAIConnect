import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
    return (
        <section className="py-6 md:py-8 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-primary-800/30 blur-3xl rounded-full pointer-events-none" />

            <div className="container-narrow text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 tracking-tight text-white">
                    Empieza cuando estés listo
                </h2>
                <p className="text-lg md:text-xl text-primary-100/90 mb-10 max-w-xl mx-auto leading-relaxed text-balance">
                    Sin compromiso. Sin presión. Un espacio diseñado para respetar tu proceso.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <Link href="/registro?tipo=paciente" className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-medium px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg shadow-primary-900/20">
                        Buscar apoyo
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/registro?tipo=profesional" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-white border border-white/20 hover:bg-white/10 transition-colors">
                        Soy profesional
                    </Link>
                </div>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-primary-200/70 font-medium">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Profesionales verificados
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Datos protegidos
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Sin costos ocultos
                    </span>
                </div>
            </div>
        </section>
    )
}
