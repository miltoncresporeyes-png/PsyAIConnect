import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}))
        const targetEmail = body.to || 'contacto@psydoctor.cl'
        const testSubject = body.subject || 'test'

        console.log(`[TEST-EMAIL] Sending test email to ${targetEmail} with subject: ${testSubject}`)

        const result = await sendEmail({
            to: targetEmail,
            subject: testSubject,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Correo de Prueba - PsyDoctor</h2>
                    <p>Este es un correo de prueba enviado desde <strong>contacto@psydoctor.cl</strong>.</p>
                    <p><strong>Fecha/Hora:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Asunto:</strong> ${testSubject}</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">PsyDoctor - Plataforma de Salud Mental en Chile</p>
                </div>
            `,
            text: `Correo de prueba desde contacto@psydoctor.cl - Fecha: ${new Date().toISOString()}`,
        })

        if (!result.success) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: result.error, 
                    hasApiKey: Boolean(process.env.RESEND_API_KEY),
                    emailFrom: process.env.EMAIL_FROM || 'PsyDoctor <contacto@psydoctor.cl>'
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: `Correo enviado exitosamente a ${targetEmail}`,
            messageId: result.messageId,
            from: process.env.EMAIL_FROM || 'PsyDoctor <contacto@psydoctor.cl>',
            replyTo: 'contacto@psydoctor.cl',
            hasApiKey: Boolean(process.env.RESEND_API_KEY)
        })
    } catch (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        )
    }
}
