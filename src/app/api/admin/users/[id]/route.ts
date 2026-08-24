import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { logAdminAction } from '@/lib/adminLogs'

export const dynamic = 'force-dynamic'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const { action, adminNotes } = await request.json()

        if (!action) {
            return NextResponse.json(
                { error: 'Acción requerida' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        if (action === 'ban') {
            await prisma.user.update({
                where: { id: params.id },
                data: { isActive: false },
            })

            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'BAN_USER',
                targetType: 'USER',
                targetId: user.id,
                targetName: user.name || undefined,
                targetEmail: user.email,
            })

            return NextResponse.json({ success: true, message: 'Usuario baneado' })
        }

        if (action === 'unban') {
            await prisma.user.update({
                where: { id: params.id },
                data: { isActive: true },
            })

            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'UNBAN_USER',
                targetType: 'USER',
                targetId: user.id,
                targetName: user.name || undefined,
                targetEmail: user.email,
            })

            return NextResponse.json({ success: true, message: 'Usuario desbaneado' })
        }

        if (action === 'resetPassword') {
            const resetToken = crypto.randomUUID()
            const expires = new Date(Date.now() + 3600000)

            await prisma.verificationToken.deleteMany({
                where: { identifier: user.email },
            })
            await prisma.verificationToken.create({
                data: {
                    identifier: user.email,
                    token: resetToken,
                    expires,
                },
            })

            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restablecer-contrasena?token=${resetToken}`

            await sendEmail({
                to: user.email,
                subject: '🔐 Restablecer contraseña - PsyConnect',
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Restablecer contraseña</h1>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #4b5563;">Hola${user.name ? ` ${user.name}` : ''},</p>
        <p style="color: #4b5563;">Un administrador ha solicitado restablecer tu contraseña. Haz clic en el botón de abajo:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;">
                Restablecer contraseña
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Este enlace expirará en 1 hora.</p>
        <p style="color: #ef4444; font-size: 13px;">Si no solicitaste esto, ignora este correo.</p>
    </div>
</body>
</html>
                `,
            })

            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'RESET_PASSWORD',
                targetType: 'USER',
                targetId: user.id,
                targetName: user.name || undefined,
                targetEmail: user.email,
            })

            return NextResponse.json({ success: true, message: 'Email de recuperación enviado' })
        }

        if (action === 'updateNotes') {
            await prisma.user.update({
                where: { id: params.id },
                data: { adminNotes },
            })

            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'UPDATE_NOTES',
                targetType: 'USER',
                targetId: user.id,
                targetName: user.name || undefined,
                targetEmail: user.email,
                details: {
                    notesLength: adminNotes?.length || 0,
                },
            })

            return NextResponse.json({ success: true, message: 'Notas actualizadas' })
        }

        return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
        )
    } catch (error) {
        console.error('User action error:', error)
        return NextResponse.json(
            { error: 'Error al realizar acción' },
            { status: 500 }
        )
    }
}
