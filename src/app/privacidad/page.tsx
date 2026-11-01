import { Header, Footer } from '@/components/layout'
import Link from 'next/link'
import '@/styles/legal.css'
import { BackButton } from '@/components/ui/BackButton'

export const metadata = {
    title: { absolute: 'Política de Privacidad | PsyDoctor' },
    description: 'Política de privacidad y protección de datos de PsyDoctor - Cumplimiento Ley 19.628 y preparación Ley 21.719 en Chile',
    alternates: {
        canonical: '/privacidad',
    },
}

export default function PrivacidadPage() {
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
                                    <span>Introducción</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-2" className="legal-toc-link">
                                    <span className="legal-toc-number">2.</span>
                                    <span>Marco Legal y Normativo</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-3" className="legal-toc-link">
                                    <span className="legal-toc-number">3.</span>
                                    <span>Responsable del Tratamiento de Datos</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-4" className="legal-toc-link">
                                    <span className="legal-toc-number">4.</span>
                                    <span>Datos Personales que Recopilamos</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-5" className="legal-toc-link">
                                    <span className="legal-toc-number">5.</span>
                                    <span>Finalidades del Tratamiento de Datos</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-6" className="legal-toc-link">
                                    <span className="legal-toc-number">6.</span>
                                    <span>Compartición de Datos con Terceros</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-7" className="legal-toc-link">
                                    <span className="legal-toc-number">7.</span>
                                    <span>Seguridad de los Datos</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-8" className="legal-toc-link">
                                    <span className="legal-toc-number">8.</span>
                                    <span>Conservación de Datos</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-9" className="legal-toc-link">
                                    <span className="legal-toc-number">9.</span>
                                    <span>Sus Derechos como Titular de Datos (ARCO)</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-10" className="legal-toc-link">
                                    <span className="legal-toc-number">10.</span>
                                    <span>Cookies y Tecnologías Similares</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-11" className="legal-toc-link">
                                    <span className="legal-toc-number">11.</span>
                                    <span>Menores de Edad</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-12" className="legal-toc-link">
                                    <span className="legal-toc-number">12.</span>
                                    <span>Cambios a esta Política</span>
                                </a>
                            </li>
                            <li className="legal-toc-item">
                                <a href="#seccion-13" className="legal-toc-link">
                                    <span className="legal-toc-number">13.</span>
                                    <span>Contacto y Reclamos</span>
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
                                Política de Privacidad
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
                                    <strong>Última actualización:</strong> 2026
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="legal-content">

                            <h2 id="seccion-1" className="legal-section-title">1º Introducción.</h2>
                            <p className="legal-paragraph">
                                En <strong className="text-gray-900">PsyDoctor</strong> (en adelante, "nosotros", "nuestro" o "la <strong>Plataforma</strong>"), operado por <strong>PsyDoctor SpA</strong>, nos comprometemos a proteger la privacidad y los datos personales de nuestros usuarios.
                            </p>
                            <p className="legal-paragraph">
                                Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos, compartimos y protegemos su información personal cuando utiliza nuestra plataforma digital de gestión clínica y conexión en salud mental.
                            </p>

                            <h2 id="seccion-2" className="legal-section-title">2º Marco Legal y Normativo.</h2>
                            <p className="legal-paragraph">Esta Política de Privacidad y el tratamiento de datos en PsyDoctor se rigen estrictamente por la legislación chilena y estándares internacionales aplicables:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item"><strong>Ley N° 19.628 y adecuación progresiva a la Ley N° 21.719:</strong> Sobre Protección de la Vida Privada y Protección de Datos Personales (conforme a la entrada en vigor formal de la Ley 21.719 el 1 de diciembre de 2026), estableciendo estándares reforzados de licitud, proporcionalidad, seguridad y responsabilidad proactiva en datos sensibles de salud.</li>
                                <li className="legal-list-item"><strong>Ley N° 20.584:</strong> Que regula los Derechos y Deberes que tienen las personas en relación con acciones vinculadas a su atención en salud (reserva de la ficha clínica, confidencialidad y consentimiento informado).</li>
                                <li className="legal-list-item"><strong>Ley N° 21.668:</strong> Que modifica la Ley 20.584 para regular la interoperabilidad y estándares de seguridad de las fichas clínicas electrónicas.</li>
                                <li className="legal-list-item"><strong>Estándares Internacionales:</strong> Preparación y alineación con GDPR (Unión Europea) y LGPD (Brasil).</li>
                            </ul>

                            <h2 id="seccion-3" className="legal-section-title">3º Responsable del Tratamiento de Datos.</h2>
                            <div className="legal-contact-box">
                                <p><strong>Responsable:</strong> PsyDoctor SpA</p>
                                <p><strong>Email de Privacidad:</strong> <a href="mailto:privacidad@psydoctor.cl" className="legal-link">privacidad@psydoctor.cl</a></p>
                                <p><strong>Domicilio:</strong> Santiago, Región Metropolitana, Chile</p>
                                <p><strong>Oficial de Privacidad:</strong> Equipo de Privacidad y Cumplimiento Normativo</p>
                            </div>

                            <h2 id="seccion-4" className="legal-section-title">4º Datos Personales que Recopilamos.</h2>

                            <h3 className="legal-subsection-title">4.1 Datos de Identificación y Contacto</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Nombre completo</li>
                                <li className="legal-list-item">Correo electrónico</li>
                                <li className="legal-list-item">Número de teléfono</li>
                                <li className="legal-list-item">Fecha de nacimiento</li>
                                <li className="legal-list-item">Fotografía de perfil (opcional)</li>
                            </ul>

                            <h3 className="legal-subsection-title">4.2 Datos Específicos de Pacientes</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Género, región y comuna de residencia</li>
                                <li className="legal-list-item">Ocupación y estado civil</li>
                                <li className="legal-list-item">Sistema de salud (FONASA, ISAPRE, Privado)</li>
                                <li className="legal-list-item">Historial de terapia previa</li>
                                <li className="legal-list-item">Motivo de consulta</li>
                                <li className="legal-list-item">Áreas de interés terapéutico</li>
                                <li className="legal-list-item">Preferencias de modalidad y género del profesional</li>
                                <li className="legal-list-item">Contacto de emergencia (nombre, relación, teléfono)</li>
                            </ul>

                            <h3 className="legal-subsection-title">4.3 Datos Específicos de Profesionales</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Tipo de profesional y número de registro en la Superintendencia de Salud</li>
                                <li className="legal-list-item">Título profesional verificado</li>
                                <li className="legal-list-item">Especialidades y enfoques terapéuticos</li>
                                <li className="legal-list-item">Biografía profesional y experiencia clínica</li>
                                <li className="legal-list-item">Modalidad de atención (online, presencial o ambas)</li>
                                <li className="legal-list-item">Precio de sesión y duración</li>
                            </ul>

                            <h3 className="legal-subsection-title">4.4 Datos de Uso de la Plataforma</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Navegación, páginas visitadas, tiempo de permanencia</li>
                                <li className="legal-list-item">Búsquedas realizadas y filtros aplicados</li>
                                <li className="legal-list-item">Historial de citas</li>
                                <li className="legal-list-item">Dispositivo utilizado, sistema operativo</li>
                                <li className="legal-list-item">Dirección IP y cookies</li>
                            </ul>

                            <h3 className="legal-subsection-title">4.5 Datos de Pago y Transacciones</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Método de pago utilizado</li>
                                <li className="legal-list-item">Últimos 4 dígitos de tarjeta (solo referencia)</li>
                                <li className="legal-list-item">Historial de transacciones</li>
                                <li className="legal-list-item">Tokens de pasarela de pago</li>
                            </ul>
                            <p className="legal-paragraph text-gray-700" style={{ fontSize: '0.875rem' }}>
                                <strong>Nota:</strong> Los datos completos de tarjetas NO se almacenan en PsyDoctor, son manejados por procesadores certificados PCI-DSS.
                            </p>

                            <h3 className="legal-subsection-title">4.6 Datos Sensibles de Salud</h3>
                            <div className="legal-alert legal-alert-warning">
                                <p className="legal-alert-title">⚠️ DATOS DE CATEGORÍA ESPECIAL</p>
                                <p className="legal-alert-content">
                                    Las <strong>fichas y notas clínicas</strong> son gestionadas exclusivamente por profesionales tratantes y están almacenadas con <strong>cifrado seguro en reposo y en tránsito</strong>.
                                </p>
                                <p className="legal-alert-content mb-0">
                                    <strong>PsyDoctor NO accede, lee ni procesa el contenido clínico confidencial para fines publicitarios ni comerciales.</strong>
                                </p>
                            </div>

                            <h2 id="seccion-5" className="legal-section-title">5º Finalidades del Tratamiento de Datos.</h2>
                            <p className="legal-paragraph">Utilizamos sus datos para:</p>

                            <h3 className="legal-subsection-title">5.1 Provisión del Servicio</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Crear y gestionar su cuenta de usuario</li>
                                <li className="legal-list-item">Facilitar la búsqueda de profesionales y reserva de citas</li>
                                <li className="legal-list-item">Procesar pagos y comprobantes</li>
                                <li className="legal-list-item">Enviar confirmaciones y recordatorios de citas</li>
                                <li className="legal-list-item">Proporcionar soporte técnico</li>
                            </ul>

                            <h3 className="legal-subsection-title">5.2 Seguridad y Prevención de Fraude</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Verificar identidad y registro profesional ante la Superintendencia</li>
                                <li className="legal-list-item">Detectar y prevenir actividades fraudulentas</li>
                                <li className="legal-list-item">Proteger la seguridad e integridad de la Plataforma</li>
                            </ul>

                            <h3 className="legal-subsection-title">5.3 Comunicaciones de Marketing</h3>
                            <p className="legal-paragraph">
                                Con su <strong>consentimiento explícito</strong>, podemos enviar:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Newsletters con contenido educativo</li>
                                <li className="legal-list-item">Promociones especiales</li>
                                <li className="legal-list-item">Invitaciones a webinars</li>
                            </ul>
                            <p className="legal-paragraph" style={{ fontSize: '0.875rem' }}>
                                <strong>Siempre con opción de darse de baja (opt-out)</strong> en cada comunicación.
                            </p>

                            <h2 id="seccion-6" className="legal-section-title">6º Compartición de Datos con Terceros.</h2>

                            <h3 className="legal-subsection-title">6.1 Proveedores de Servicios</h3>
                            <p className="legal-paragraph">Compartimos datos técnicos indispensables para la operación segura de la Plataforma:</p>
                            <div className="legal-table-container">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Proveedor</th>
                                            <th>Función</th>
                                            <th>Ubicación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>PostgreSQL / Infraestructura Cloud</td>
                                            <td>Hosting de base de datos cifrada</td>
                                            <td>EE.UU. / EU</td>
                                        </tr>
                                        <tr>
                                            <td>Vercel</td>
                                            <td>Hosting y CDN de aplicación</td>
                                            <td>EE.UU. / Global</td>
                                        </tr>
                                        <tr>
                                            <td>Pasarelas Bancarias (Transbank / Flow)</td>
                                            <td>Procesamiento de pagos en CLP</td>
                                            <td>Chile</td>
                                        </tr>
                                        <tr>
                                            <td>Resend</td>
                                            <td>Envío transaccional de correos</td>
                                            <td>EE.UU.</td>
                                        </tr>
                                        <tr>
                                            <td>Daily.co</td>
                                            <td>Infraestructura de videollamadas seguras</td>
                                            <td>EE.UU. / Global</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="legal-alert legal-alert-success">
                                <p className="legal-alert-content text-bold mb-0" style={{ color: '#047857' }}>
                                    ✓ PsyDoctor NUNCA comercializa ni cede datos personales ni clínicos de usuarios a terceros con fines comerciales o publicitarios.
                                </p>
                            </div>

                            <h2 id="seccion-7" className="legal-section-title">7º Seguridad de los Datos.</h2>
                            <p className="legal-paragraph">Implementamos medidas técnicas y organizativas que incluyen:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item"><strong>Cifrado TLS/HTTPS:</strong> Todas las comunicaciones entre el usuario y la plataforma están cifradas</li>
                                <li className="legal-list-item"><strong>Cifrado de datos sensibles:</strong> Contraseñas con bcrypt y resguardo estricto de fichas clínicas</li>
                                <li className="legal-list-item"><strong>Acceso restringido:</strong> Estricto control de acceso basado en roles (RBAC)</li>
                                <li className="legal-list-item"><strong>Gestión de incidentes:</strong> Protocolos de notificación y respuesta rápida ante cualquier eventualidad de seguridad</li>
                            </ul>

                            <h2 id="seccion-8" className="legal-section-title">8º Conservación de Datos.</h2>
                            <div className="legal-table-container">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Categoría</th>
                                            <th>Plazo de Conservación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Datos de cuenta activa</td>
                                            <td>Mientras la cuenta permanezca vigente</td>
                                        </tr>
                                        <tr>
                                            <td>Notas y fichas clínicas</td>
                                            <td>15 años conforme a la normativa sanitaria chilena (Ley 20.584)</td>
                                        </tr>
                                        <tr>
                                            <td>Registros contables</td>
                                            <td>Plazo legal según la normativa del SII de Chile</td>
                                        </tr>
                                        <tr>
                                            <td>Logs de seguridad</td>
                                            <td>Hasta 2 años para auditoría y prevención de incidentes</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h2 id="seccion-9" className="legal-section-title">9º Sus Derechos como Titular de Datos (ARCO).</h2>
                            <p className="legal-paragraph">Usted tiene derecho a:</p>
                            <div className="legal-grid-2">
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Acceso</h4>
                                    <p className="legal-grid-item-text">Solicitar confirmación y copia de sus datos personales tratados</p>
                                </div>
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Rectificación</h4>
                                    <p className="legal-grid-item-text">Corregir datos inexactos, desactualizados o incompletos</p>
                                </div>
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Supresión</h4>
                                    <p className="legal-grid-item-text">Solicitar eliminación cuando no exista deber legal de conservación</p>
                                </div>
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Portabilidad</h4>
                                    <p className="legal-grid-item-text">Recibir sus datos en formato estructurado y de uso común</p>
                                </div>
                            </div>

                            <h3 className="legal-subsection-title">Cómo Ejercer Sus Derechos</h3>
                            <div className="legal-info-box">
                                <p><strong>Email:</strong> <a href="mailto:privacidad@psydoctor.cl" className="legal-link">privacidad@psydoctor.cl</a></p>
                                <p className="mb-0"><strong>Plazo de atención:</strong> Evaluamos y respondemos su requerimiento dentro de los plazos legales aplicables.</p>
                            </div>

                            <h2 id="seccion-10" className="legal-section-title">10º Cookies y Tecnologías Similares.</h2>
                            <p className="legal-paragraph">Utilizamos cookies para:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Mantener su sesión iniciada (esenciales)</li>
                                <li className="legal-list-item">Recordar sus preferencias de uso (funcionales)</li>
                                <li className="legal-list-item">Analizar agregadamente el desempeño de la plataforma sin recopilar datos clínicos (analíticas)</li>
                            </ul>

                            <h2 id="seccion-11" className="legal-section-title">11º Menores de Edad.</h2>
                            <p className="legal-paragraph">
                                PsyDoctor está dirigido a profesionales y adultos. Toda atención de menores de edad debe contar con el consentimiento del padre, madre o tutor legal conforme a la ley chilena.
                            </p>

                            <h2 id="seccion-12" className="legal-section-title">12º Cambios a esta Política.</h2>
                            <p className="legal-paragraph">
                                Podremos actualizar esta Política para reflejar mejoras operativas o exigencias legales. Los cambios relevantes serán informados oportunamente en la plataforma.
                            </p>

                            <h2 id="seccion-13" className="legal-section-title">13º Contacto y Reclamos.</h2>
                            <div className="legal-contact-box">
                                <p><strong>Email:</strong> <a href="mailto:privacidad@psydoctor.cl" className="legal-link">privacidad@psydoctor.cl</a></p>
                                <p><strong>Plataforma:</strong> PsyDoctor SpA · Santiago de Chile</p>
                            </div>

                            <div className="legal-footer">
                                <p className="legal-footer-text text-bold">
                                    Esta Política de Privacidad constituye un compromiso de PsyDoctor SpA con la transparencia y el resguardo de la privacidad en salud mental.
                                </p>
                                <div className="legal-footer-links">
                                    <Link href="/terminos" className="legal-link">
                                        Ver Términos y Condiciones
                                    </Link>
                                    <BackButton variant="chevron" className="legal-link" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    )
}
