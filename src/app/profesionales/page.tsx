'use client'

import Link from 'next/link'
import {
    CheckCircle2,
    FileText,
    TrendingUp,
    Clock,
    CreditCard,
    Shield,
    ArrowRight,
    Calendar,
    BarChart3,
    Users,
    AlertCircle,
    Video,
    Lock,
    HelpCircle,
    Sparkles,
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { ProfessionalPageViewTracker } from '@/components/analytics/ProfessionalPageViewTracker'
import { analyticsEvents } from '@/lib/analytics'

export default function SoyProfesionalPage() {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f7fbfa_0%,_#ffffff_24%,_#ffffff_100%)] flex flex-col">
            <ProfessionalPageViewTracker pageName="/profesionales" />
            <Header />

            <main className="flex-1">
                {/* 1. HERO B2B */}
                <section className="relative py-12 md:py-18 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 overflow-hidden border-b border-slate-200/60">
                    <div className="container-wide relative">
                        <div className="max-w-4xl mx-auto text-center">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 mb-5 shadow-2xs">
                                <Shield className="w-4 h-4 text-teal-700" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">Software para Especialistas en Chile</span>
                            </span>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                                Dedícate a tus pacientes. <span className="text-teal-800">PsyDoctor te ayuda a gestionar tu consulta.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                                Organiza tu agenda, administra tu consulta y desarrolla tu presencia profesional con una plataforma diseñada para especialistas en salud mental.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                                <Link
                                    href="/registro?tipo=profesional&programa=fundador"
                                    onClick={() => analyticsEvents.founderCtaClick('profesionales_hero')}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-950/15 hover:bg-teal-900 transition-all"
                                >
                                    <span>Postula al Programa Fundadores</span>
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </Link>
                                <Link
                                    href="#funcionalidades"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                    Ver funcionalidades
                                </Link>
                            </div>

                            {/* Trust Stats */}
                            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 border-t border-slate-200/80">
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-teal-800">100% Web</div>
                                    <div className="text-xs sm:text-sm text-slate-600">Sin instalar programas</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-teal-800">CLP</div>
                                    <div className="text-xs sm:text-sm text-slate-600">Cobros en moneda local</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-bold text-teal-800">Ley 20.584</div>
                                    <div className="text-xs sm:text-sm text-slate-600">Fichas clínicas seguras</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. PROBLEMAS COTIDIANOS DE PROFESIONALES INDEPENDIENTES */}
                <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-3">
                                    Los desafíos cotidianos de la consulta independiente
                                </h2>
                                <p className="text-base text-slate-600">
                                    La carga administrativa que resta tiempo al ejercicio clínico en Chile
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-2xl p-6 border-l-4 border-amber-500 shadow-sm">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-amber-700" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg">Caos en agendamiento</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Coordinar horas por WhatsApp, cancelaciones de último minuto sin aviso y pacientes que olvidan su sesión por falta de confirmación automática.
                                    </p>
                                    <div className="text-xs text-amber-700 font-semibold">
                                        Pérdida de horas clínicas cada semana
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border-l-4 border-rose-500 shadow-sm">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                                            <CreditCard className="w-5 h-5 text-rose-700" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg">Incomodidad al cobrar</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Tener que solicitar transferencias dentro de la sesión o recordar pagos pendientes afecta el encuadre terapéutico y la relación profesional.
                                    </p>
                                    <div className="text-xs text-rose-700 font-semibold">
                                        Fricción en la relación con el paciente
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border-l-4 border-blue-500 shadow-sm">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg">Dispersión de registros</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Notas clínicas en cuadernos o procesadores de texto, boletas emitidas manualmente en el portal del SII y datos desordenados a fin de mes.
                                    </p>
                                    <div className="text-xs text-blue-700 font-semibold">
                                        Riesgo de incumplimiento normativo
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. BENEFICIOS CONCRETOS DE PSYDOCTOR */}
                <section className="py-12 md:py-16 bg-white border-b border-slate-200/60">
                    <div className="container-wide">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">
                                Beneficios concretos para tu práctica clínica
                            </h2>
                            <p className="text-lg text-slate-600">
                                Diseñado para resolver la gestión cotidiana de psicólogos y psiquiatras
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-teal-300 transition-all">
                                <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Preserva el encuadre</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    El agendamiento y confirmación de pago se resuelven antes de la consulta, protegiendo el espacio terapéutico.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-teal-300 transition-all">
                                <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Reduce el ausentismo</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Notificaciones y confirmaciones por correo para que cada paciente asista a tiempo a su cita programada.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-teal-300 transition-all">
                                <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Seguridad y confidencialidad</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Fichas clínicas con acceso restringido, cifrado de datos y apego a la Ley 20.584 de Derechos del Paciente.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-teal-300 transition-all">
                                <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Perfil verificado</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Presencia digital destacada en el directorio, validada con el Registro de Prestadores Individuales de la Superintendencia de Salud.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-teal-300 transition-all">
                                <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Simplicidad tributaria</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Control claro de tus sesiones y cálculo de honorarios actualizado a la retención vigente del 15,25% (2026).
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-teal-300 transition-all">
                                <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
                                <h3 className="font-bold text-slate-900 text-lg mb-2">Soporte directo</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Acompañamiento personalizado en la configuración inicial de tus horarios, tarifas y modalidades de atención.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. FUNCIONALIDADES DISPONIBLES */}
                <section id="funcionalidades" className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">
                                Funcionalidades disponibles en la plataforma
                            </h2>
                            <p className="text-lg text-slate-600">
                                Herramientas reales implementadas para optimizar tu jornada profesional
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Funcionalidad 1 */}
                            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Agenda Médica y Reservas Online</h3>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                    Configura tus bloques horarios de atención (online y presencial). Tus pacientes reservan según tu disponibilidad real en tiempo real.
                                </p>
                                <ul className="text-xs text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Control de disponibilidad por días y horarios</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Confirmaciones automáticas por correo electrónico</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Funcionalidad 2 */}
                            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Fichas Clínicas Protegidas</h3>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                    Módulo de notas de evolución, antecedentes clínicos y seguimiento de sesiones resguardado conforme a la Ley N° 20.584.
                                </p>
                                <ul className="text-xs text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Acceso exclusivo para el profesional tratante</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Historial ordenado cronológicamente por paciente</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Funcionalidad 3 */}
                            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                                        <Video className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Teleconsulta Segura Integrada</h3>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                    Salas de videollamada cifradas directamente en el navegador mediante Daily.co, sin necesidad de enlaces externos como Zoom o Meet.
                                </p>
                                <ul className="text-xs text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Acceso con un clic desde el dashboard del profesional</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Cifrado en tránsito y privacidad de sala</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Funcionalidad 4 */}
                            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                                        <BarChart3 className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Control de Sesiones e Ingresos</h3>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                    Visualización de sesiones atendidas, montos acumulados y cálculo de retención tributaria estimada aplicable en Chile (15,25% vigente en 2026).
                                </p>
                                <ul className="text-xs text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Reporte claro para conciliación con boletas de honorarios</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                        <span>Transparencia en cobros y pagos en moneda local (CLP)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CÓMO FUNCIONA LA PLATAFORMA */}
                <section className="py-12 md:py-16 bg-white border-b border-slate-200/60">
                    <div className="container-wide">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">
                                ¿Cómo comenzar a operar en PsyDoctor?
                            </h2>
                            <p className="text-lg text-slate-600">
                                Tres pasos simples para digitalizar y ordenar tu consulta
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-xl text-teal-800 mb-4 shadow-2xs">
                                    1
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Postulación y Validación</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Completas tus datos profesionales. Verificamos tu registro ante la Superintendencia de Salud para resguardar la seriedad de la red.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-xl text-teal-800 mb-4 shadow-2xs">
                                    2
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Configuración de Consulta</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Defines tus valores de sesión, días y horarios de atención, modalidades (online o presencial) y datos de contacto.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-xl text-teal-800 mb-4 shadow-2xs">
                                    3
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Gestión y Atención</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Recibes reservas, atiendes tus teleconsultas con videollamada cifrada y mantienes las notas clínicas protegidas en un solo lugar.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. PROGRAMA FUNDADORES */}
                <section className="py-12 md:py-16 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white">
                    <div className="container-wide">
                        <div className="max-w-4xl mx-auto text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-teal-200 mb-5 border border-white/15">
                                <Sparkles className="w-4 h-4 text-teal-300" />
                                <span>Convocatoria Especial · Cupos limitados a 20 profesionales</span>
                            </span>

                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-5 leading-tight">
                                Conviértete en uno de los primeros profesionales que impulsen PsyDoctor en Chile
                            </h2>

                            <p className="text-base md:text-lg text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                                Únete como Profesional Fundador y accede a condiciones preferentes diseñadas para co-construir la mejor plataforma de salud mental en el país.
                            </p>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left max-w-4xl mx-auto mb-10">
                                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                                    <div className="font-semibold text-teal-300 text-sm mb-1">12 Meses sin Costo</div>
                                    <p className="text-xs text-slate-300">Exención total del costo de suscripción mensual durante el primer año.</p>
                                </div>
                                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                                    <div className="font-semibold text-teal-300 text-sm mb-1">Perfil Destacado</div>
                                    <p className="text-xs text-slate-300">Insignia distintiva de Profesional Fundador en el directorio público.</p>
                                </div>
                                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                                    <div className="font-semibold text-teal-300 text-sm mb-1">Acompañamiento VIP</div>
                                    <p className="text-xs text-slate-300">Contacto directo con el equipo fundador para sugerir mejoras y adaptar el producto.</p>
                                </div>
                            </div>

                            <Link
                                href="/registro?tipo=profesional&programa=fundador"
                                onClick={() => analyticsEvents.founderCtaClick('profesionales_founders_section')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-950 shadow-xl hover:bg-slate-100 transition-all"
                            >
                                <span>Quiero ser Profesional Fundador</span>
                                <ArrowRight className="w-5 h-5 ml-1" />
                            </Link>

                            <p className="mt-4 text-xs text-slate-400">
                                Sujeto a validación de antecedentes en el Registro de Prestadores de la Superintendencia de Salud.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7. PLANES Y PRECIOS */}
                <section className="py-12 md:py-16 bg-white border-b border-slate-200/60">
                    <div className="container-wide">
                        <div className="max-w-4xl mx-auto text-center mb-10">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-3">
                                Planes transparentes, sin contratos forzosos
                            </h2>
                            <p className="text-base text-slate-600">
                                Comienza hoy como Fundador y escala según las necesidades de tu práctica
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
                            {/* Plan Fundador */}
                            <div className="rounded-2xl border-2 border-teal-600 bg-white p-7 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                                        Fase Actual
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-3 mb-1">Programa Fundadores</h3>
                                    <div className="text-3xl font-bold text-teal-900 mb-1">$0</div>
                                    <div className="text-xs text-slate-500 mb-4">por 12 meses (20 cupos)</div>
                                    <ul className="text-xs text-slate-600 space-y-2.5 border-t border-slate-100 pt-4">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Suscripción bonificada por 1 año</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Insignia de Profesional Fundador</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Agenda médica y fichas clínicas seguras</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Teleconsulta cifrada incluida</span>
                                        </li>
                                    </ul>
                                </div>
                                <Link
                                    href="/registro?tipo=profesional&programa=fundador"
                                    className="mt-6 block w-full text-center rounded-xl bg-teal-800 py-3 text-sm font-semibold text-white hover:bg-teal-900 transition-colors"
                                >
                                    Postular al cupo
                                </Link>
                            </div>

                            {/* Plan Pro */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-7 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2.5 py-1 rounded-md">
                                        Profesional
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-3 mb-1">Plan PRO</h3>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">$29.000</div>
                                    <div className="text-xs text-slate-500 mb-4">mensual / sin permanencia</div>
                                    <ul className="text-xs text-slate-600 space-y-2.5 border-t border-slate-200 pt-4">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Citas y agenda online ilimitadas</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Ficha clínica protegida (Ley 20.584)</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Teleconsulta integrada Daily.co</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Soporte prioritario</span>
                                        </li>
                                    </ul>
                                </div>
                                <Link
                                    href="/planes"
                                    className="mt-6 block w-full text-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Ver detalles del plan
                                </Link>
                            </div>

                            {/* Plan Premium */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-7 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2.5 py-1 rounded-md">
                                        Avanzado
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-3 mb-1">Plan PREMIUM</h3>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">$59.000</div>
                                    <div className="text-xs text-slate-500 mb-4">mensual / para consultas consolidadas</div>
                                    <ul className="text-xs text-slate-600 space-y-2.5 border-t border-slate-200 pt-4">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Todo lo incluido en el plan PRO</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Múltiples sucursales y ubicaciones</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Estadísticas avanzadas de atención</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                                            <span>Asistente de onboarding y soporte VIP</span>
                                        </li>
                                    </ul>
                                </div>
                                <Link
                                    href="/planes"
                                    className="mt-6 block w-full text-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Ver detalles del plan
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. PREGUNTAS FRECUENTES B2B */}
                <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-3">
                                Preguntas frecuentes de profesionales
                            </h2>
                            <p className="text-base text-slate-600">
                                Respuestas claras sobre el funcionamiento del software y el Programa Fundadores
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <h3 className="font-bold text-slate-900 text-base mb-2">
                                    ¿Qué requisitos debo cumplir para participar del Programa Fundadores?
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Debes contar con título profesional de psicólogo/a o médico psiquiatra y registro activo y verificable en la Superintendencia de Salud de Chile.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <h3 className="font-bold text-slate-900 text-base mb-2">
                                    ¿Existe algún compromiso de permanencia o cobro oculto?
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    No. Los 12 meses de suscripción del Programa Fundadores son 100% bonificados. Cualquier costo de pasarela de pago bancario de terceros aplica directamente sobre las transacciones procesadas. Al término de los 12 meses, se avisa con 60 días de anticipación sin cobros automáticos sorpresivos.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <h3 className="font-bold text-slate-900 text-base mb-2">
                                    ¿Cómo se garantiza la confidencialidad de las fichas clínicas?
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Las fichas clínicas están diseñadas bajo el estricto mandato de la Ley 20.584. Sólo el profesional tratante tiene acceso a la información confidencial de sus pacientes mediante autenticación cifrada.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <h3 className="font-bold text-slate-900 text-base mb-2">
                                    ¿Puedo atender tanto pacientes online como presenciales?
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Sí. La plataforma te permite habilitar ambas modalidades según tus horarios y preferencias de consulta.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. CTA FINAL */}
                <section className="py-14 md:py-20 bg-teal-900 text-white relative overflow-hidden">
                    <div className="container-wide relative">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                                Simplifica la gestión de tu consulta hoy
                            </h2>
                            <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
                                Organiza tu agenda médica, ahorra tiempo administrativo y brinda una experiencia confiable a tus pacientes.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/registro?tipo=profesional&programa=fundador"
                                    onClick={() => analyticsEvents.founderCtaClick('profesionales_cta_final')}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-teal-900 shadow-xl hover:bg-slate-100 transition-all"
                                >
                                    <span>Postula al Programa Fundadores</span>
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </Link>
                                <a
                                    href="mailto:contacto@psydoctor.cl?subject=Consulta%20Profesional%20PsyDoctor"
                                    onClick={() => analyticsEvents.demoRequested('email_profesionales')}
                                    className="inline-flex items-center justify-center rounded-xl border border-teal-300/40 bg-teal-800/50 px-8 py-4 text-base font-semibold text-white hover:bg-teal-800 transition-all"
                                >
                                    Contactar al equipo
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
