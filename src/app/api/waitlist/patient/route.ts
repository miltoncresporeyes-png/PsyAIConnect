import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waitlistPatientSchema } from '@/lib/validation/waitlist'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/email'
import { captureApiError, getRequestId } from '@/lib/observability'

export const dynamic = 'force-dynamic'

const SUCCESS_MESSAGE = '¡Te has unido con éxito a la lista de espera de PsyDoctor! Te avisaremos apenas tengamos profesionales disponibles.'

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    const clientIp = getClientIp(req)

    // TODO: En entorno Serverless (Vercel), el almacén en memoria de checkRateLimit no es compartido entre instancias concurrentes.
    // Migrar a almacén distribuido (Upstash Redis) antes de alta concurrencia.
    const ipRateLimit = checkRateLimit(`waitlist:patient:ip:${clientIp}`, {
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

        const parseResult = waitlistPatientSchema.safeParse(body)
        if (!parseResult.success) {
            const firstError = parseResult.error.errors[0]?.message || 'Datos de formulario inválidos'
            return NextResponse.json({ error: firstError }, { status: 400 })
        }

        const data = parseResult.data

        // 1. Detección Anti-Bot: Honeypot (campo website no debe contener nada)
        if (data.website && data.website.trim().length > 0) {
            // Responder 200 silenciosamente sin persistir
            return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
        }

        // 2. Detección Anti-Bot: Tiempo mínimo de envío (> 2.5 segundos)
        if (data.renderedAt && typeof data.renderedAt === 'number') {
            const durationMs = Date.now() - data.renderedAt
            if (durationMs < 2500) {
                // Envío demasiado rápido (probable bot automatizado), responder 200 sin guardar
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
        const emailRateLimit = checkRateLimit(`waitlist:patient:email:${data.email}`, {
            limit: 3,
            windowMs: 60 * 60 * 1000,
        })
        if (!emailRateLimit.allowed) {
            return NextResponse.json(
                { error: 'Ya hemos recibido tu solicitud. Te contactaremos a la brevedad.' },
                { status: 429, headers: createRateLimitHeaders(emailRateLimit) }
            )
        }

        // 5. Manejo de duplicados: Si el correo ya existe, responder 200 sin duplicar ni revelar
        const existing = await prisma.waitlistPatient.findUnique({
            where: { email: data.email },
        })

        if (!existing) {
            await prisma.waitlistPatient.create({
                data: {
                    email: data.email,
                    name: data.name,
                    whatsapp: data.whatsapp || null,
                    comuna: data.comuna,
                    motivoCategoria: data.motivoCategoria || null,
                    prevision: data.prevision,
                    consentAt: new Date(),
                    consentVersion: data.consentVersion,
                    utmSource: data.utmSource || null,
                    utmMedium: data.utmMedium || null,
                    utmCampaign: data.utmCampaign || null,
                    referrer: data.referrer || referer || null,
                },
            })

            // Notificación al equipo operativo sin PII (solo metadata del lead)
            const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL
            if (webhookUrl) {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🔔 Nuevo registro en Lista de Espera (Paciente) - Comuna: ${data.comuna} - Previsión: ${data.prevision}`,
                    }),
                }).catch(() => {})
            }

            // Email transaccional de confirmación sin romper el registro si falla
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
                    <h2 style="color: #0f766e;">¡Hola ${data.name}!</h2>
                    <p>Confirmamos que te has sumado con éxito a la lista de espera de <strong>PsyDoctor</strong>.</p>
                    <p>Estamos validando a los primeros psicólogos y psiquiatras para garantizar atención de máxima calidad y con cobertura Fonasa e Isapre.</p>
                    <p>Apenas tengamos profesionales disponibles en tu área o modalidad, serás de los primeros en acceder.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #64748b;">
                        Para cancelar tu suscripción o solicitar la eliminación de tus datos, responde a este correo indicando tu solicitud.
                        <br />PsyDoctor SpA Chile.
                    </p>
                </div>
            `

            sendEmail({
                to: data.email,
                subject: 'Confirmación: Estás en la lista de espera de PsyDoctor',
                html: emailHtml,
            }).catch((err) => {
                captureApiError('/api/waitlist/patient:sendEmail', err, requestId, {
                    leadType: 'patient',
                })
            })
        }

        return NextResponse.json({
            success: true,
            message: SUCCESS_MESSAGE,
        })
    } catch (error) {
        await captureApiError('/api/waitlist/patient', error, requestId)
        return NextResponse.json(
            { error: 'Ocurrió un error al procesar tu solicitud. Por favor intenta más tarde.' },
            { status: 500 }
        )
    }
}
