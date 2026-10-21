import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waitlistProfessionalSchema } from '@/lib/validation/waitlist'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/email'
import { captureApiError, getRequestId } from '@/lib/observability'

export const dynamic = 'force-dynamic'

const SUCCESS_MESSAGE = '¡Gracias por postular al Programa de Fundadores de PsyDoctor! Revisaremos tus antecedentes y nos contactaremos contigo.'

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    const clientIp = getClientIp(req)

    // TODO: En entorno Serverless (Vercel), el almacén en memoria de checkRateLimit no es compartido entre instancias concurrentes.
    // Migrar a almacén distribuido (Upstash Redis) antes de alta concurrencia.
    const ipRateLimit = checkRateLimit(`waitlist:professional:ip:${clientIp}`, {
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

        const parseResult = waitlistProfessionalSchema.safeParse(body)
        if (!parseResult.success) {
            const firstError = parseResult.error.errors[0]?.message || 'Datos de formulario inválidos'
            return NextResponse.json({ error: firstError }, { status: 400 })
        }

        const data = parseResult.data

        // 1. Detección Anti-Bot: Honeypot (campo website vacío)
        if (data.website && data.website.trim().length > 0) {
            return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
        }

        // 2. Detección Anti-Bot: Tiempo mínimo de envío (> 2.5 segundos)
        if (data.renderedAt && typeof data.renderedAt === 'number') {
            const durationMs = Date.now() - data.renderedAt
            if (durationMs < 2500) {
                return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
            }
        }

        // 3. Verificación de origen legítimo (Origin / Referer)
        const origin = req.headers.get('origin')
        const referer = req.headers.get('referer')
        const host = req.headers.get('host')
        if (origin && host && !origin.includes(host)) {
            return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
        }

        // 4. Rate limit por email normalizado (máximo 3 envíos por hora)
        const emailRateLimit = checkRateLimit(`waitlist:professional:email:${data.email}`, {
            limit: 3,
            windowMs: 60 * 60 * 1000,
        })
        if (!emailRateLimit.allowed) {
            return NextResponse.json(
                { error: 'Ya hemos recibido tu postulación. Nuestro equipo la revisará prontamente.' },
                { status: 429, headers: createRateLimitHeaders(emailRateLimit) }
            )
        }

        // 5. Manejo de duplicados: Si ya existe, avisar amigablemente que ya está registrado
        const existing = await prisma.waitlistProfessional.findUnique({
            where: { email: data.email },
        })

        if (existing) {
            return NextResponse.json({
                success: true,
                alreadySubscribed: true,
                message: 'Ya recibimos previamente una postulación con este correo. Nuestro equipo se contactará contigo.',
            })
        }

        await prisma.waitlistProfessional.create({
                data: {
                    email: data.email,
                    name: data.name,
                    whatsapp: data.whatsapp,
                    profesion: data.profesion,
                    registroSuperintendencia: data.registroSuperintendencia,
                    especialidades: data.especialidades,
                    aniosExperiencia: data.aniosExperiencia,
                    ciudad: data.ciudad,
                    atiendeOnline: data.atiendeOnline,
                    consentAt: new Date(),
                    consentVersion: data.consentVersion,
                    utmSource: data.utmSource || null,
                    utmMedium: data.utmMedium || null,
                    utmCampaign: data.utmCampaign || null,
                    referrer: data.referrer || referer || null,
                },
            })

            // Notificación al equipo operativo sin PII (solo metadata del profesional)
            const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL
            if (webhookUrl) {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🩺 Nueva postulación: Programa Fundadores - Profesión: ${data.profesion} - Ciudad: ${data.ciudad} - Online: ${data.atiendeOnline ? 'Sí' : 'No'}`,
                    }),
                }).catch(() => {})
            }

            // Email transaccional de confirmación
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
                    <h2 style="color: #0f766e;">¡Hola ${data.name}!</h2>
                    <p>Hemos recibido tu postulación al <strong>Programa de Fundadores de PsyDoctor</strong>.</p>
                    <p>Nuestro equipo validará tus credenciales ante la Superintendencia de Salud y te contactaremos para coordinar una breve llamada informativa y activación de beneficios de fundador.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #64748b;">
                        Para consultas o solicitar la eliminación de tus datos, responde directamente a este correo.
                        <br />PsyDoctor SpA Chile.
                    </p>
                </div>
            `

            sendEmail({
                to: data.email,
                subject: 'Postulación recibida: Programa Fundadores PsyDoctor',
                html: emailHtml,
            }).catch((err) => {
                captureApiError('/api/waitlist/professional:sendEmail', err, requestId, {
                    leadType: 'professional',
                })
            })

        return NextResponse.json({
            success: true,
            alreadySubscribed: false,
            message: SUCCESS_MESSAGE,
        })
    } catch (error) {
        await captureApiError('/api/waitlist/professional', error, requestId)
        return NextResponse.json(
            { error: 'Ocurrió un error al procesar tu solicitud. Por favor intenta más tarde.' },
            { status: 500 }
        )
    }
}
