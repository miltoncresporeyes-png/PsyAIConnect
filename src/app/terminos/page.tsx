import { Header, Footer } from '@/components/layout'
import Link from 'next/link'
import '@/styles/legal.css'

export const metadata = {
    title: 'Términos y Condiciones | PsyConnect',
    description: 'Términos y condiciones de uso de la plataforma PsyConnect - Plataforma de intermediación para servicios de salud mental',
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
                                    <strong>Versión:</strong> 1.0
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
                                Bienvenido/a a <strong className="text-gray-900">PsyConnect</strong> (en adelante, "la <strong>Plataforma</strong>", "nosotros", "nuestro" o "<strong>PsyConnect</strong>").
                            </p>
                            <p className="legal-paragraph">
                                <strong className="text-gray-900">PsyConnect</strong> es una plataforma tecnológica operada por <strong>FTC Consultores Chile SpA</strong>, RUT <strong>76.048.028-8</strong>, con domicilio en <strong>Padre Alberto Hurtado 0131, Estación Central, Santiago, Región Metropolitana</strong>.
                            </p>
                            <p className="legal-paragraph">
                                Al acceder, registrarse o utilizar cualquier funcionalidad de <strong className="text-gray-900">PsyConnect</strong>, usted (en adelante, "el <strong>Usuario</strong>", "usted" o "su") acepta expresamente estos Términos y Condiciones, así como nuestra <Link href="/privacidad" className="legal-link">Política de Privacidad</Link> y demás políticas complementarias.
                            </p>
                            <p className="legal-paragraph text-semibold text-gray-900">
                                Si no está de acuerdo con estos términos, no utilice la Plataforma.
                            </p>

                            <h2 id="seccion-2" className="legal-section-title">2º Naturaleza del Servicio.</h2>

                            <h3 className="legal-subsection-title">2.1 PsyConnect como Intermediario Tecnológico</h3>
                            <div className="legal-alert legal-alert-important">
                                <p className="legal-alert-title">⚠️ IMPORTANTE</p>
                                <p className="legal-alert-content">
                                    <strong className="text-gray-900">PsyConnect</strong> <strong>NO es un proveedor de servicios de salud mental</strong> ni una institución clínica. Somos una <strong>plataforma de intermediación digital</strong> que:
                                </p>
                                <ul className="legal-list mt-4">
                                    <li className="legal-list-item">Conecta a pacientes con profesionales independientes de salud mental</li>
                                    <li className="legal-list-item">Facilita la búsqueda, comparación y reserva de sesiones terapéuticas</li>
                                    <li className="legal-list-item">Proporciona herramientas administrativas (agenda, pagos, notas clínicas cifradas)</li>
                                    <li className="legal-list-item">Procesa pagos de forma segura entre pacientes y profesionales</li>
                                </ul>
                            </div>

                            <h3 className="legal-subsection-title">2.2 Responsabilidad Profesional Independiente</h3>
                            <p className="legal-paragraph">
                                Todos los servicios clínicos son provistos exclusivamente por <strong>profesionales independientes</strong> debidamente licenciados. <strong className="text-gray-900">PsyConnect</strong>:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">No emplea a los profesionales listados en la <strong>Plataforma</strong></li>
                                <li className="legal-list-item">No supervisa la práctica clínica ni el contenido terapéutico de las sesiones</li>
                                <li className="legal-list-item">No controla, garantiza ni asume responsabilidad por la calidad, seguridad, efectividad o legalidad de los servicios profesionales prestados</li>
                            </ul>
                            <p className="legal-paragraph text-semibold text-gray-900">
                                Cada profesional es legalmente responsable de su práctica, diagnósticos, tratamientos y cumplimiento de normativas sanitarias aplicables.
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
                                Los pagos son procesados por <strong>pasarelas de pago certificadas PCI-DSS</strong> (Flow.cl, Stripe). <strong className="text-gray-900">PsyConnect</strong> no almacena datos completos de tarjetas de crédito.
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Los precios son fijados libremente por cada profesional</li>
                                <li className="legal-list-item"><strong className="text-gray-900">PsyConnect</strong> cobra una comisión de servicio sobre cada transacción</li>
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
                                    <strong className="text-gray-900">PsyConnect</strong> no ofrece servicios de intervención en crisis ni atención de emergencia.
                                </p>
                            </div>

                            <h2 id="seccion-7" className="legal-section-title">7º Protección de Datos.</h2>
                            <p className="legal-paragraph">
                                El tratamiento de sus datos personales se rige por nuestra <Link href="/privacidad" className="legal-link">Política de Privacidad</Link>, en cumplimiento de la <strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada de Chile.
                            </p>
                            <p className="legal-paragraph">
                                Las <strong>notas clínicas</strong> son responsabilidad exclusiva del profesional tratante y están protegidas con <strong>cifrado punto-a-punto AES-256</strong>. <strong className="text-gray-900">PsyConnect</strong> no accede, lee ni procesa el contenido clínico.
                            </p>

                            <h2 id="seccion-8" className="legal-section-title">8º Limitación de Responsabilidad.</h2>

                            <h3 className="legal-subsection-title">8.1 Exclusión de Garantías</h3>
                            <p className="legal-paragraph">
                                PsyConnect proporciona la Plataforma <strong>"TAL CUAL"</strong> y <strong>"SEGÚN DISPONIBILIDAD"</strong>, sin garantías de ningún tipo respecto a:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Disponibilidad continua o libre de errores</li>
                                <li className="legal-list-item">Resultados terapéuticos específicos</li>
                                <li className="legal-list-item">Compatibilidad total con todos los dispositivos</li>
                            </ul>

                            <h3 className="legal-subsection-title">8.2 No Responsabilidad por Servicios Profesionales</h3>
                            <p className="legal-paragraph text-bold text-gray-900">
                                <strong className="text-gray-900">PsyConnect</strong> NO ES RESPONSABLE por:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">La calidad, eficacia o resultados de los servicios clínicos prestados por profesionales</li>
                                <li className="legal-list-item">Diagnósticos, tratamientos o consejos proporcionados por profesionales</li>
                                <li className="legal-list-item">Daños derivados de la relación terapéutica entre el <strong>Usuario</strong> y el profesional</li>
                                <li className="legal-list-item">Incumplimientos contractuales, negligencia o mala praxis del profesional</li>
                            </ul>
                            <p className="legal-paragraph">
                                Cualquier reclamación relacionada con la práctica profesional debe dirigirse directamente al profesional tratante y, si corresponde, a los organismos reguladores competentes (Superintendencia de Salud, Colegios Profesionales).
                            </p>

                            <h2 id="seccion-9" className="legal-section-title">9º Suspensión y Terminación.</h2>
                            <p className="legal-paragraph">
                                <strong className="text-gray-900">PsyConnect</strong> puede suspender o deshabilitar cuentas en caso de:
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
                                <p><strong>Email:</strong> <a href="mailto:soporte@psyconnect.cl" className="legal-link">soporte@psyconnect.cl</a></p>
                                <p><strong>Email Legal:</strong> <a href="mailto:legal@psyconnect.cl" className="legal-link">legal@psyconnect.cl</a></p>
                                <p><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs (Chile Continental)</p>
                            </div>

                            <div className="legal-footer">
                                <p className="legal-footer-text text-bold">
                                    Al hacer clic en "Acepto" o al utilizar cualquier funcionalidad de PsyConnect, usted reconoce haber leído, comprendido y aceptado estos Términos y Condiciones en su totalidad.
                                </p>
                                <div className="legal-footer-links">
                                    <Link href="/privacidad" className="legal-link">
                                        Ver Política de Privacidad
                                    </Link>
                                    <Link href="/" className="legal-link">
                                        Volver al inicio
                                    </Link>
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
