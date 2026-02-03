/**
 * Email Service for PsyConnect
 * Uses Resend for transactional emails
 * Fallback to console logging in development
 */

interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

interface EmailResult {
    success: boolean
    messageId?: string
    error?: string
}

// Email templates
const EMAIL_TEMPLATES = {
    VERIFICATION: {
        subject: '✅ Verifica tu cuenta en PsyConnect',
        getHtml: (name: string, verificationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧠 PsyConnect</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Plataforma de Salud Mental</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">¡Hola ${name}! 👋</h2>
        <p style="color: #4b5563;">Gracias por registrarte en PsyConnect. Para completar tu registro y empezar a usar la plataforma, por favor verifica tu correo electrónico.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                Verificar mi cuenta
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="color: #6366f1; word-break: break-all; font-size: 13px;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Este enlace expirará en 24 horas. Si no solicitaste esta verificación, puedes ignorar este correo.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PsyConnect. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
    },

    PASSWORD_RESET: {
        subject: '🔐 Restablecer contraseña - PsyConnect',
        getHtml: (name: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧠 PsyConnect</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Plataforma de Salud Mental</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${name} 👋</h2>
        <p style="color: #4b5563;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el botón de abajo:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                Restablecer contraseña
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Si no puedes hacer clic en el botón, copia y pega este enlace:</p>
        <p style="color: #6366f1; word-break: break-all; font-size: 13px;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #ef4444; font-size: 13px; margin: 0;">⚠️ Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta está segura.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">Este enlace expirará en 1 hora.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PsyConnect. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
    },

    APPOINTMENT_CONFIRMATION: {
        subject: '📅 Cita confirmada - PsyConnect',
        getHtml: (
            patientName: string,
            professionalName: string,
            date: string,
            time: string,
            modality: string,
            videoLink?: string
        ) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧠 PsyConnect</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">¡Cita confirmada!</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${patientName} 👋</h2>
        <p style="color: #4b5563;">Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">👨‍⚕️ Profesional:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${professionalName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">📅 Fecha:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${date}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">🕐 Hora:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${time}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">📍 Modalidad:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${modality}</td>
                </tr>
            </table>
        </div>

        ${videoLink ? `
        <div style="text-align: center; margin: 30px 0;">
            <a href="${videoLink}" 
               style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;">
                🎥 Unirse a la videollamada
            </a>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 13px;">💡 Te recomendamos conectarte 5 minutos antes de la cita para asegurar una buena conexión.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PsyConnect. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
    },

    APPOINTMENT_REMINDER: {
        subject: '⏰ Recordatorio: Tu cita es mañana - PsyConnect',
        getHtml: (patientName: string, professionalName: string, date: string, time: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧠 PsyConnect</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">⏰ Recordatorio de cita</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${patientName} 👋</h2>
        <p style="color: #4b5563;">Te recordamos que tienes una cita programada:</p>
        
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #92400e; font-size: 18px; font-weight: 600;">
                📅 ${date} a las ${time}
            </p>
            <p style="margin: 10px 0 0 0; color: #78716c;">
                con ${professionalName}
            </p>
        </div>

        <p style="color: #6b7280; font-size: 13px; text-align: center;">¡Te esperamos! Recuerda conectarte unos minutos antes.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PsyConnect. Todos los derechos reservados.</p>
    </div>
</body>
</html>
        `,
    },
}

/**
 * Send email using Resend API or console log in development
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text } = options

    // In development without API key, log to console
    if (!process.env.RESEND_API_KEY) {
        console.log('📧 [EMAIL SERVICE - DEV MODE]')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('---')
        return { success: true, messageId: 'dev-mode-' + Date.now() }
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'PsyConnect <noreply@psyconnect.cl>',
                to: [to],
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Email send error:', data)
            return { success: false, error: data.message || 'Failed to send email' }
        }

        return { success: true, messageId: data.id }
    } catch (error) {
        console.error('Email service error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    email: string,
    name: string,
    token: string
): Promise<EmailResult> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verificar-email?token=${token}`

    return sendEmail({
        to: email,
        subject: EMAIL_TEMPLATES.VERIFICATION.subject,
        html: EMAIL_TEMPLATES.VERIFICATION.getHtml(name, verificationUrl),
    })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    name: string,
    token: string
): Promise<EmailResult> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/restablecer-contrasena?token=${token}`

    return sendEmail({
        to: email,
        subject: EMAIL_TEMPLATES.PASSWORD_RESET.subject,
        html: EMAIL_TEMPLATES.PASSWORD_RESET.getHtml(name, resetUrl),
    })
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmationEmail(
    email: string,
    patientName: string,
    professionalName: string,
    date: string,
    time: string,
    modality: string,
    videoLink?: string
): Promise<EmailResult> {
    return sendEmail({
        to: email,
        subject: EMAIL_TEMPLATES.APPOINTMENT_CONFIRMATION.subject,
        html: EMAIL_TEMPLATES.APPOINTMENT_CONFIRMATION.getHtml(
            patientName,
            professionalName,
            date,
            time,
            modality,
            videoLink
        ),
    })
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(
    email: string,
    patientName: string,
    professionalName: string,
    date: string,
    time: string
): Promise<EmailResult> {
    return sendEmail({
        to: email,
        subject: EMAIL_TEMPLATES.APPOINTMENT_REMINDER.subject,
        html: EMAIL_TEMPLATES.APPOINTMENT_REMINDER.getHtml(
            patientName,
            professionalName,
            date,
            time
        ),
    })
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send verification code email for registration
 */
export async function sendVerificationCodeEmail(
    email: string,
    name: string,
    code: string
): Promise<EmailResult> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧠 PsyConnect</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Tu bienestar mental, nuestra prioridad</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">¡Hola ${name}! 👋</h2>
        <p style="color: #4b5563;">Gracias por registrarte en PsyConnect. Para completar tu registro, ingresa el siguiente código de verificación:</p>
        
        <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 10px; color: #0d9488; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                Tu código de verificación
            </p>
            <div style="font-size: 40px; font-weight: 700; color: #0f766e; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
            </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
            ⏱️ Este código expira en <strong>15 minutos</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">🔒 Si no solicitaste este código, puedes ignorar este correo.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PsyConnect Chile. Todos los derechos reservados.</p>
    </div>
</body>
</html>
    `

    return sendEmail({
        to: email,
        subject: '🔐 Tu código de verificación - PsyConnect',
        html,
    })
}

export { EMAIL_TEMPLATES }

