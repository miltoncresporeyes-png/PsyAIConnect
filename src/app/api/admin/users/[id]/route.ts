import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'
import { sendEmail } from '@/lib/email'
import { logAdminAction } from '@/lib/adminLogs'

export const dynamic = 'force-dynamic'

/** Detalle de un usuario para el panel: datos, perfil profesional, citas recientes y acciones de administradores. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
    try {
        const guard = await requireAdmin()
        if ('error' in guard) return guard.error

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                patientProfile: true,
                professional: true,
                appointmentsAsPatient: {
                    orderBy: { scheduledAt: 'desc' },
                    take: 20,
                    include: {
                        payment: { select: { amount: true, status: true } },
                        professional: { select: { user: { select: { name: true } } } },
                    },
                },
            },
        })
        if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

        let professionalStats: { total: number; completed: number; noShow: number; upcoming: number } | null = null
        let professionalAppointments: {
            id: string
            scheduledAt: Date
            status: string
            modality: string
            patientName: string | null
        }[] = []
        if (user.professional) {
            const pid = user.professional.id
            const now = new Date()
            const [total, completed, noShow, upcoming, recent] = await Promise.all([
                prisma.appointment.count({ where: { professionalId: pid } }),
                prisma.appointment.count({ where: { professionalId: pid, status: 'COMPLETED' } }),
                prisma.appointment.count({ where: { professionalId: pid, status: 'NO_SHOW' } }),
                prisma.appointment.count({ where: { professionalId: pid, status: { in: ['PENDING', 'CONFIRMED'] }, scheduledAt: { gte: now } } }),
                prisma.appointment.findMany({
                    where: { professionalId: pid },
                    orderBy: { scheduledAt: 'desc' },
                    take: 20,
                    select: { id: true, scheduledAt: true, status: true, modality: true, patient: { select: { name: true } } },
                }),
            ])
            professionalStats = { total, completed, noShow, upcoming }
            professionalAppointments = recent.map((a) => ({
                id: a.id,
                scheduledAt: a.scheduledAt,
                status: a.status,
                modality: a.modality,
                patientName: a.patient.name,
            }))
        }

        const history = await prisma.adminLog.findMany({
            where: { targetId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 15,
            select: { id: true, action: true, adminName: true, details: true, createdAt: true },
        })

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            isActive: user.isActive,
            adminNotes: user.adminNotes,
            noShowCount: user.noShowCount,
            patientProfile: user.patientProfile,
            professional: user.professional
                ? {
                      rut: user.professional.rut,
                      licenseNumber: user.professional.licenseNumber,
                      professionalType: user.professional.professionalType,
                      specialties: user.professional.specialties,
                      verificationStatus: user.professional.verificationStatus,
                      isPublic: user.professional.isPublic,
                      subscriptionTier: user.professional.subscriptionTier,
                      subscriptionEnds: user.professional.subscriptionEnds,
                      sessionPrice: user.professional.sessionPrice,
                      sessionDuration: user.professional.sessionDuration,
                      slug: user.professional.slug,
                  }
                : null,
            professionalStats,
            professionalAppointments,
            appointments: user.appointmentsAsPatient.map((a) => ({
                id: a.id,
                scheduledAt: a.scheduledAt,
                status: a.status,
                modality: a.modality,
                professionalName: a.professional.user.name,
                payment: a.payment,
            })),
            history,
        })
    } catch (error) {
        console.error('Admin user detail error:', error)
        return NextResponse.json({ error: 'Error al obtener el usuario' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const guard = await requireAdmin()
        if ('error' in guard) return guard.error
        const adminUser = { id: guard.adminId, name: guard.adminName }

        const { action, adminNotes, role } = await request.json()


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
            if (user.id === adminUser.id) {
                return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta' }, { status: 400 })
            }
            if (user.role === 'ADMIN' && (await prisma.user.count({ where: { role: 'ADMIN', isActive: true } })) <= 1) {
                return NextResponse.json({ error: 'No puedes desactivar al último administrador' }, { status: 400 })
            }
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

            const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
            const resetUrl = `${baseUrl}/restablecer-contrasena?token=${resetToken}`

            await sendEmail({
                to: user.email,
                subject: '🔐 Restablecer contraseña - PsyDoctor',
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

        if (action === 'setRole') {
            if (role !== 'ADMIN' && role !== 'PATIENT' && role !== 'PROFESSIONAL') {
                return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
            }
            if (user.id === adminUser.id) {
                return NextResponse.json({ error: 'No puedes cambiar tu propio rol' }, { status: 400 })
            }
            if (user.role === role) {
                return NextResponse.json({ error: 'El usuario ya tiene ese rol' }, { status: 400 })
            }
            // Un profesional solo puede serlo si tiene perfil profesional; un administrador deja de serlo volviendo a su rol real
            if (role === 'PROFESSIONAL') {
                const hasProfile = await prisma.professional.findUnique({ where: { userId: user.id }, select: { id: true } })
                if (!hasProfile) {
                    return NextResponse.json({ error: 'No tiene perfil profesional: no se puede asignar ese rol' }, { status: 400 })
                }
            }
            if (user.role === 'ADMIN' && (await prisma.user.count({ where: { role: 'ADMIN', isActive: true } })) <= 1) {
                return NextResponse.json({ error: 'No puedes quitar el rol al último administrador' }, { status: 400 })
            }

            await prisma.user.update({ where: { id: params.id }, data: { role } })
            await logAdminAction({
                adminId: adminUser.id,
                adminName: adminUser.name || undefined,
                action: 'SET_ROLE',
                targetType: 'USER',
                targetId: user.id,
                targetName: user.name || undefined,
                targetEmail: user.email,
                details: { from: user.role, to: role },
            })
            return NextResponse.json({
                success: true,
                message: `Rol actualizado a ${role}. Surte efecto cuando la persona vuelva a iniciar sesión.`,
            })
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
