import { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Zap, Crown, HelpCircle } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { BackButton } from '@/components/ui/BackButton'

export const metadata: Metadata = {
    title: 'Software y Agenda para Psicólogos en Chile | Planes | PsyDoctor',
    description: 'Encuentra el plan de software médico, agenda online y ficha clínica digital ideal para tu consulta. Pruébalo gratis y agiliza la atención de tus pacientes.',
    alternates: {
        canonical: 'https://psydoctor.cl/planes',
    },
}

const plans = [
    {
        name: 'FREE',
        price: '$0',
        period: ' gratis para siempre',
        description: 'Ideal para comenzar a digitalizar tu consulta independiente.',
        icon: Zap,
        featured: false,
        features: [
            'Perfil profesional en el directorio',
            'Agenda médica online básica',
            'Hasta 5 reservas de citas al mes',
            'Notificaciones de confirmación por email',
            'Soporte estándar por correo',
        ],
        cta: 'Comenzar Gratis',
    },
    {
        name: 'PRO',
        price: '$29.000',
        period: '/ mes',
        description: 'Para profesionales independientes con consulta activa.',
        icon: Sparkles,
        featured: true,
        features: [
            'Todo lo de FREE, más:',
            'Citas y agenda online ilimitadas',
            'Recordatorios automáticos por WhatsApp y Email (Evita no-shows)',
            'Ficha clínica digital protegida (Ley N° 20.584)',
            'Teleconsulta integrada de alta definición',
            'Sincronización con Google Calendar',
            'Soporte técnico prioritario',
        ],
        cta: 'Elegir Plan PRO',
    },
    {
        name: 'PREMIUM',
        price: '$59.000',
        period: '/ mes',
        description: 'Herramientas de automatización total para tu consulta médica.',
        icon: Crown,
        featured: false,
        features: [
            'Todo lo de PRO, más:',
            'Emisión automática de boletas de honorarios (Conexión SII Chile)',
            'Múltiples sucursales y ubicaciones',
            'Estadísticas y reportes contables avanzados',
            'Priorización y destacado en el directorio',
            'Asistente de onboarding y migración de datos gratis',
            'Soporte exclusivo y personalizado 24/7',
        ],
        cta: 'Elegir Plan PREMIUM',
    },
]

export default function PlanesPage() {
    return (
        <>
            <Header />

            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: '¿Los planes de PsyDoctor tienen permanencia?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'No, no hay contratos a largo plazo ni permanencia mínima. Puedes cancelar, cambiar o pausar tu suscripción en cualquier momento directamente desde tu panel de profesional.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: '¿PsyDoctor cumple con la Ley de Deberes y Derechos de los Pacientes en Chile?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Sí, todas nuestras herramientas de ficha clínica digital cumplen rigurosamente con la Ley N° 20.584 y la Ley N° 19.628 de protección de datos personales. Las notas clínicas están protegidas bajo cifrado AES-256.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: '¿Cómo funciona la integración de boletas de honorarios con el SII?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'En el plan PREMIUM, al finalizar cada consulta de un paciente, la plataforma genera automáticamente el borrador de la boleta de honorarios en el SII de Chile según las tarifas correspondientes, ahorrándote horas de administración.',
                                },
                            },
                        ],
                    }),
                }}
            />

            <main className="min-h-screen page-shell bg-gray-50/50 py-12">
                <div className="page-frame max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BackButton href="/#para-profesionales" variant="chevron" className="mb-8" />

                    {/* Header */}
                    <div className="page-intro max-w-3xl mx-auto text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-100 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            Potencia tu consulta clínica
                        </span>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 tracking-tight mb-4">
                            El software médico y agenda que tu consulta necesita
                        </h1>
                        <p className="text-lg text-gray-600">
                            Prueba gratis, simplifica tu administración y enfócate en el bienestar de tus pacientes. Sin contratos forzosos.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch mb-16">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative rounded-3xl p-8 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                                    plan.featured
                                        ? 'bg-teal-950 text-white shadow-xl shadow-teal-950/20 md:scale-[1.03] z-10 border border-teal-800'
                                        : 'bg-white border border-gray-200 shadow-sm'
                                }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 text-xs font-extrabold px-5 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                                            Recomendado
                                        </span>
                                    </div>
                                )}

                                <div>
                                    {/* Plan Icon & Name */}
                                    <div className="flex items-center gap-3.5 mb-6">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${
                                            plan.featured ? 'bg-white/10 text-teal-300' : 'bg-teal-50 text-teal-700'
                                        }`}>
                                            <plan.icon className="w-5.5 h-5.5" />
                                        </div>
                                        <span className={`text-2xl font-bold tracking-tight ${
                                            plan.featured ? 'text-white' : 'text-gray-950'
                                        }`}>
                                            {plan.name}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <span className={`text-5xl font-extrabold tracking-tight ${
                                            plan.featured ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-sm font-medium ${
                                            plan.featured ? 'text-teal-200/80' : 'text-gray-500'
                                        }`}>
                                            {plan.period}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className={`text-sm mb-6 ${
                                        plan.featured ? 'text-teal-100/90' : 'text-gray-600'
                                    }`}>
                                        {plan.description}
                                    </p>

                                    {/* Divider */}
                                    <div className={`h-px mb-6 ${
                                        plan.featured ? 'bg-teal-800' : 'bg-gray-100'
                                    }`} />

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3">
                                                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                                    plan.featured ? 'text-teal-400' : 'text-teal-600'
                                                }`} />
                                                <span className={`text-sm ${
                                                    plan.featured ? 'text-teal-100/90' : 'text-gray-700'
                                                }`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href="/registro?tipo=profesional"
                                    className={`w-full py-3.5 px-6 rounded-2xl font-semibold transition-all duration-200 text-center block text-sm active:scale-[0.98] ${
                                        plan.featured
                                            ? 'bg-teal-400 text-teal-950 hover:bg-teal-300 shadow-md shadow-teal-400/10'
                                            : 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Trust Banner */}
                    <div className="mt-16 text-center max-w-4xl mx-auto">
                        <div className="inline-grid sm:grid-cols-3 gap-6 py-6 px-8 rounded-3xl bg-white border border-gray-100 shadow-sm mb-12 w-full">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Privacidad y Leyes</h4>
                                <p className="text-sm font-semibold text-gray-700">Ley N° 20.584 y 19.628</p>
                            </div>
                            <div className="sm:border-x sm:border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cifrado de Notas</h4>
                                <p className="text-sm font-semibold text-gray-700">AES-256 de Extremo a Extremo</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Emisión Contable</h4>
                                <p className="text-sm font-semibold text-gray-700">Integración con Boleta SII</p>
                            </div>
                        </div>

                        {/* Interactive Help / Lead Generation */}
                        <div className="page-panel bg-gradient-to-br from-teal-50 to-emerald-50/20 border border-teal-100/50 p-8 rounded-3xl max-w-2xl mx-auto shadow-sm">
                            <HelpCircle className="w-10 h-10 text-teal-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                ¿Tienes consultas o necesitas un plan a medida?
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm">
                                Resuelve tus dudas en tiempo real y recibe asistencia personalizada con un ejecutivo especializado de PsyDoctor.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/registro?tipo=profesional"
                                    className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-2xl text-sm transition-all active:scale-[0.98] shadow-sm"
                                >
                                    Comenzar periodo gratis
                                </Link>
                                <a
                                    href="https://wa.me/56983414730?text=Hola%2C+tengo+dudas+sobre+los+planes+de+PsyDoctor+y+me+gustaría+recibir+asesoría+comercial."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                                >
                                    Hablar con Ejecutivo
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
