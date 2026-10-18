import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/email'
import { captureApiError, getRequestId } from '@/lib/observability'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const phoneRegex = /^(\+?56)?(\s?)(0?9)(\s?)[0-9]{8}$/
// Formato RUT chileno: 12.345.678-9 o 12345678-k
const rutRegex = /^(\d{1,2}(?:\.?\d{3}){2}-[\dkK])$/

const founderApplicationSchema = z.object({
    nombreCompleto: z
        .string({ required_error: 'El nombre completo es requerido' })
        .trim()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(120, 'El nombre no puede exceder 120 caracteres'),
    rut: z
        .string({ required_error: 'El RUT es requerido' })
        .trim()
        .regex(rutRegex, 'Ingresa un RUT válido (ej. 12.345.678-9 o 12345678-K)'),
    profesion: z.enum(['psicologo', 'psiquiatra', 'psicologa'], {
        errorMap: () => ({ message: 'Selecciona una profesión válida (psicólogo/a o psiquiatra)' }),
    }),
    registroSuperintendencia: z
        .string({ required_error: 'El número de inscripción en el Registro es requerido' })
        .trim()
        .min(3, 'Ingresa un número de inscripción válido')
        .max(50, 'El número no puede exceder 50 caracteres'),
    email: z
        .string({ required_error: 'El correo electrónico es requerido' })
        .trim()
        .toLowerCase()
        .email('Ingresa un correo electrónico válido')
        .max(150, 'El correo no puede exceder 150 caracteres'),
    telefono: z
        .string({ required_error: 'El teléfono es requerido' })
        .trim()
        .regex(phoneRegex, 'Ingresa un número telefónico válido (ej. +56912345678)'),
    modalidadAtencion: z.enum(['online', 'presencial', 'ambas'], {
        errorMap: () => ({ message: 'Selecciona una modalidad válida (online, presencial o ambas)' }),
    }),
    comunaRegion: z
        .string({ required_error: 'La comuna o región es requerida' })
        .trim()
        .min(2, 'Ingresa una comuna o región válida')
        .max(100, 'La comuna o región no puede exceder 100 caracteres'),
    declaracionVigente: z
        .boolean()
        .refine((val) => val === true, 'Debes aceptar la declaración y los términos para continuar'),
    versionTerminos: z.string().default('1.0'),
    // Honeypot anti-bot
    website: z.string().max(0, 'Bot detected').optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    const clientIp = getClientIp(req)

    const ipRateLimit = checkRateLimit(`founder:application:ip:${clientIp}`, {
        limit: 10,
        windowMs: 15 * 60 * 1000,
    })

    if (!ipRateLimit.allowed) {
        return NextResponse.json(
            { error: 'Demasiadas solicitudes. Por favor espera unos minutos antes de intentar nuevamente.' },
            { status: 429, headers: createRateLimitHeaders(ipRateLimit) }
        )
    }

    try {
        const body = await req.json().catch(() => null)
        if (!body) {
            return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
        }

        const parseResult = founderApplicationSchema.safeParse(body)
        if (!parseResult.success) {
            const firstError = parseResult.error.errors[0]?.message || 'Datos de formulario inválidos'
            return NextResponse.json({ error: firstError }, { status: 400 })
        }

        const data = parseResult.data

        // Honeypot check
        if (data.website && data.website.trim().length > 0) {
            return NextResponse.json({
                success: true,
                message: 'Recibimos tu postulación. Verificaremos tu inscripción en el Registro de la Superintendencia de Salud y te escribiremos en un plazo estimado de 3 a 5 días hábiles.',
            })
        }

        // Email rate limit
        const emailRateLimit = checkRateLimit(`founder:application:email:${data.email}`, {
            limit: 3,
            windowMs: 60 * 60 * 1000,
        })
        if (!emailRateLimit.allowed) {
            return NextResponse.json(
                { error: 'Ya hemos recibido una postulación con este correo. Nuestro equipo la revisará prontamente.' },
                { status: 429, headers: createRateLimitHeaders(emailRateLimit) }
            )
        }

        const normalizedProfesion = data.profesion === 'psicologa' ? 'psicologo' : data.profesion

        // Check if already registered
        const existing = await prisma.founderApplication.findUnique({
            where: { email: data.email },
        })

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Recibimos tu postulación. Verificaremos tu inscripción en el Registro de la Superintendencia de Salud y te escribiremos en un plazo estimado de 3 a 5 días hábiles.',
            })
        }

        // Create founder application strictly with estado = "pendiente" (NEVER auto-published)
        const application = await prisma.founderApplication.create({
            data: {
                nombreCompleto: data.nombreCompleto,
                rut: data.rut,
                profesion: normalizedProfesion,
                registroSuperintendencia: data.registroSuperintendencia,
                email: data.email,
                telefono: data.telefono,
                modalidadAtencion: data.modalidadAtencion,
                comunaRegion: data.comunaRegion,
                declaracionVigente: true,
                fechaAceptacion: new Date(),
                versionTerminos: data.versionTerminos || '1.0',
                estado: 'pendiente',
                verificadoEnRegistro: false,
            },
        })

        // Email de confirmación automático al postulante
        const emailSubject = 'Confirmación de postulación: Programa Profesionales Fundadores - PsyDoctor'
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc;">
    <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">PsyDoctor</h1>
        <p style="color: #ccfbf1; margin: 8px 0 0 0; font-size: 14px;">Programa Profesionales Fundadores</p>
    </div>
    <div style="background: #ffffff; padding: 36px 28px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Estimado/a ${data.nombreCompleto}:</h2>
        <p style="color: #334155; font-size: 15px;">
            Recibimos tu postulación. Verificaremos tu inscripción en el Registro de la Superintendencia de Salud y te escribiremos en un plazo estimado de 3 a 5 días hábiles.
        </p>
        
        <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #134e4a; font-weight: 600;">Resumen de antecedentes registrados:</p>
            <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 13px; color: #115e59;">
                <li><strong>Profesión:</strong> ${normalizedProfesion === 'psicologo' ? 'Psicología' : 'Psiquiatría'}</li>
                <li><strong>N° Registro Superintendencia:</strong> ${data.registroSuperintendencia}</li>
                <li><strong>Modalidad:</strong> ${data.modalidadAtencion}</li>
                <li><strong>Comuna/Región:</strong> ${data.comunaRegion}</li>
                <li><strong>Términos aceptados:</strong> Versión ${data.versionTerminos || '1.0'}</li>
                <li><strong>Estado de la postulación:</strong> Pendiente de verificación</li>
            </ul>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            Ningún perfil se publica automáticamente. Todos los antecedentes son revisados manualmente para certificar que el prestador individual cumple con las normativas legales de la Superintendencia de Salud en Chile.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Términos del programa disponibles en <a href="https://psydoctor.cl/fundadores" style="color: #0d9488;">psydoctor.cl/fundadores</a>.
        </p>
    </div>
    <div style="background: #f1f5f9; padding: 18px 24px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PsyDoctor SpA · Santiago de Chile.</p>
    </div>
</body>
</html>
`

        sendEmail({
            to: data.email,
            subject: emailSubject,
            html: emailHtml,
        }).catch((err) => {
            captureApiError('/api/fundadores/postular:sendEmail', err, requestId, {
                applicantEmail: data.email,
            })
        })

        return NextResponse.json({
            success: true,
            id: application.id,
            message: 'Recibimos tu postulación. Verificaremos tu inscripción en el Registro de la Superintendencia de Salud y te escribiremos en un plazo estimado de 3 a 5 días hábiles.',
        })
    } catch (error) {
        await captureApiError('/api/fundadores/postular', error, requestId)
        return NextResponse.json(
            { error: 'Ocurrió un error al procesar tu postulación. Por favor intenta más tarde.' },
            { status: 500 }
        )
    }
}
