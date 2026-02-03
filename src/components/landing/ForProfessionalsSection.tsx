'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Check,
    Calendar,
    BarChart3,
    Users as UsersIcon,
    ChevronDown,
    Clock,
    UserCheck,
    FileCheck,
    Eye,
    Lock,
    Shield,
    Heart,
    FileText,
    CreditCard,
    Zap,
    TrendingUp
} from 'lucide-react'

// ============================================================================
// Content Configuration (i18n-ready)
// ============================================================================

const benefits = [
    {
        icon: Calendar,
        title: 'Gestión de agenda',
        description: 'Disponibilidad sincronizada, confirmaciones automáticas.',
    },
    {
        icon: BarChart3,
        title: 'Visibilidad profesional',
        description: 'Perfil verificado visible para pacientes que buscan apoyo.',
    },
    {
        icon: UsersIcon,
        title: 'Continuidad con pacientes',
        description: 'Historial compartido (con consentimiento) para mejor seguimiento.',
    },
]

const features = [
    'Perfil profesional verificado',
    'Agenda online integrada',
    'Pagos seguros y automáticos',
    'Panel de gestión de pacientes',
]

// Contenido expandible "Conocer más"
const learnMoreContent = {
    intro: 'Una plataforma diseñada desde la perspectiva del profesional de salud mental, priorizando tu autonomía y la confidencialidad de tus pacientes.',

    painPoints: {
        title: '¿Qué problema resolvemos para ti?',
        items: [
            'Tiempo perdido en gestión administrativa manual',
            'Dificultad para ser encontrado por pacientes que necesitan tu especialidad',
            'Fragmentación de información cuando un paciente cambia de profesional',
            'Plataformas que priorizan volumen sobre calidad del vínculo terapéutico',
        ],
    },

    support: {
        title: '¿Cómo te apoya PsyConnect?',
        items: [
            {
                icon: Clock,
                title: 'Reducción de fricción operativa',
                description: 'Agenda integrada, confirmaciones automáticas y pagos seguros. Más tiempo para lo que importa: tus pacientes.',
            },
            {
                icon: UserCheck,
                title: 'Autonomía profesional total',
                description: 'Tú defines tu disponibilidad, tarifas y modalidad de atención. Sin algoritmos que prioricen por comisión.',
            },
            {
                icon: UsersIcon,
                title: 'Control de la relación terapéutica',
                description: 'La comunicación con tus pacientes es directa. PsyConnect facilita el encuentro, no lo intermedia.',
            },
            {
                icon: FileCheck,
                title: 'Continuidad clínica con consentimiento',
                description: 'Si un paciente cambia de profesional, puede autorizar compartir su historial para asegurar continuidad del proceso.',
            },
            {
                icon: Eye,
                title: 'Visibilidad ética',
                description: 'No somos un marketplace masivo. Conectamos pacientes con profesionales verificados que se ajustan a sus necesidades.',
            },
        ],
    },

    ethics: {
        title: 'Nuestro compromiso ético',
        items: [
            {
                icon: Lock,
                title: 'Confidencialidad garantizada',
                description: 'Datos clínicos encriptados. Cumplimiento con normativas de protección de datos de salud.',
            },
            {
                icon: Shield,
                title: 'Verificación profesional',
                description: 'Solo profesionales con credenciales verificables pueden crear perfil. Protegemos la confianza del ecosistema.',
            },
            {
                icon: Heart,
                title: 'Sin claims clínicos',
                description: 'No prometemos resultados terapéuticos. Facilitamos el acceso a atención de calidad, respetando la complejidad del proceso.',
            },
        ],
    },
}

// ============================================================================
// Component
// ============================================================================

