import { Header, Footer } from '@/components/layout'
import Link from 'next/link'
import '@/styles/legal.css'
import { BackButton } from '@/components/ui/BackButton'

export const metadata = {
    title: { absolute: 'Términos y Condiciones | PsyDoctor' },
    description: 'Términos y condiciones de uso de la plataforma PsyDoctor - Plataforma de intermediación para servicios de salud mental',
    alternates: {
        canonical: '/terminos',
    },
}

export default function TerminosPage() {
    return (
        <>
            <Header />

            <div className="legal-layout">
                {/* Sidebar - Table of Contents */}
                <aside className="legal-toc-sidebar">
                    <nav className="legal-toc">
                        <h2 className="legal-toc-title">Contenido</h2>
                        <ol className="legal-toc-list">
                            <li className="legal-toc-item">
                                <a href="#seccion-1" className="legal-toc-link">
                                    <span className="legal-toc-number">1.</span>
                                    <span>Introducción y Aceptación</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-2" className="legal-toc-link">
                                    <span className="legal-toc-number">2.</span>
                                    <span>Naturaleza del Servicio</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-3" className="legal-toc-link">
                                    <span className="legal-toc-number">3.</span>
                                    <span>Registro y Cuentas de Usuario</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-4" className="legal-toc-link">
                                    <span className="legal-toc-number">4.</span>
                                    <span>Reserva y Cancelación de Sesiones</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-5" className="legal-toc-link">
                                    <span className="legal-toc-number">5.</span>
                                    <span>Pagos y Tarifas</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-6" className="legal-toc-link">
                                    <span className="legal-toc-number">6.</span>
                                    <span>Uso Prohibido y Exclusión de Emergencias</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-7" className="legal-toc-link">
                                    <span className="legal-toc-number">7.</span>
                                    <span>Protección de Datos</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-8" className="legal-toc-link">
                                    <span className="legal-toc-number">8.</span>
                                    <span>Limitación de Responsabilidad</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-9" className="legal-toc-link">
                                    <span className="legal-toc-number">9.</span>
                                    <span>Suspensión y Terminación</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-10" className="legal-toc-link">
                                    <span className="legal-toc-number">10.</span>
                                    <span>Ley Aplicable y Jurisdicción</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-11" className="legal-toc-link">
                                    <span className="legal-toc-number">11.</span>
                                    <span>Contacto</span>
                                </a>
                            </li>
                        </ol>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="legal-container">
                    <div className="legal-wrapper">
                        {/* Header */}
                        <div className="legal-header">
                            <h1 className="legal-title">
                                Términos y Condiciones de Uso
                            </h1>
                            <div className="legal-metadata">
                                <span className="legal-metadata-item">
                                    <strong>Versión:</strong> 1.1
                                </span>
                                <span className="legal-metadata-separator">•</span>
                                <span className="legal-metadata-item">
                                    <strong>Fecha de vigencia:</strong> 15 de enero de 2026
                                </span>
                                <span className="legal-metadata-separator">•</span>
                                <span className="legal-metadata-item">
                                    <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CL')}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="legal-content">

                            <h2 id="seccion-1" className="legal-section-title">1º Introducción y Aceptación.</h2>
                            <p className="legal-paragraph">
                                Bienvenido/a a <strong className="text-gray-900">PsyDoctor</strong> (en adelante, "la <strong>Plataforma</strong>", "nosotros", "nuestro" o "<strong>PsyDoctor</strong>").
                            </p>
                            <p className="legal-paragraph">
                                <strong className="text-gray-900">PsyDoctor</strong> es una plataforma tecnológica operada por <strong>FTC Consultores Chile SpA</strong>, RUT <strong>76.048.028-8</strong>, con domicilio en <strong>Padre Alberto Hurtado 0131, Estación Central, Santiago, Región Metropolitana</strong>.
                            </p>
                            <p className="legal-paragraph">
                                Al acceder, registrarse o utilizar cualquier funcionalidad de <strong className="text-gray-900">PsyDoctor</strong>, usted (en adelante, "el <strong>Usuario</strong>", "usted" o "su") acepta expresamente estos Términos y Condiciones, así como nuestra <Link href="/privacidad" className="legal-link">Política de Privacidad</Link> y demás políticas complementarias.
                            </p>
                            <p className="legal-paragraph text-semibold text-gray-900">
                                Si no está de acuerdo con estos términos, no utilice la Plataforma.
                            </p>

                            <h2 id="seccion-2" className="legal-section-title">2º Naturaleza del Servicio.</h2>

                            <h3 className="legal-subsection-title">2.1 PsyDoctor como Marketplace e Intermediario Tecnológico</h3>
                            <div className="legal-alert legal-alert-important">
                                <p className="legal-alert-title">⚠️ IMPORTANTE: ROL DE INTERMEDIACIÓN</p>
                                <p className="legal-alert-content">
                                    <strong className="text-gray-900">PsyDoctor</strong> es un <strong>marketplace de servicios</strong> de salud mental. Actúa de manera exclusiva como un **canal de comunicación y herramientas de apoyo administrativo** entre profesionales independientes y pacientes. La Plataforma:
                                </p>
                                <ul className="legal-list mt-4">
                                    <li className="legal-list-item">Dispone de un directorio digital para conectar a pacientes con profesionales independientes de salud mental.</li>
                                    <li className="legal-list-item">Facilita la búsqueda, comparación y reserva de sesiones.</li>
                                    <li className="legal-list-item">Proporciona infraestructura tecnológica (videollamadas, agenda, procesamiento de pagos).</li>
                                    <li className="legal-list-item"><strong>No es responsable de la experiencia final del cliente</strong>, ni del resultado clínico de las consultas.</li>
                                </ul>
                            </div>

                            <h3 className="legal-subsection-title">2.2 Responsabilidad Profesional Independiente y Ficha Clínica</h3>
                            <p className="legal-paragraph">
                                Todos los servicios profesionales de salud son provistos exclusivamente por <strong>profesionales independientes</strong> debidamente acreditados en la Superintendencia de Salud de Chile. En consecuencia:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">PsyDoctor no emplea, contrata ni tiene relaciones de subordinación con los profesionales listados.</li>
                                <li className="legal-list-item">La relación clínica y contractual se constituye de forma directa y exclusiva entre el profesional y el paciente.</li>
                                <li className="legal-list-item">De acuerdo con la <strong>Ley N° 20.584</strong>, el profesional independiente es el único responsable y custodio legal de la <strong>Ficha Clínica</strong>. PsyDoctor actúa solo como un proveedor de software con cifrado punto-a-punto y no tiene acceso, control ni custodia de dicho historial clínico.</li>
                            </ul>
                            <p className="legal-paragraph text-semibold text-gray-900">
                                Cada profesional es legalmente responsable de su propia práctica, diagnósticos, tratamientos, indicaciones médicas y de la experiencia general del paciente durante la consulta.
                            </p>

                            <h2 id="seccion-3" className="legal-section-title">3º Registro y Cuentas de Usuario.</h2>

                            <h3 className="legal-subsection-title">3.1 Requisitos de Registro</h3>
                            <p className="legal-paragraph">Para crear una cuenta, el <strong>Usuario</strong> debe:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Ser mayor de 18 años o contar con autorización de un tutor legal</li>
                                <li className="legal-list-item">Proporcionar información completa, veraz y actualizada</li>
                                <li className="legal-list-item">Crear credenciales seguras (email y contraseña)</li>
                                <li className="legal-list-item">Aceptar estos Términos y nuestra <Link href="/privacidad" className="legal-link">Política de Privacidad</Link></li>
                            </ul>

                            <h3 className="legal-subsection-title">3.2 Seguridad de la Cuenta</h3>
                            <p className="legal-paragraph">El <strong>Usuario</strong> es responsable de:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Mantener la confidencialidad de sus credenciales</li>
                                <li className="legal-list-item">Todas las actividades que ocurran bajo su cuenta</li>
                                <li className="legal-list-item">Notificar inmediatamente cualquier uso no autorizado</li>
                            </ul>

                            <h2 id="seccion-4" className="legal-section-title">4º Reserva y Cancelación de Sesiones.</h2>

                            <h3 className="legal-subsection-title">4.1 Política de Cancelación</h3>
                            <div className="legal-info-box">
                                <p className="legal-info-box-title">Cancelación por el Paciente:</p>
                                <ul className="legal-list mb-4">
                                    <li className="legal-list-item"><strong>Con más de 24 horas:</strong> Reembolso del 100%</li>
                                    <li className="legal-list-item"><strong>Entre 24 y 12 horas:</strong> Reembolso del 50%</li>
                                    <li className="legal-list-item"><strong>Menos de 12 horas o no asistencia:</strong> Sin reembolso</li>
                                </ul>
                                <p className="legal-info-box-title">Cancelación por el Profesional:</p>
                                <ul className="legal-list mb-0">
                                    <li className="legal-list-item">Debe cancelar con al menos 24 horas de anticipación</li>
                                    <li className="legal-list-item">El paciente recibirá reembolso del 100% inmediato</li>
                                </ul>
                            </div>

                            <h2 id="seccion-5" className="legal-section-title">5º Pagos y Tarifas.</h2>
                            <p className="legal-paragraph">
                                Los pagos son procesados por <strong>pasarelas de pago certificadas PCI-DSS</strong> (Flow.cl, Stripe). <strong className="text-gray-900">PsyDoctor</strong> no almacena datos completos de tarjetas de crédito.
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Los precios son fijados libremente por cada profesional</li>
                                <li className="legal-list-item"><strong className="text-gray-900">PsyDoctor</strong> cobra una comisión de servicio sobre cada transacción</li>
                                <li className="legal-list-item">Los reembolsos se procesan en 5-10 días hábiles</li>
                            </ul>

                            <h2 id="seccion-6" className="legal-section-title">6º Uso Prohibido y Exclusión de Emergencias.</h2>

                            <div className="legal-emergency-box">
                                <h3 className="legal-emergency-title">
                                    <span>⚠️</span> LA PLATAFORMA NO ESTÁ DISEÑADA PARA EMERGENCIAS
                                </h3>
                                <p className="legal-alert-content">
                                    Si usted o alguien que conoce está experimentando ideas suicidas, psicosis aguda, violencia hacia sí mismo o terceros, o cualquier otra emergencia de salud mental:
                                </p>
                                <div className="legal-emergency-contacts">
                                    <p className="legal-emergency-contacts-title">CONTACTE INMEDIATAMENTE:</p>
                                    <ul className="legal-list mb-0">
                                        <li className="legal-list-item"><strong>Salud Responde:</strong> 600 360 7777 (24/7)</li>
                                        <li className="legal-list-item"><strong>SAMU:</strong> 131</li>
                                        <li className="legal-list-item"><strong>Línea de Prevención del Suicidio:</strong> 600 360 7777</li>
                                    </ul>
                                </div>
                                <p className="legal-alert-content mb-0">
                                    <strong className="text-gray-900">PsyDoctor</strong> no ofrece servicios de intervención en crisis ni atención de emergencia.
                                </p>
                            </div>

                            <h2 id="seccion-7" className="legal-section-title">7º Protección de Datos.</h2>
                            <p className="legal-paragraph">
                                El tratamiento de sus datos personales se rige por nuestra <Link href="/privacidad" className="legal-link">Política de Privacidad</Link>, en cumplimiento de la <strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada de Chile.
                            </p>
                            <p className="legal-paragraph">
                                Las <strong>notas clínicas</strong> son responsabilidad exclusiva del profesional tratante y están protegidas con <strong>cifrado punto-a-punto AES-256</strong>. <strong className="text-gray-900">PsyDoctor</strong> no accede, lee ni procesa el contenido clínico.
                            </p>

                            <h2 id="seccion-8" className="legal-section-title">8º Limitación de Responsabilidad.</h2>

                            <h3 className="legal-subsection-title">8.1 Exclusión de Garantías</h3>
                            <p className="legal-paragraph">
                                PsyDoctor proporciona la Plataforma y sus herramientas de comunicación <strong>"TAL CUAL"</strong> y <strong>"SEGÚN DISPONIBILIDAD"</strong>, sin garantías de ningún tipo respecto a:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Disponibilidad ininterrumpida o libre de errores de red o servidores.</li>
                                <li className="legal-list-item">Resultados o efectividad terapéutica específicos de las atenciones.</li>
                                <li className="legal-list-item">Compatibilidad total con el hardware del usuario.</li>
                            </ul>

                            <h3 className="legal-subsection-title">8.2 No Responsabilidad por Servicios Profesionales y Experiencia del Cliente</h3>
                            <p className="legal-paragraph text-bold text-gray-900">
                                Dado que PsyDoctor es un marketplace y solo dispone de un canal de comunicación e intermediación tecnológica, <strong className="text-gray-900">PsyDoctor NO SE HACE RESPONSABLE</strong> bajo ninguna circunstancia por:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">La experiencia final del paciente o profesional durante o después del uso de los servicios de comunicación de la Plataforma.</li>
                                <li className="legal-list-item">La calidad, veracidad, idoneidad o resultados de las consultas o terapias clínicas prestadas.</li>
                                <li className="legal-list-item">Diagnósticos, recetas, tratamientos, opiniones o conductas del profesional.</li>
                                <li className="legal-list-item">Cualquier perjuicio derivado de la relación clínica, negligencia, mala praxis o incumplimiento por parte del profesional independiente.</li>
                            </ul>
                            <p className="legal-paragraph">
                                Cualquier reclamo respecto a la práctica clínica o la experiencia personal de la atención médica o psicológica debe gestionarse de forma directa con el profesional contratado, o bien acudiendo a los organismos sanitarios y fiscales competentes en Chile.
                            </p>

                            <h2 id="seccion-9" className="legal-section-title">9º Suspensión y Terminación.</h2>
                            <p className="legal-paragraph">
                                <strong className="text-gray-900">PsyDoctor</strong> puede suspender o deshabilitar cuentas en caso de:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Violación de estos Términos o políticas complementarias</li>
                                <li className="legal-list-item">Actividad fraudulenta o sospechosa</li>
                                <li className="legal-list-item">Múltiples reclamos fundamentados de otros usuarios</li>
                                <li className="legal-list-item">Falta de verificación de credenciales profesionales</li>
                                <li className="legal-list-item">Orden de autoridad competente</li>
                            </ul>

                            <h2 id="seccion-10" className="legal-section-title">10º Ley Aplicable y Jurisdicción.</h2>
                            <p className="legal-paragraph">
                                Estos Términos se rigen por las leyes de la <strong>República de Chile</strong>. Cualquier controversia derivada de estos Términos se someterá a la jurisdicción de los tribunales ordinarios de justicia de <strong>Santiago, Chile</strong>, renunciando las partes expresamente a cualquier otro fuero que pudiera corresponderles.
                            </p>

                            <h2 id="seccion-11" className="legal-section-title">11º Contacto.</h2>
                            <div className="legal-contact-box">
                                <p><strong>Email:</strong> <a href="mailto:contacto@psydoctor.cl" className="legal-link">contacto@psydoctor.cl</a></p>
                                <p><strong>Email Legal:</strong> <a href="mailto:legal@psydoctor.cl" className="legal-link">legal@psydoctor.cl</a></p>
                                <p><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs (Chile Continental)</p>
                            </div>

                            <div className="legal-footer">
                                <p className="legal-footer-text text-bold">
                                    Al hacer clic en "Acepto" o al utilizar cualquier funcionalidad de PsyDoctor, usted reconoce haber leído, comprendido y aceptado estos Términos y Condiciones en su totalidad.
                                </p>
                                <div className="legal-footer-links">
                                    <Link href="/privacidad" className="legal-link">
                                        Ver Política de Privacidad
                                    </Link>
                                    <BackButton variant="chevron" className="legal-link" />
                                </div>
                            </div>

                            <p className="legal-disclaimer">
                                Documento preparado con asesoría legal especializada en plataformas digitales de salud. Revisión recomendada por abogado local antes de publicación final.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    )
}
