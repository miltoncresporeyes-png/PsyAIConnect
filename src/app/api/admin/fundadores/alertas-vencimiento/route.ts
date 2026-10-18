import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de alerta interna / cron:
 * Revisa fundadores aprobados cuya fecha_fin_beneficio esté a 90 días o menos
 * para notificar al administrador con 60 días de anticipación de su vencimiento.
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const now = new Date()
        const in90Days = new Date(now)
        in90Days.setDate(in90Days.getDate() + 90)

        // Fundadores aprobados que vencen dentro de los próximos 90 días
        const expiringFounders = await prisma.founderApplication.findMany({
            where: {
                estado: 'aprobado',
                fechaFinBeneficio: {
                    gte: now,
                    lte: in90Days,
                },
            },
            orderBy: {
                fechaFinBeneficio: 'asc',
            },
        })

        if (expiringFounders.length > 0) {
            const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'contacto@psydoctor.cl'
            const foundersListHtml = expiringFounders
                .map(
                    (f) =>
                        `<li><strong>${f.nombreCompleto}</strong> (Cupo #${f.numeroCupo}, ${f.email}) - Vence el ${f.fechaFinBeneficio?.toLocaleDateString('es-CL')} (RUT: ${f.rut})</li>`
                )
                .join('')

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #1e293b;">
                    <h2 style="color: #0f766e;">Alerta Interna: Vencimiento de Beneficio Fundadores</h2>
                    <p>Se detectaron <strong>${expiringFounders.length}</strong> profesionales fundadores con término de beneficio dentro de los próximos 90 días.</p>
                    <p><em>Recordatorio: Los términos exigen notificar al profesional con al menos 60 días de anticipación con las opciones de planes comerciales vigentes.</em></p>
                    <ul>${foundersListHtml}</ul>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #64748b;">PsyDoctor Admin Automation</p>
                </div>
            `

            await sendEmail({
                to: adminEmail,
                subject: `⚠️ Alerta: ${expiringFounders.length} Profesional(es) Fundador(es) próximos a vencer beneficio (90 días)`,
                html,
            }).catch((err) => console.error('Error sending founder expiry alert email:', err))
        }

        return NextResponse.json({
            success: true,
            alertasEnviadas: expiringFounders.length,
            fundadores: expiringFounders.map((f) => ({
                id: f.id,
                nombre: f.nombreCompleto,
                email: f.email,
                cupo: f.numeroCupo,
                fechaFin: f.fechaFinBeneficio,
            })),
        })
    } catch (error) {
        console.error('Error in founder alerts check:', error)
        return NextResponse.json({ error: 'Error procesando alertas' }, { status: 500 })
    }
}