export function ForProfessionalsSection() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <section id="para-profesionales" className="py-6 md:py-8 bg-white">
            <div className="container-wide">
                {/* Main content grid */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left column: Copy */}
                    <div className="order-2 lg:order-1">
                        <span className="text-secondary-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
                            Para profesionales
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3 tracking-tight text-balance">
                            Una herramienta que respeta tu práctica
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 text-balance leading-relaxed">
                            PsyConnect no es solo un directorio. Es una plataforma que facilita
                            la gestión de tu práctica mientras mantienes el control de la relación
                            con tus pacientes.
                        </p>

                        <div className="space-y-5 mb-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center flex-shrink-0 text-secondary-900">
                                        <benefit.icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 leading-tight mb-1">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botón Conocer más - toggle expandible */}
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-secondary-900 font-medium hover:text-secondary-700 inline-flex items-center gap-2 group transition-colors"
                            aria-expanded={isExpanded}
                            aria-controls="learn-more-panel"
                        >
                            <span className="border-b border-secondary-900 group-hover:border-secondary-700">Explorar funcionalidades</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Right column: Feature card - More elegant */}
                    <div className="order-1 lg:order-2 bg-gradient-to-br from-secondary-50 to-white rounded-2xl border border-secondary-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-secondary-900 flex items-center justify-center text-white">
                                <UsersIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Todo incluido en tu perfil
                            </h3>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 text-secondary-700">
                                        <Check className="w-3 h-3" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-gray-700 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-6 border-t border-secondary-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-medium">
                                Plan gratuito disponible.
                            </p>
                            <Link href="/planes" className="text-sm text-secondary-900 font-medium hover:underline">
                                Ver detalle
                            </Link>
                        </div>
                    </div>
                </div>


                {/* Panel expandible "Conocer más" */}
                <div
                    id="learn-more-panel"
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 mt-16' : 'max-h-0 opacity-0 mt-0'
                        }`}
                    aria-hidden={!isExpanded}
                >
                    {/* Tu Oficina Automática Section */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 border border-emerald-100 mb-12">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-1.5 rounded-full mb-4">
                                    <Zap className="w-4 h-4 text-emerald-700" />
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Automatización Total</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">
                                    Tu oficina automática
                                </h3>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    Olvídate de generar boletas manualmente. PsyConnect emite <strong>boletas de honorarios electrónicas al SII automáticamente</strong> después de cada sesión confirmada.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Emisión automática al SII</p>
                                            <p className="text-sm text-gray-600">Cada sesión→ boleta electrónica validada por el SII</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <BarChart3 className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Exportación contable instantánea</p>
                                            <p className="text-sm text-gray-600">Excel + PDF listos para tu contador en un clic</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Ahorro de tiempo cuantificable</p>
                                            <p className="text-sm text-gray-600">Recupera ~3 horas/mes = $105.000 adicionales facturables</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                                <div className="text-xs font-mono text-gray-500 mb-4">SIMULACIÓN DE AHORRO MENSUAL</div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <span className="text-sm text-gray-600">Generación manual de boletas</span>
                                        <span className="text-red-600 font-semibold">-3h</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <span className="text-sm text-gray-600">Preparación de informes contables</span>
                                        <span className="text-red-600 font-semibold">-2h</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <span className="text-sm text-gray-600">Seguimiento de pagos</span>
                                        <span className="text-red-600 font-semibold">-1.5h</span>
                                    </div>
                                    <div className="bg-emerald-50 rounded-lg p-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Total recuperado con PsyConnect</span>
                                            <span className="text-2xl font-bold text-emerald-700">6.5h/mes</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">Si cobras $35.000/sesión (50min), son <strong className="text-emerald-700">~$273.000</strong> adicionales al mes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sin Cobranza Incómoda Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-100 mb-12">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full mb-4">
                                    <CreditCard className="w-4 h-4 text-blue-700" />
                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Eliminamos la fricción</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">
                                    Sin cobranza incómoda
                                </h3>
                                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                    Sabemos que <strong>cobrar en terapia genera incomodidad</strong>. PsyConnect gestiona el pago antes o después de la sesión, manteniendo la integridad del espacio terapéutico.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                        <span className="text-2xl">1️⃣</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Pago anticipado (opcional)</h4>
                                    <p className="text-sm text-gray-600">
                                        El paciente paga al agendar. Tú solo te enfocas en la sesión, sin preocuparte por cobrar.
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                        <span className="text-2xl">2️⃣</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Recordatorios automáticos</h4>
                                    <p className="text-sm text-gray-600">
                                        Si hay sesiones pendientes de pago, PsyConnect envía recordatorios empáticos sin que tú tengas que pedirlo.
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                        <span className="text-2xl">3️⃣</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Depósito directo en 48h</h4>
                                    <p className="text-sm text-gray-600">
                                        Una vez pagado, el dinero se deposita en tu cuenta. Sin intermediarios, sin retenciones inesperadas.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">Preservamos el encuadre terapéutico</p>
                                        <p className="text-sm text-gray-600">
                                            El momento del pago puede afectar la dinámica terapéutica. Al automatizarlo, mantienes la neutralidad y evitas conversaciones incómodas sobre dinero dentro del espacio de sesión.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Intro text */}
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <p className="text-xl text-gray-700 leading-relaxed">
                            {learnMoreContent.intro}
                        </p>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

                        {/* Left Column: Pain Points + Support */}
                        <div className="space-y-12">

                            {/* Pain Points Block */}
                            <div className="bg-white rounded-2xl p-8 border border-secondary-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    {learnMoreContent.painPoints.title}
                                </h3>
                                <ul className="space-y-4">
                                    {learnMoreContent.painPoints.items.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2.5 flex-shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span className="text-gray-700 leading-relaxed">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Support Block */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-8">
                                    {learnMoreContent.support.title}
                                </h3>
                                <div className="space-y-6">
                                    {learnMoreContent.support.items.map((item, index) => (
                                        <article key={index} className="flex items-start gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl bg-primary-900/10 flex items-center justify-center flex-shrink-0"
                                                aria-hidden="true"
                                            >
                                                <item.icon className="w-5 h-5 text-primary-900" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Ethics + CTA */}
                        <div className="space-y-8">

                            {/* Ethics Block */}
                            <div className="bg-primary-900 rounded-2xl p-8 lg:p-10 text-white">
                                <h3 className="text-xl font-semibold mb-8">
                                    {learnMoreContent.ethics.title}
                                </h3>
                                <div className="space-y-6">
                                    {learnMoreContent.ethics.items.map((item, index) => (
                                        <article key={index} className="flex items-start gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"
                                                aria-hidden="true"
                                            >
                                                <item.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white mb-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-white/80 text-sm leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Block */}
                            <div className="bg-white rounded-2xl p-8 text-center border border-secondary-200">
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    Únete a una comunidad de profesionales que valoran
                                    la autonomía y el cuidado ético de sus pacientes.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/registro?tipo=profesional"
                                        className="btn-primary"
                                    >
                                        Crear perfil profesional
                                    </Link>
                                    <Link
                                        href="/planes"
                                        className="btn-outline"
                                    >
                                        Ver planes
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                    Sin compromiso. Cancela cuando quieras.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botón para cerrar "Conocer más" */}
                    <div className="text-center mt-12">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-primary-900 font-medium hover:underline inline-flex items-center gap-1"
                        >
                            <ChevronDown className="w-4 h-4 rotate-180" />
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
