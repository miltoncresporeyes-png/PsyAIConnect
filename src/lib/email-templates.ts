/**
 * Templates de email para la lista de espera Beta
 */

export const betaWaitlistEmailTemplates = {
    patient: {
        subject: '🎉 ¡Bienvenido a PsyConnect Beta!',
        html: (email: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a PsyConnect Beta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 ¡Bienvenido a PsyConnect Beta!</h1>
                        </td>
                    </tr>
                    
                    <!-- Contenido -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Hola,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                ¡Gracias por unirte a la lista de espera de PsyConnect! Estás a un paso de vivir una nueva experiencia en salud mental.
                            </p>
                            
                            <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                    ✨ En 7 días dejaremos de buscar profesionales y empezaremos a conectar con los correctos.
                                </p>
                            </div>
                            
                            <h2 style="margin: 30px 0 15px; color: #1f2937; font-size: 20px; font-weight: 700;">¿Qué puedes esperar?</h2>
                            
                            <ul style="margin: 0 0 20px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                <li><strong>Orientación inteligente:</strong> Un sistema que te conecta con el profesional ideal para ti</li>
                                <li><strong>Transparencia total:</strong> Perfiles completos con especialidades, modalidades y tarifas claras</li>
                                <li><strong>Facilidad de uso:</strong> Agenda, paga y gestiona tus sesiones en un solo lugar</li>
                                <li><strong>Seguridad:</strong> Tus datos están protegidos con los más altos estándares</li>
                            </ul>
                            
                            <p style="margin: 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Te mantendremos informado sobre el lanzamiento y serás uno de los primeros en acceder a la plataforma.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://psyconnect.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    Visitar PsyConnect
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                © 2026 PsyConnect. Transformando la gestión en salud mental.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                🔒 Tus datos están protegidos. No compartimos información personal.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: (email: string) => `
¡Bienvenido a PsyConnect Beta!

Gracias por unirte a la lista de espera. Estás a un paso de vivir una nueva experiencia en salud mental.

✨ En 7 días dejaremos de buscar profesionales y empezaremos a conectar con los correctos.

¿Qué puedes esperar?
- Orientación inteligente: Un sistema que te conecta con el profesional ideal para ti
- Transparencia total: Perfiles completos con especialidades, modalidades y tarifas claras
- Facilidad de uso: Agenda, paga y gestiona tus sesiones en un solo lugar
- Seguridad: Tus datos están protegidos con los más altos estándares

Te mantendremos informado sobre el lanzamiento y serás uno de los primeros en acceder a la plataforma.

---
© 2026 PsyConnect. Transformando la gestión en salud mental.
🔒 Tus datos están protegidos. No compartimos información personal.
        `,
    },
    professional: {
        subject: '🚀 ¡Únete a PsyConnect Beta - Para Profesionales!',
        html: (email: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a PsyConnect Beta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🚀 ¡Bienvenido a PsyConnect Beta!</h1>
                        </td>
                    </tr>
                    
                    <!-- Contenido -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Estimado profesional,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                ¡Gracias por unirte! Estás a punto de transformar la gestión administrativa de tu práctica.
                            </p>
                            
                            <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                    💼 Estás a un paso de automatizar tu contabilidad y tus boletas de honorarios del SII.
                                </p>
                            </div>
                            
                            <h2 style="margin: 30px 0 15px; color: #1f2937; font-size: 20px; font-weight: 700;">Autonomía administrativa total:</h2>
                            
                            <ul style="margin: 0 0 20px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                <li><strong>Boletas automáticas del SII:</strong> Genera boletas con un clic</li>
                                <li><strong>Gestión de agenda:</strong> Controla tu disponibilidad y citas fácilmente</li>
                                <li><strong>Pagos seguros:</strong> Recibe pagos directamente en tu cuenta</li>
                                <li><strong>Notas clínicas encriptadas:</strong> Registros seguros y privados</li>
                                <li><strong>Dashboard financiero:</strong> Visualiza tus ingresos y comisiones en tiempo real</li>
                            </ul>
                            
                            <p style="margin: 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Te contactaremos pronto con los detalles de acceso temprano a la plataforma.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://psyconnect.app/profesional" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    Conocer más
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                © 2026 PsyConnect. Transformando la gestión en salud mental.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                🔒 Tus datos están protegidos. No compartimos información personal.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: (email: string) => `
¡Bienvenido a PsyConnect Beta!

Estimado profesional,

Gracias por unirte. Estás a punto de transformar la gestión administrativa de tu práctica.

💼 Estás a un paso de automatizar tu contabilidad y tus boletas de honorarios del SII.

Autonomía administrativa total:
- Boletas automáticas del SII: Genera boletas con un clic
- Gestión de agenda: Controla tu disponibilidad y citas fácilmente
- Pagos seguros: Recibe pagos directamente en tu cuenta
- Notas clínicas encriptadas: Registros seguros y privados
- Dashboard financiero: Visualiza tus ingresos y comisiones en tiempo real

Te contactaremos pronto con los detalles de acceso temprano a la plataforma.

---
© 2026 PsyConnect. Transformando la gestión en salud mental.
🔒 Tus datos están protegidos. No compartimos información personal.
        `,
    },
}
