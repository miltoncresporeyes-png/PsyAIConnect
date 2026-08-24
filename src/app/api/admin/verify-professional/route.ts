import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { logAdminAction } from '@/lib/adminLogs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const adminUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acceso denegado' },
                { status: 403 }
            )
        }

        const { professionalId, action, rejectionReason } = await request.json()

        if (!professionalId || !action) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            )
        }

        if (action === 'reject' && !rejectionReason) {
            return NextResponse.json(
                { error: 'El motivo de rechazo es requerido' },
                { status: 400 }
            )
        }

        const professional = await prisma.professional.findUnique({
            where: { id: professionalId },
            include: { user: true },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Profesional no encontrado' },
                { status: 404 }
            )
        }

        const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED'

        await prisma.professional.update({
            where: { id: professionalId },
            data: {
                verificationStatus: newStatus,
                verifiedAt: action === 'approve' ? new Date() : null,
            },
        })

        if (action === 'approve') {
            await sendEmail({
                to: professional.user.email,
                subject: 'âœ… Tu cuenta de profesional ha sido verificada - PsyDoctor',
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ðŸŽ‰ Â¡Felicitaciones!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Tu cuenta ha sido verificada</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${professional.user.name || 'Profesional'} ðŸ‘‹</h2>
        <p style="color: #4b5563;">Â¡Buenas noticias! Tu cuenta de profesional en <strong>PsyDoctor</strong> ha sido <strong>verificada exitosamente</strong>.</p>
        <p style="color: #4b5563;">Ahora puedes:</p>
        <ul style="color: #4b5563; line-height: 2;">
            <li>Completar tu perfil pÃºblico</li>
            <li>Configurar tu disponibilidad</li>
            <li>Recibir pacientes</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;
                      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                Ir a mi dashboard
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Â© ${new Date().getFullYear()} PsyDoctor. Todos los derechos reservados.</p>
    </div>
</body>
</html>
                `,
            })

            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'APPROVE_PROFESSIONAL',
                targetType: 'PROFESSIONAL',
                targetId: professional.id,
                targetName: professional.user.name || undefined,
                targetEmail: professional.user.email,
                details: {
                    professionalType: professional.professionalType,
                    licenseNumber: professional.licenseNumber,
                },
            })
        } else {
            await sendEmail({
                to: professional.user.email,
                subject: 'âš ï¸ ActualizaciÃ³n de tu solicitud - PsyDoctor',
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ðŸ“‹ Solicitud actualizada</h1>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${professional.user.name || 'Profesional'}</h2>
        <p style="color: #4b5563;">Lamentamos informarte que tu solicitud para ser parte de <strong>PsyDoctor</strong> ha sido <strong>rechazada</strong>.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #991b1b; font-weight: 600; margin: 0 0 8px 0;">Motivo del rechazo:</p>
            <p style="color: #7f1d1d; margin: 0;">${rejectionReason}</p>
        </div>
        <p style="color: #4b5563;">Si crees que hay un error o deseas corregir tu documentaciÃ³n, por favor contacta a nuestro equipo de soporte.</p>
        <p style="color: #6b7280; font-size: 14px;">Equipo PsyDoctor</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Â© ${new Date().getFullYear()} PsyDoctor. Todos los derechos reservados.</p>
    </div>
</body>
</html>
                `,
            })

            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'REJECT_PROFESSIONAL',
                targetType: 'PROFESSIONAL',
                targetId: professional.id,
                targetName: professional.user.name || undefined,
                targetEmail: professional.user.email,
                details: {
                    reason: rejectionReason,
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Verify professional error:', error)
        return NextResponse.json(
            { error: 'Error al verificar profesional' },
            { status: 500 }
        )
    }
}

