import { Header, Footer } from '@/components/layout'
import Link from 'next/link'
import '@/styles/legal.css'

export const metadata = {
    title: 'Política de Privacidad | PsyConnect',
    description: 'Política de privacidad y protección de datos de PsyConnect - Cumplimiento Ley 19.628 Chile',
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

                            <h2 id="seccion-1" className="legal-section-title">1º Introducción.</h2>
                            <p className="legal-paragraph">
                                En <strong className="text-gray-900">PsyConnect</strong> (en adelante, "nosotros", "nuestro" o "la <strong>Plataforma</strong>"), operado por <strong>FTC Consultores Chile SpA</strong>, <strong>RUT 76.048.028-8</strong>, nos comprometemos a proteger la privacidad y los datos personales de nuestros usuarios.
                            </p>
                            <p className="legal-paragraph">
                                Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos, compartimos y protegemos su información personal cuando utiliza nuestra plataforma digital de conexión entre pacientes y profesionales de salud mental.
                            </p>

                            <h2 id="seccion-2" className="legal-section-title">2º Marco Legal y Normativo.</h2>
                            <p className="legal-paragraph">Esta Política de Privacidad se rige por:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item"><strong>Chile:</strong> Ley N° 19.628 sobre Protección de la Vida Privada y Protección de Datos de Carácter Personal</li>
                                <li className="legal-list-item"><strong>Preparación GDPR:</strong> Reglamento General de Protección de Datos (Unión Europea)</li>
                                <li className="legal-list-item"><strong>Preparación LGPD:</strong> Lei Geral de Proteção de Dados (Brasil)</li>
                            </ul>

                            <h2 id="seccion-3" className="legal-section-title">3º Responsable del Tratamiento de Datos.</h2>
                            <div className="legal-contact-box">
                                <p><strong>Responsable:</strong> FTC Consultores Chile SpA</p>
                                <p><strong>RUT:</strong> 76.048.028-8</p>
                                <p><strong>Domicilio:</strong> Padre Alberto Hurtado 0131, Estación Central, Santiago, Región Metropolitana</p>
                                <p><strong>Email de Privacidad:</strong> <a href="mailto:privacidad@psyconnect.cl" className="legal-link">privacidad@psyconnect.cl</a></p>
                                <p><strong>DPO:</strong> [En proceso de designación]</p>
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
                                <li className="legal-list-item">Tipo de profesional y número de licencia/registro</li>
                                <li className="legal-list-item">Título profesional (copia para verificación)</li>
                                <li className="legal-list-item">Especialidades y enfoques terapéuticos</li>
                                <li className="legal-list-item">Biografía profesional y años de experiencia</li>
                                <li className="legal-list-item">Modalidad de atención y dirección de consulta</li>
                                <li className="legal-list-item">Precio de sesión y duración</li>
                                <li className="legal-list-item">Información bancaria para liquidaciones (cifrada)</li>
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
                                <strong>Nota:</strong> Los datos completos de tarjetas NO se almacenan en PsyConnect, son manejados por procesadores certificados PCI-DSS.
                            </p>

                            <h3 className="legal-subsection-title">4.6 Datos Sensibles de Salud</h3>
                            <div className="legal-alert legal-alert-warning">
                                <p className="legal-alert-title">⚠️ DATOS DE CATEGORÍA ESPECIAL</p>
                                <p className="legal-alert-content">
                                    Las <strong>notas clínicas</strong> son creadas exclusivamente por profesionales y están almacenadas con <strong>cifrado punto-a-punto AES-256</strong>.
                                </p>
                                <p className="legal-alert-content mb-0">
                                    <strong>PsyConnect NO accede, lee ni procesa el contenido clínico de las notas para ningún fin.</strong>
                                </p>
                            </div>

                            <h2 id="seccion-5" className="legal-section-title">5º Finalidades del Tratamiento de Datos.</h2>
                            <p className="legal-paragraph">Utilizamos sus datos para:</p>

                            <h3 className="legal-subsection-title">5.1 Provisión del Servicio</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Crear y gestionar su cuenta de usuario</li>
                                <li className="legal-list-item">Facilitar la búsqueda de profesionales y reserva de citas</li>
                                <li className="legal-list-item">Procesar pagos y emitir comprobantes</li>
                                <li className="legal-list-item">Enviar confirmaciones y recordatorios de citas</li>
                                <li className="legal-list-item">Proporcionar soporte técnico</li>
                            </ul>

                            <h3 className="legal-subsection-title">5.2 Seguridad y Prevención de Fraude</h3>
                            <ul className="legal-list">
                                <li className="legal-list-item">Verificar identidad y credenciales profesionales</li>
                                <li className="legal-list-item">Detectar y prevenir actividades fraudulentas</li>
                                <li className="legal-list-item">Proteger la seguridad de la Plataforma</li>
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
                            <p className="legal-paragraph">Compartimos datos con terceros que nos ayudan a operar la Plataforma:</p>
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
                                            <td>Supabase</td>
                                            <td>Hosting de base de datos</td>
                                            <td>EE.UU. / EU</td>
                                        </tr>
                                        <tr>
                                            <td>Vercel</td>
                                            <td>Hosting de aplicación</td>
                                            <td>EE.UU. / Global</td>
                                        </tr>
                                        <tr>
                                            <td>Flow.cl</td>
                                            <td>Procesamiento de pagos</td>
                                            <td>Chile</td>
                                        </tr>
                                        <tr>
                                            <td>Resend</td>
                                            <td>Envío de emails</td>
                                            <td>EE.UU.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="legal-alert legal-alert-success">
                                <p className="legal-alert-content text-bold mb-0" style={{ color: '#047857' }}>
                                    ✓ PsyConnect NUNCA vende, alquila ni comercializa datos personales de usuarios a terceros.
                                </p>
                            </div>

                            <h2 id="seccion-7" className="legal-section-title">7º Seguridad de los Datos.</h2>
                            <p className="legal-paragraph">Implementamos medidas de seguridad que incluyen:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item"><strong>Cifrado SSL/TLS:</strong> Todas las comunicaciones están cifradas (HTTPS)</li>
                                <li className="legal-list-item"><strong>Cifrado de datos sensibles:</strong> Contraseñas con bcrypt, notas clínicas con AES-256</li>
                                <li className="legal-list-item"><strong>Firewalls y monitoreo:</strong> Detección de intrusiones</li>
                                <li className="legal-list-item"><strong>Acceso restringido:</strong> Solo personal autorizado</li>
                                <li className="legal-list-item"><strong>Auditorías periódicas:</strong> Revisiones de vulnerabilidades</li>
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
                                            <td>Mientras la cuenta esté activa</td>
                                        </tr>
                                        <tr>
                                            <td>Notas clínicas</td>
                                            <td>15 años (normativa sanitaria chilena)</td>
                                        </tr>
                                        <tr>
                                            <td>Datos de pago</td>
                                            <td>7 años (SII Chile)</td>
                                        </tr>
                                        <tr>
                                            <td>Logs de seguridad</td>
                                            <td>2 años</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h2 id="seccion-9" className="legal-section-title">9º Sus Derechos como Titular de Datos (ARCO).</h2>
                            <p className="legal-paragraph">Usted tiene derecho a:</p>
                            <div className="legal-grid-2">
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Acceso</h4>
                                    <p className="legal-grid-item-text">Solicitar copia de todos sus datos personales</p>
                                </div>
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Rect ificación</h4>
                                    <p className="legal-grid-item-text">Corregir datos inexactos o incompletos</p>
                                </div>
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Supresión</h4>
                                    <p className="legal-grid-item-text">Solicitar eliminación de datos no obligatorios</p>
                                </div>
                                <div className="legal-grid-item">
                                    <h4 className="legal-grid-item-title">✓ Portabilidad</h4>
                                    <p className="legal-grid-item-text">Recibir datos en formato JSON/CSV</p>
                                </div>
                            </div>

                            <h3 className="legal-subsection-title">Cómo Ejercer Sus Derechos</h3>
                            <div className="legal-info-box">
                                <p><strong>Email:</strong> <a href="mailto:privacidad@psyconnect.cl" className="legal-link">privacidad@psyconnect.cl</a></p>
                                <p className="mb-0"><strong>Tiempo de respuesta:</strong> Máximo 30 días hábiles</p>
                            </div>

                            <h2 id="seccion-10" className="legal-section-title">10º Cookies y Tecnologías Similares.</h2>
                            <p className="legal-paragraph">Utilizamos cookies para:</p>
                            <ul className="legal-list">
                                <li className="legal-list-item">Mantener su sesión iniciada (esenciales)</li>
                                <li className="legal-list-item">Recordar sus preferencias (funcionales)</li>
                                <li className="legal-list-item">Analizar el uso de la plataforma (analíticas)</li>
                            </ul>
                            <p className="legal-paragraph" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la Plataforma.
                            </p>

                            <h2 id="seccion-11" className="legal-section-title">11º Menores de Edad.</h2>
                            <p className="legal-paragraph">
                                PsyConnect está dirigido a <strong>mayores de 18 años</strong>. No recopilamos intencionalmente datos de menores sin consentimiento parental verificado.
                            </p>
                            <p className="legal-paragraph">
                                Si un profesional atiende a pacientes menores de edad, el consentimiento debe ser otorgado por el tutor legal.
                            </p>

                            <h2 id="seccion-12" className="legal-section-title">12º Cambios a esta Política.</h2>
                            <p className="legal-paragraph">
                                Podemos actualizar esta Política periódicamente. Los cambios significativos serán notificados por email o aviso en la Plataforma.
                            </p>

                            <h2 id="seccion-13" className="legal-section-title">13º Contacto y Reclamos.</h2>
                            <div className="legal-contact-box">
                                <p><strong>Email:</strong> <a href="mailto:privacidad@psyconnect.cl" className="legal-link">privacidad@psyconnect.cl</a></p>
                                <p><strong>Domicilio:</strong> Padre Alberto Hurtado 0131, Estación Central, Santiago, Región Metropolitana</p>
                                <p><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hrs (Chile)</p>
                            </div>

                            <h3 className="legal-subsection-title mt-4">Autoridad de Control (Chile)</h3>
                            <p className="legal-paragraph">
                                Si no está satisfecho con nuestra respuesta, puede presentar una queja ante:
                            </p>
                            <ul className="legal-list">
                                <li className="legal-list-item"><strong>Consejo para la Transparencia</strong> (fiscaliza Ley 19.628)</li>
                                <li className="legal-list-item"><strong>Superintendencia de Salud</strong> (datos de salud)</li>
                            </ul>

                            <div className="legal-footer">
                                <p className="legal-footer-text text-bold">
                                    Esta Política de Privacidad constituye un compromiso vinculante de PsyConnect con sus usuarios.
                                </p>
                                <div className="legal-footer-links">
                                    <Link href="/terminos" className="legal-link">
                                        Ver Términos y Condiciones
                                    </Link>
                                    <Link href="/" className="legal-link">
                                        Volver al inicio
                                    </Link>
                                </div>
                            </div>

                            <p className="legal-disclaimer">
                                Documento preparado conforme a mejores prácticas internacionales en protección de datos para plataformas de salud digital.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    )
}
