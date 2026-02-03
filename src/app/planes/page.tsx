import { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Zap, Crown, ArrowLeft } from 'lucide-react'
import { Header, Footer } from '@/components/layout'

export const metadata: Metadata = {
    title: 'Planes para Profesionales | PsyConnect',
    description: 'Elige el plan perfecto para tu práctica profesional. Planes flexibles desde $0. Sin compromisos, cancela cuando quieras.',
}

const plans = [
    {
        name: 'FREE',
        price: '$0',
        period: '',
        description: 'Ideal para comenzar tu presencia online',
        icon: Zap,
        featured: false,
        features: [
            'Perfil profesional básico',
            'Hasta 5 citas por mes',
            'Agenda online simple',
            'Notificaciones por email',
            'Soporte por email',
        ],
        cta: 'Comenzar gratis',
    },
    {
        name: 'PRO',
        price: '$29.000',
        period: '/ mes',
        description: 'Para profesionales en crecimiento',
        icon: Sparkles,
        featured: true,
        features: [
            'Todo lo de FREE, más:',
            'Citas ilimitadas',
            'Recordatorios automáticos',
            'Ficha clínica digital',
            'Estadísticas básicas',
            'Integración con calendario',
            'Soporte prioritario',
        ],
        cta: 'Elegir PRO',
    },
    {
        name: 'PREMIUM',
        price: '$59.000',
        period: '/ mes',
        description: 'Funcionalidades completas para tu práctica',
        icon: Crown,
        featured: false,
        features: [
            'Todo lo de PRO, más:',
            'Múltiples ubicaciones',
            'Teleconsulta integrada',
            'Facturación automática',
            'Reportes avanzados',
            'API personalizada',
            'Soporte dedicado 24/7',
            'Onboarding personalizado',
        ],
        cta: 'Elegir PREMIUM',
    },
]

export default function PlanesPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-gradient-to-b from-secondary-50 to-white">
                <div className="container-wide py-12 md:py-20">
                    {/* Back link */}
                    <Link
                        href="/#para-profesionales"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-900 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a inicio
                    </Link>

                    {/* Header */}
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-900 text-sm font-medium mb-4">
                            <Sparkles className="w-4 h-4" />
                            Planes para profesionales
                        </span>
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
                            Elige el plan perfecto para ti
                        </h1>
                        <p className="text-lg text-gray-600">
                            Sin compromisos. Cancela cuando quieras. Comienza gratis hoy.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${plan.featured
                                        ? 'bg-primary-900 text-white shadow-2xl shadow-primary-900/25 scale-105 z-10'
                                        : 'bg-white border border-secondary-200 shadow-sm hover:shadow-lg'
                                    }`}
                            >
                                {/* Featured Badge */}
                                {plan.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                            MÁS POPULAR
                                        </span>
                                    </div>
                                )}

                                {/* Plan Icon & Name */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.featured ? 'bg-white/20' : 'bg-secondary-100'
                                        }`}>
                                        <plan.icon className={`w-5 h-5 ${plan.featured ? 'text-white' : 'text-primary-900'
                                            }`} />
                                    </div>
                                    <span className={`text-xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {plan.name}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className={`text-sm ${plan.featured ? 'text-white/70' : 'text-gray-500'
                                            }`}>
                                            {plan.period}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className={`text-sm mb-6 ${plan.featured ? 'text-white/80' : 'text-gray-600'
                                    }`}>
                                    {plan.description}
                                </p>

                                {/* Divider */}
                                <div className={`h-px mb-6 ${plan.featured ? 'bg-white/20' : 'bg-secondary-200'
                                    }`} />

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.featured ? 'text-green-400' : 'text-green-600'
                                                }`} />
                                            <span className={`text-sm ${plan.featured ? 'text-white/90' : 'text-gray-700'
                                                }`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Link
                                    href="/registro?tipo=profesional"
                                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 text-center block ${plan.featured
                                            ? 'bg-white text-primary-900 hover:bg-gray-100'
                                            : 'border-2 border-primary-900 text-primary-900 hover:bg-primary-50'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Trust Note */}
                    <div className="mt-16 text-center">
                        <p className="text-sm text-gray-500 mb-6">
                            Todos los planes incluyen SSL, respaldo de datos y cumplimiento HIPAA.
                        </p>

                        {/* FAQ Link */}
                        <div className="bg-white rounded-2xl border border-secondary-200 p-8 max-w-2xl mx-auto">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                ¿Tienes preguntas?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Estamos aquí para ayudarte a elegir el plan que mejor se adapte a tu práctica.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/registro?tipo=profesional"
                                    className="btn-primary"
                                >
                                    Comenzar gratis
                                </Link>
                                <a
                                    href="mailto:contacto@psyconnect.cl"
                                    className="btn-outline"
                                >
                                    Contáctanos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}
