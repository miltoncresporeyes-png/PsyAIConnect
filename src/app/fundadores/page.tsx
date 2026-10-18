import { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout/shell'
import { ArrowLeft, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: { absolute: 'Programa Profesionales Fundadores | Términos y Condiciones | PsyDoctor Chile' },
    description: 'Términos y condiciones del Programa Profesionales Fundadores de PsyDoctor. Convocatoria de pre-lanzamiento para psicólogos y psiquiatras inscritos en el Registro de la Superintendencia de Salud.',
    alternates: {
        canonical: 'https://psydoctor.cl/fundadores',
    },
}

export default function FundadoresPage() {
    return (
        <>
            <Header />

            <PageContainer variant="white" size="wide" padding="lg">
                <div className="max-w-4xl mx-auto mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-full transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Volver al inicio
                    </Link>
                </div>

                {/* Hero / Header */}
                <div className="max-w-4xl mx-auto mb-10 pb-8 border-b border-slate-200">
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-4 shadow-2xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                        <span>Versión 1.0 | Vigente desde 18 de octubre de 2026</span>
                    </div>

                    <PageHeader
                        title="Programa Profesionales Fundadores"
                        description="TÉRMINOS DEL PROGRAMA &ldquo;PROFESIONALES FUNDADORES&rdquo; DE PSYDOCTOR"
                        titleClassName="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900"
                    />

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                        <Link
                            href="/registro?tipo=profesional&programa=fundador"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
                        >
                            <UserPlus className="h-4 w-4" aria-hidden="true" />
                            <span>Quiero ser Profesional Fundador</span>
                        </Link>
                        <span className="text-xs text-slate-500">
                            Postulación individual sujeta a validación en el Registro de la Superintendencia de Salud.
                        </span>
                    </div>
                </div>

                {/* Legal Body */}
                <article className="max-w-4xl mx-auto pb-16">
                    <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 mb-8">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-teal-700 mt-0.5 flex-shrink-0" />
                            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                <p className="font-semibold text-teal-950 mb-1">
                                    Aviso de Transparencia Legal
                                </p>
                                <p>
                                    Las presentes condiciones regulan de forma específica la participación en el Programa Profesionales Fundadores de <strong>PsyDoctor SpA</strong> y complementan los <Link href="/terminos" className="text-teal-800 underline font-medium">Términos de Uso</Link> y la <Link href="/privacidad" className="text-teal-800 underline font-medium">Política de Privacidad</Link>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 text-slate-800 text-sm sm:text-base leading-relaxed">
                        {/* 1 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                1. QUÉ ES EL PROGRAMA
                            </h2>
                            <p>
                                PsyDoctor SpA (&ldquo;PsyDoctor&rdquo;) ofrece a un grupo limitado de profesionales de la salud mental la posibilidad de incorporarse a la plataforma en su etapa de lanzamiento con condiciones preferentes (&ldquo;Programa Fundadores&rdquo;).
                            </p>
                        </div>

                        {/* 2 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                2. CUPOS
                            </h2>
                            <p>
                                El Programa tiene un máximo de 20 cupos. Los cupos se asignan por orden de aprobación del perfil (no de registro) y hasta agotar disponibilidad. PsyDoctor puede cerrar el Programa antes si se completan los cupos.
                            </p>
                        </div>

                        {/* 3 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                3. QUIÉNES PUEDEN PARTICIPAR
                            </h2>
                            <p className="mb-2">Psicólogos y psiquiatras que:</p>
                            <ol className="list-none space-y-2 pl-2">
                                <li><strong>a)</strong> estén inscritos y vigentes en el Registro Nacional de Prestadores Individuales de la Superintendencia de Salud;</li>
                                <li><strong>b)</strong> entreguen información veraz y completa en su perfil;</li>
                                <li><strong>c)</strong> acepten estos Términos, los <Link href="/terminos" className="text-teal-800 underline font-medium">Términos de Uso</Link> y la <Link href="/privacidad" className="text-teal-800 underline font-medium">Política de Privacidad</Link> de la plataforma.</li>
                            </ol>
                            <p className="mt-3">
                                PsyDoctor verificará la inscripción en el Registro antes de aprobar el perfil y puede rechazar solicitudes que no cumplan estos requisitos.
                            </p>
                        </div>

                        {/* 4 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                4. BENEFICIOS
                            </h2>
                            <ol className="list-none space-y-2 pl-2">
                                <li>
                                    <strong>a)</strong> 12 meses sin costo de suscripción, contados desde la fecha en que el perfil sea aprobado y activado (&ldquo;Período Preferente&rdquo;).
                                </li>
                                <li>
                                    <strong>b)</strong> Insignia de &ldquo;Profesional Fundador&rdquo; y perfil destacado durante los primeros 6 meses desde el lanzamiento público de la plataforma.
                                </li>
                                <li>
                                    <strong>c)</strong> Canal directo con el equipo de PsyDoctor para sugerencias y mejoras.
                                </li>
                            </ol>
                        </div>

                        {/* 5 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                5. LO QUE NO INCLUYE
                            </h2>
                            <ol className="list-none space-y-2 pl-2">
                                <li>
                                    <strong>a)</strong> Costos de terceros asociados a pagos (por ejemplo, comisiones de procesamiento de medios de pago), que se informarán en <Link href="/planes" className="text-teal-800 underline font-medium">/planes</Link>.
                                </li>
                                <li>
                                    <strong>b)</strong> Garantía de cantidad de pacientes, ingresos o reservas. PsyDoctor es una plataforma de intermediación tecnológica y no asegura resultados comerciales.
                                </li>
                                <li>
                                    <strong>c)</strong> Exclusividad: el profesional puede ejercer y ofrecer sus servicios por cualquier otro medio.
                                </li>
                            </ol>
                        </div>

                        {/* 6 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                6. TÉRMINO DEL PERÍODO PREFERENTE
                            </h2>
                            <p>
                                Al finalizar el Período Preferente, la cuenta pasará al plan vigente en <Link href="/planes" className="text-teal-800 underline font-medium">/planes</Link>. PsyDoctor avisará por correo con al menos 60 días de anticipación. No se realizará ningún cobro sin que el profesional haya aceptado expresamente el plan que corresponda. Si no lo acepta, su perfil pasará a estado inactivo y no se le cobrará.
                            </p>
                        </div>

                        {/* 7 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                7. MODIFICACIONES
                            </h2>
                            <p>
                                PsyDoctor puede modificar estos Términos o las condiciones del Programa avisando por correo con al menos 60 días de anticipación. Los cambios no afectarán el Período Preferente ya otorgado. Si el profesional no está de acuerdo, puede cerrar su cuenta sin costo.
                            </p>
                        </div>

                        {/* 8 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                8. OBLIGACIONES DEL PROFESIONAL
                            </h2>
                            <ol className="list-none space-y-2 pl-2">
                                <li><strong>a)</strong> Mantener vigente su inscripción en el Registro y comunicar de inmediato cualquier suspensión, sanción o cancelación.</li>
                                <li><strong>b)</strong> Ejercer conforme a la normativa vigente (incluyendo la Ley N° 20.584 y Ley N° 19.628) y a su código de ética profesional.</li>
                                <li><strong>c)</strong> No usar la plataforma para publicidad engañosa ni prometer resultados terapéuticos.</li>
                                <li><strong>d)</strong> Ser el único responsable de su práctica clínica, de sus fichas clínicas y de la atención que entregue.</li>
                            </ol>
                        </div>

                        {/* 9 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                9. PÉRDIDA DEL BENEFICIO Y SUSPENSIÓN
                            </h2>
                            <p>
                                PsyDoctor puede suspender o terminar la participación del profesional, sin derecho a compensación, si: (i) la información entregada es falsa; (ii) pierde su inscripción vigente; (iii) incumple estos Términos o los Términos de Uso; o (iv) existen reclamos fundados que afecten a pacientes o a la plataforma. PsyDoctor comunicará el motivo por escrito.
                            </p>
                        </div>

                        {/* 10 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                10. INTRANSFERIBILIDAD
                            </h2>
                            <p>
                                El beneficio es personal e intransferible, y no puede cederse ni venderse.
                            </p>
                        </div>

                        {/* 11 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                11. IMAGEN Y DATOS DEL PROFESIONAL
                            </h2>
                            <p>
                                El profesional autoriza expresamente a PsyDoctor a mostrar su nombre, foto, especialidad, número de registro y datos de su perfil en la plataforma. Puede revocar esta autorización en cualquier momento eliminando su perfil. Los datos personales se tratarán según la <Link href="/privacidad" className="text-teal-800 underline font-medium">Política de Privacidad</Link>.
                            </p>
                        </div>

                        {/* 12 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                12. DURACIÓN Y TÉRMINO DEL PROGRAMA
                            </h2>
                            <p>
                                El Programa puede finalizar o modificarse por decisión de PsyDoctor con aviso de 60 días, sin afectar los Períodos Preferentes ya otorgados.
                            </p>
                        </div>

                        {/* 13 */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                                13. LEY APLICABLE Y CONTACTO
                            </h2>
                            <p>
                                Estos Términos se rigen por las leyes de la República de Chile. Para cualquier controversia derivada del presente instrumento, las partes fijan domicilio en la ciudad y comuna de Santiago de Chile y se someten a la competencia de sus Tribunales Ordinarios de Justicia. Para consultas o comunicaciones: <a href="mailto:contacto@psydoctor.cl" className="text-teal-800 underline font-medium">contacto@psydoctor.cl</a>.
                            </p>
                        </div>
                    </div>

                    {/* Final CTA Card */}
                    <div className="mt-12 rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                ¿Cumples con los requisitos?
                            </h3>
                            <p className="text-xs sm:text-sm text-teal-100/85">
                                Postula como uno de los 20 Profesionales Fundadores de PsyDoctor en Chile.
                            </p>
                        </div>
                        <Link
                            href="/registro?tipo=profesional&programa=fundador"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-teal-50 flex-shrink-0"
                        >
                            <UserPlus className="h-4 w-4 text-teal-800" aria-hidden="true" />
                            <span>Quiero ser Profesional Fundador</span>
                        </Link>
                    </div>
                </article>
            </PageContainer>

            <Footer />
        </>
    )
}
