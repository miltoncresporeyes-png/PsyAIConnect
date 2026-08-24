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
    AlertCircle
} from 'lucide-react'

export default function SoyProfesionalPage() {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f7fbfa_0%,_#ffffff_24%,_#ffffff_100%)]">
            {/* Hero Section */}
            <section className="relative py-10 md:py-14 bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />

                <div className="container-wide relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-200 mb-5 shadow-sm">
                            <Shield className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium text-primary-700">Creado por expertos en gestión y finanzas</span>
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 mb-5 leading-tight">
                            Tu consulta merece la misma <span className="text-primary-700">estructura financiera</span> que una empresa profesional
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-7 leading-relaxed max-w-3xl mx-auto">
                            Deja de perder 6.5 horas al mes en administración. <strong className="text-gray-900">Convierte tu práctica en un negocio rentable</strong> con infraestructura tributaria automatizada.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Link
                                href="/registro?type=professional"
                                className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                Profesionalizar mi consulta
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                            <Link
                                href="#beneficios"
                                className="btn-outline text-lg px-8 py-4"
                            >
                                Ver cómo funciona
                            </Link>
                        </div>

                        {/* Trust Stats */}
                        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 border-t border-gray-200/80">
                            <div>
                                <div className="text-3xl font-bold text-primary-700">6.5h</div>
                                <div className="text-sm text-gray-600">Ahorradas/mes</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-700">100%</div>
                                <div className="text-sm text-gray-600">Cumplimiento SII</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-700">94%</div>
                                <div className="text-sm text-gray-600">Retención profesionales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="py-10 md:py-12 bg-gray-50">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                                ¿Te identificas con esto?
                            </h2>
                            <p className="text-lg text-gray-600">
                                La realidad administrativa de la práctica privada en Chile
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-5">
                            {/* Pain Point 1 */}
                            <div className="bg-white rounded-2xl p-6 border-l-4 border-red-500 shadow-sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">Carga tributaria del SII</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    "Cada mes debo generar manualmente boletas de honorarios, llevar un Excel de ingresos y rezar para que no haya errores en abril."
                                </p>
                                <div className="text-xs text-red-700 font-semibold">
                                    ⏱️ ~3 horas/mes perdidas
                                </div>
                            </div>

                            {/* Pain Point 2 */}
                            <div className="bg-white rounded-2xl p-6 border-l-4 border-amber-500 shadow-sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">Incomodidad al cobrar</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    "Termino la sesión y tengo que pedirle el pago al paciente. Es incómodo, afecta el encuadre terapéutico y me genera ansiedad."
                                </p>
                                <div className="text-xs text-amber-700 font-semibold">
                                    😓 Afecta relación terapéutica
                                </div>
                            </div>

                            {/* Pain Point 3 */}
                            <div className="bg-white rounded-2xl p-6 border-l-4 border-orange-500 shadow-sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">Caos en agendamiento</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    "Mensajes de WhatsApp a cualquier hora, confirmaciones manuales, cancelaciones de último minuto sin aviso."
                                </p>
                                <div className="text-xs text-orange-700 font-semibold">
                                    📱 ~1.5 horas/mes en coordinación
                                </div>
                            </div>
                        </div>

                        <div className="mt-7 bg-primary-900 rounded-[28px] p-7 text-white text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                            <p className="text-2xl font-bold mb-2">Total de tiempo perdido al mes:</p>
                            <p className="text-5xl font-bold text-primary-300 mb-3">6.5 horas</p>
                            <p className="text-lg opacity-90">
                                Si cobras $35.000 por sesión, estás dejando de ganar <strong className="text-primary-200">~$273.000/mes</strong> en costo de oportunidad
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Three Pillars Section */}
            <section id="beneficios" className="py-12 md:py-14 bg-white">
                <div className="container-wide">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                            La solución: Tres pilares de eficiencia operativa
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Infraestructura administrativa diseñada por especialistas en finanzas para profesionales de la salud
                        </p>
                    </div>

                    {/* Pilar 1: Automatización Tributaria */}
                    <div className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[30px] p-6 md:p-10 border border-emerald-200 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full mb-4">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Pilar 1</span>
                                </div>
                                <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                                    Automatización Tributaria Completa
                                </h3>
                                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                    <strong>Acabamos con la pesadilla del SII.</strong> Cada sesión confirmada genera automáticamente su boleta electrónica validada por el Servicio de Impuestos Internos.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Emisión automática al SII</p>
                                            <p className="text-sm text-gray-600">Boleta electrónica 29 generada y timbrada sin intervención manual</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Libro de honorarios digital</p>
                                            <p className="text-sm text-gray-600">Registro cronológico automático de todos tus ingresos con detalle por paciente</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Declaración de renta lista en 1 clic</p>
                                            <p className="text-sm text-gray-600">Exportación de certificados anuales y resumen de ingresos para el Formulario 22</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-xl border border-emerald-200">
                                <div className="text-xs font-mono text-gray-500 mb-4 uppercase tracking-wider">Vista Previa: Dashboard Tributario</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm text-gray-700">Ingresos enero 2026</span>
                                        <span className="font-bold text-gray-900">$2.450.000</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm text-gray-700">Boletas emitidas</span>
                                        <span className="font-bold text-emerald-700">70/70 ✓</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm text-gray-700">Retención PPM (10.75%)</span>
                                        <span className="font-bold text-gray-900">$263.375</span>
                                    </div>
                                    <div className="bg-emerald-50 rounded-lg p-4 mt-4">
                                        <div className="text-xs text-emerald-700 font-semibold mb-1">AHORRO DE TIEMPO</div>
                                        <div className="text-2xl font-bold text-emerald-900">3 horas/mes</div>
                                        <div className="text-xs text-gray-600 mt-1">≈ $105.000 recuperados en facturación</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pilar 2: Gestión de Adherencia */}
                    <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[30px] p-6 md:p-10 border border-blue-200 shadow-[0_18px_50px_rgba(59,130,246,0.08)]">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-200">
                                    <div className="text-xs font-mono text-gray-500 mb-4 uppercase tracking-wider">Vista Previa: Panel de Adherencia</div>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="text-sm text-gray-600">Paciente: María A.</div>
                                            <div className="font-semibold text-gray-900">Asistencia: 12/12 sesiones</div>
                                            <div className="text-xs text-blue-700 mt-1">✓ Adherencia excelente</div>
                                        </div>
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <div className="text-sm text-gray-600">Paciente: Carlos R.</div>
                                            <div className="font-semibold text-gray-900">Faltas: 2 últimas sesiones</div>
                                            <div className="text-xs text-amber-700 mt-1">⚠️ Recordatorio automático enviado</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-xs text-blue-700 font-semibold mb-1">TU TASA DE RETENCIÓN</div>
                                            <div className="text-2xl font-bold text-blue-900">89%</div>
                                            <div className="text-xs text-gray-600 mt-1">+15% vs. promedio sin sistema</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2">
                                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-4">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Pilar 2</span>
                                </div>
                                <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                                    Gestión de Adherencia Terapéutica
                                </h3>
                                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                    <strong>Tus pacientes no abandonan por accidente.</strong> Sistema inteligente de seguimiento que identifica patrones de deserción antes de que ocurran.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Alertas de riesgo de abandono</p>
                                            <p className="text-sm text-gray-600">Notificaciones cuando un paciente cancela 2+ veces seguidas o no reagenda</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Recordatorios automáticos empáticos</p>
                                            <p className="text-sm text-gray-600">Mensajes personalizados 24h antes de cada sesión para reducir inasistencias</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Dashboard de progreso compartido</p>
                                            <p className="text-sm text-gray-600">El paciente visualiza su camino terapéutico, reforzando compromiso</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pilar 3: Cero Fricción en Cobranza */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[30px] p-6 md:p-10 border border-purple-200 shadow-[0_18px_50px_rgba(168,85,247,0.08)]">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full mb-4">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Pilar 3</span>
                                </div>
                                <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                                    Cero Fricción en Cobranza
                                </h3>
                                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                    <strong>Nunca más pidas el pago dentro de la sesión.</strong> Procesamiento automático seguro que preserva el encuadre terapéutico.
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Pago anticipado opcional</p>
                                            <p className="text-sm text-gray-600">El paciente paga al agendar. Tú solo te enfocas en la terapia</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Recordatorios de pago automáticos</p>
                                            <p className="text-sm text-gray-600">Sistema envía recordatorios empáticos sin tu intervención</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Depósito directo en 48 horas</p>
                                            <p className="text-sm text-gray-600">Transferencia a tu cuenta sin intermediarios ni retenciones inesperadas</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-purple-200">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Seguridad bancaria certificada</p>
                                            <p className="text-sm text-gray-600">
                                                Integración con Webpay Plus de Transbank. Tus pacientes pagan con la misma seguridad que en cualquier e-commerce chileno.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-200">
                                <div className="text-xs font-mono text-gray-500 mb-4 uppercase tracking-wider">Flujo de Pago Automatizado</div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">Paciente agenda sesión</p>
                                            <p className="text-xs text-gray-600">Pago procesado automáticamente</p>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">Boleta generada al SII</p>
                                            <p className="text-xs text-gray-600">Sin intervención manual</p>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">Depósito en tu cuenta</p>
                                            <p className="text-xs text-gray-600">Dentro de 48 horas hábiles</p>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4 mt-4">
                                        <div className="text-xs text-purple-700 font-semibold mb-1">TIEMPO INVOLUCRADO</div>
                                        <div className="text-3xl font-bold text-purple-900">0 minutos</div>
                                        <div className="text-xs text-gray-600 mt-1">Todo sucede en segundo plano</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 md:py-14 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />

                <div className="container-wide relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                            Profesionaliza tu consulta hoy
                        </h2>
                        <p className="text-xl md:text-2xl mb-7 opacity-90 leading-relaxed">
                            Únete a los <strong>500+ profesionales</strong> que recuperaron 6.5 horas al mes y <strong>$273.000 en costo de oportunidad</strong>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link
                                href="/registro?type=professional"
                                className="bg-white text-primary-900 hover:bg-gray-100 inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl"
                            >
                                Comenzar gratis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                            <Link
                                href="/demo"
                                className="btn-outline-light text-lg px-8 py-4"
                            >
                                Agendar demo personalizada
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
                            <div className="flex items-center gap-3 justify-center">
                                <CheckCircle2 className="w-6 h-6 text-primary-300" />
                                <span className="text-sm opacity-90">Sin compromiso de permanencia</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <CheckCircle2 className="w-6 h-6 text-primary-300" />
                                <span className="text-sm opacity-90">Configuración en 15 minutos</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <CheckCircle2 className="w-6 h-6 text-primary-300" />
                                <span className="text-sm opacity-90">Soporte técnico incluido</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
