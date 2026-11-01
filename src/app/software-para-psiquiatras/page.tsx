import { Metadata } from 'next'
import Link from 'next/link'
import {
    Shield,
    FileText,
    Calendar,
    CheckCircle2,
    Lock,
    Video,
    BarChart3,
    ArrowRight,
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ProfessionalPageViewTracker } from '@/components/analytics/ProfessionalPageViewTracker'

export const metadata: Metadata = {
    title: { absolute: 'Software para Psiquiatras en Chile | Ficha Médica y Agenda | PsyDoctor' },
    description:
        'Software médico para psiquiatras en Chile. Gestión de consultas, fichas clínicas protegidas bajo Ley 20.584, teleconsulta encriptada y control de sesiones.',
    alternates: {
        canonical: 'https://psydoctor.cl/software-para-psiquiatras',
    },
    openGraph: {
        title: 'Software para Psiquiatras en Chile | PsyDoctor',
        description:
            'Plataforma integral para médicos psiquiatras: fichas clínicas protegidas, agenda médica y teleconsulta segura en Chile.',
        url: 'https://psydoctor.cl/software-para-psiquiatras',
        siteName: 'PsyDoctor',
        locale: 'es_CL',
        type: 'website',
    },
}

export default function SoftwareParaPsiquiatrasPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'PsyDoctor Software para Psiquiatras',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, Windows, macOS, iOS, Android',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CLP',
            description: 'Programa Fundadores con 12 meses sin costo de suscripción para especialistas.',
        },
        description:
            'Software médico para psiquiatras en Chile con historia clínica protegida bajo la Ley 20.584, telemedicina cifrada y agenda especializada.',
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <ProfessionalPageViewTracker pageName="/software-para-psiquiatras" />
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
                                Software Médico Especializado
                            </span>

                            <h1 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-6 leading-tight">
                                Software médico para psiquiatras: rigurosidad clínica y gestión eficiente
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                                Diseñado para médicos psiquiatras en Chile que buscan simplificar la administración de su consulta sin comprometer la seguridad legal ni la confidencialidad médica.
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
                                    Ver detalles de planes
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pilares Médicos */}
                <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 text-center mb-8">
                            Seguridad clínica y cumplimiento normativo en Chile
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <Lock className="w-5 h-5 text-teal-700" />
                                    <h3 className="font-bold text-slate-900 text-lg">Resguardo Ley 20.584</h3>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Módulo de historia clínica con trazabilidad y altos estándares de cifrado, protegiendo los datos sensibles de salud de tus pacientes conforme a la ley chilena.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <Video className="w-5 h-5 text-teal-700" />
                                    <h3 className="font-bold text-slate-900 text-lg">Telepsiquiatría Integrada</h3>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Salas de videollamada estables y encriptadas punto a punto vía Daily.co, permitiendo consultas online seguras para pacientes en cualquier región del país.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Fundadores */}
                <section className="py-14 md:py-18 bg-teal-900 text-white text-center">
                    <div className="container-wide max-w-3xl mx-auto">
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Incorpórate como Médico Psiquiatra Fundador
                        </h2>
                        <p className="text-base text-teal-100 mb-8 leading-relaxed">
                            Obtén 12 meses de suscripción sin costo en PsyDoctor SpA y participa activamente en el perfeccionamiento de la plataforma.
                        </p>
                        <Link
                            href="/registro?tipo=profesional&programa=fundador"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-950 shadow-xl hover:bg-slate-100 transition-all"
                        >
                            <span>Postular al Programa Fundadores</span>
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

