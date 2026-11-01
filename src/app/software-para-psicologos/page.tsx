import { Metadata } from 'next'
import Link from 'next/link'
import {
    Calendar,
    Shield,
    CheckCircle2,
    Lock,
    Users,
    Video,
    BarChart3,
    ArrowRight,
    HelpCircle,
    FileText,
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ProfessionalPageViewTracker } from '@/components/analytics/ProfessionalPageViewTracker'

export const metadata: Metadata = {
    title: { absolute: 'Software para Psicólogos en Chile | Agenda y Ficha Clínica | PsyDoctor' },
    description:
        'Software de gestión médica y clínica diseñado para psicólogos independientes en Chile. Agenda online, fichas clínicas protegidas (Ley 20.584) y teleconsulta cifrada.',
    alternates: {
        canonical: 'https://psydoctor.cl/software-para-psicologos',
    },
    openGraph: {
        title: 'Software para Psicólogos en Chile | PsyDoctor',
        description:
            'Plataforma integral para psicólogos en Chile: agenda online, ficha clínica digital protegida y teleconsulta segura.',
        url: 'https://psydoctor.cl/software-para-psicologos',
        siteName: 'PsyDoctor',
        locale: 'es_CL',
        type: 'website',
    },
}

export default function SoftwareParaPsicologosPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'PsyDoctor Software para Psicólogos',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, Windows, macOS, iOS, Android',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CLP',
            description: 'Programa Fundadores: 12 meses sin costo de suscripción para los primeros 20 profesionales.',
        },
        description:
            'Plataforma SaaS para psicólogos clínicos en Chile con agenda médica, teleconsulta integrada y fichas clínicas resguardadas conforme a la Ley 20.584.',
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <ProfessionalPageViewTracker pageName="/software-para-psicologos" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative py-14 md:py-20 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border-b border-slate-200/60">
                    <div className="container-wide">
                        <div className="max-w-3xl mx-auto text-center">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-200 shadow-2xs">
                                <Shield className="w-3.5 h-3.5" />
                                Software Clínico Especializado
                            </span>

                            <h1 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-6 leading-tight">
                                El software de gestión clínica pensado para psicólogos en Chile
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                                Centraliza tu agenda, administra las fichas clínicas de tus pacientes con total privacidad y atiende por teleconsulta segura desde una sola plataforma web.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/registro?tipo=profesional&programa=fundador"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-950/15 hover:bg-teal-900 transition-all"
                                >
                                    <span>Postula al Programa Fundadores</span>
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </Link>
                                <Link
                                    href="/planes"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    Ver planes disponibles
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Desafíos */}
                <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 text-center mb-8">
                            ¿Por qué los psicólogos independientes eligen digitalizar su consulta?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Protección del encuadre terapéutico</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Evita la incómoda gestión de cobranzas o coordinación de transferencias al finalizar la sesión. El paciente agenda y confirma previamente.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Cumplimiento estricto de la Ley 20.584</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Las notas de evolución psicológica no pueden guardarse en notas desprotegidas. PsyDoctor resguarda la información con cifrado y trazabilidad.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Funcionalidades */}
                <section className="py-12 md:py-16 bg-white border-b border-slate-200/60">
                    <div className="container-wide max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 text-center mb-10">
                            Herramientas clave para tu práctica psicológica
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                                <Calendar className="w-6 h-6 text-teal-700 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1">Agenda médica y confirmación de horas</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Personaliza la duración de tus sesiones (45 o 50 minutos), tus horarios de atención online o presencial y envía recordatorios automáticos.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                                <FileText className="w-6 h-6 text-teal-700 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1">Fichas clínicas digitales estructuradas</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Registro seguro de antecedentes, hipótesis diagnóstica, objetivos terapéuticos y notas de evolución con resguardo confidencial.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                                <Video className="w-6 h-6 text-teal-700 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1">Teleconsulta segura sin enlaces externos</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Videollamadas cifradas integradas con Daily.co que no requieren instalar aplicaciones externas ni reenviar links de acceso.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Fundadores */}
                <section className="py-14 md:py-18 bg-teal-900 text-white text-center">
                    <div className="container-wide max-w-3xl mx-auto">
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Únete al Programa Fundadores de PsyDoctor
                        </h2>
                        <p className="text-base text-teal-100 mb-8 leading-relaxed">
                            Aprovecha 12 meses de suscripción sin costo para los primeros 20 psicólogos inscritos en la Superintendencia de Salud.
                        </p>
                        <Link
                            href="/registro?tipo=profesional&programa=fundador"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-950 shadow-xl hover:bg-slate-100 transition-all"
                        >
                            <span>Postular como Profesional Fundador</span>
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

