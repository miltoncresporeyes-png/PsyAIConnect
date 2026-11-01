import { Metadata } from 'next'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    Bell,
    CheckCircle2,
    Shield,
    ArrowRight,
    Users,
    Smartphone,
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ProfessionalPageViewTracker } from '@/components/analytics/ProfessionalPageViewTracker'

export const metadata: Metadata = {
    title: { absolute: 'Agenda Online para Psicólogos en Chile | PsyDoctor' },
    description:
        'Sistema de agenda online para psicólogos y profesionales de salud mental en Chile. Reduce inasistencias, automatiza confirmaciones y coordina tu consulta fácilmente.',
    alternates: {
        canonical: 'https://psydoctor.cl/agenda-online-psicologos',
    },
    openGraph: {
        title: 'Agenda Online para Psicólogos en Chile | PsyDoctor',
        description:
            'Organiza tus horas clínicas, envía confirmaciones automáticas y permite que tus pacientes agenden con facilidad.',
        url: 'https://psydoctor.cl/agenda-online-psicologos',
        siteName: 'PsyDoctor',
        locale: 'es_CL',
        type: 'website',
    },
}

export default function AgendaOnlinePsicologosPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'PsyDoctor Agenda Online para Psicólogos',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, Windows, macOS, iOS, Android',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CLP',
            description: '12 meses bonificados en el Programa Fundadores.',
        },
        description:
            'Sistema de agendamiento médico online en Chile con confirmación automática y teleconsulta para psicólogos clínicos.',
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <ProfessionalPageViewTracker pageName="/agenda-online-psicologos" />
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
                                <Calendar className="w-3.5 h-3.5" />
                                Agendamiento Inteligente
                            </span>

                            <h1 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-6 leading-tight">
                                Agenda online para psicólogos: reduce inasistencias y ordena tu tiempo
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                                Olvídate de los mensajes a deshoras coordinando horas de atención. Ofrece a tus consultantes un enlace directo para reservar según tus bloques libres.
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
                                    href="/profesionales"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    Conocer todas las funciones
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Beneficios de la agenda */}
                <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 text-center mb-8">
                            Control total sobre tus horarios de atención
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-800 mx-auto flex items-center justify-center mb-4">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base mb-2">Bloques configurables</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Ajusta descansos entre sesiones, horarios de mañana o tarde y días no laborables fácilmente.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-800 mx-auto flex items-center justify-center mb-4">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base mb-2">Confirmación automática</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Notificaciones inmediatas al paciente con los detalles de la cita y el enlace de conexión online.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-800 mx-auto flex items-center justify-center mb-4">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-base mb-2">Experiencia móvil fluida</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Tus pacientes agendan en menos de 2 minutos desde cualquier smartphone sin descargar apps.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Llamado a la acción */}
                <section className="py-14 md:py-18 bg-teal-900 text-white text-center">
                    <div className="container-wide max-w-3xl mx-auto">
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            Optimiza tu agenda con 12 meses sin costo
                        </h2>
                        <p className="text-base text-teal-100 mb-8 leading-relaxed">
                            Forma parte del Programa Fundadores de PsyDoctor y digitaliza tu calendario clínico hoy.
                        </p>
                        <Link
                            href="/registro?tipo=profesional&programa=fundador"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-950 shadow-xl hover:bg-slate-100 transition-all"
                        >
                            <span>Quiero ser Profesional Fundador</span>
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

