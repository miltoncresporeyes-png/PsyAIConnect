import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const suspendSchema = z.object({
    dias: z.number().int().min(1).max(365).optional(),
    hastaFecha: z.string().optional(),
    motivo: z.string().max(300).optional(),
})

/**
 * GET: Obtener el estado de actividad / suspensión de la cuenta
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                professional: {
                    select: {
                        isActive: true,
                        isPublic: true,
                        suspendedAt: true,
                        suspendedUntil: true,
                        suspensionReason: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        const isProfessional = user.role === 'PROFESSIONAL'
        const isSuspended = isProfessional
            ? !user.professional?.isPublic || !user.professional?.isActive || !user.isActive
            : !user.isActive

        return NextResponse.json({
            role: user.role,
            isActive: user.isActive,
            isProfessional,
            professionalDetails: user.professional,
            isSuspended,
        })
    } catch (error) {
        console.error('Error fetching account status:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

/**
 * POST: Suspender o reactivar cuenta
 * action = "suspender" | "reactivar"
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = session.user.id
        const body = await request.json().catch(() => ({}))
        const { action } = body

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { professional: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        const isProfessional = user.role === 'PROFESSIONAL'

        if (action === 'reactivar') {
            await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: { isActive: true },
                })

                if (isProfessional && user.professional) {
                    await tx.professional.update({
                        where: { userId },
                        data: {
                            isActive: true,
                            isPublic: true,
                            suspendedAt: null,
                            suspendedUntil: null,
                            suspensionReason: null,
                        },
                    })
                }

                // Log de reactivación en consents/auditoría
                await tx.consentLog.create({
                    data: {
                        userId,
                        consentType: 'ACCOUNT_DELETION_REQUEST',
                        consentVersion: 'v1.0',
                        consentTextHash: createHash('sha256').update(`REACTIVACION_${userId}_${Date.now()}`).digest('hex'),
                        granted: true,
                        revokedReason: 'Reactivación voluntaria de cuenta solicitada por el usuario',
                    },
                })
            })

            return NextResponse.json({
                success: true,
                message: isProfessional
                    ? '¡Tu perfil y agenda han sido reactivados con éxito! Ya eres visible en el directorio para recibir pacientes.'
                    : 'Tu cuenta ha sido reactivada exitosamente.',
            })
        }

        if (action === 'suspender') {
            const parsed = suspendSchema.safeParse(body)
            if (!parsed.success) {
                return NextResponse.json({ error: 'Datos de suspensión inválidos' }, { status: 400 })
            }

            const { dias, hastaFecha, motivo } = parsed.data

            // Calcular fecha de término de suspensión
            let suspendedUntil: Date | null = null
            if (hastaFecha) {
                suspendedUntil = new Date(hastaFecha)
            } else if (dias) {
                suspendedUntil = new Date()
                suspendedUntil.setDate(suspendedUntil.getDate() + dias)
            }

            await prisma.$transaction(async (tx) => {
                if (isProfessional && user.professional) {
                    // Para profesional: ocultar del directorio y pausar reservas
                    await tx.professional.update({
                        where: { userId },
                        data: {
                            isPublic: false, // Inmediatamente oculto del directorio y búsquedas
                            isActive: false, // Agenda pausada
                            suspendedAt: new Date(),
                            suspendedUntil,
                            suspensionReason: motivo || 'Pausa temporal solicitada por el profesional',
                        },
                    })
                } else {
                    // Para paciente: marcar inactivo
                    await tx.user.update({
                        where: { id: userId },
                        data: { isActive: false },
                    })
                }

                await tx.consentLog.create({
                    data: {
                        userId,
                        consentType: 'ACCOUNT_DELETION_REQUEST',
                        consentVersion: 'v1.0',
                        consentTextHash: createHash('sha256').update(`SUSPENSION_${userId}_${Date.now()}`).digest('hex'),
                        granted: false,
                        revokedAt: new Date(),
                        revokedReason: motivo || 'Suspensión temporal voluntaria',
                    },
                })
            })

            return NextResponse.json({
                success: true,
                message: isProfessional
                    ? `Tu perfil ha sido pausado. No aparecerás en búsquedas públicas y tu agenda quedó temporalmente suspendida${suspendedUntil ? ` hasta el ${suspendedUntil.toLocaleDateString('es-CL')}` : ''}. Puedes reactivarla en cualquier momento.`
                    : 'Tu cuenta ha sido pausada temporalmente. Puedes reactivarla cuando desees iniciando sesión.',
                suspendedUntil,
            })
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    } catch (error) {
        console.error('Error in account suspension/reactivation:', error)
        return NextResponse.json({ error: 'Error interno al procesar la solicitud' }, { status: 500 })
    }
}

/**
 * DELETE: Baja definitiva / Eliminación conforme a Ley 19.628 (Derechos ARCO)
 */
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const userId = session.user.id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { professional: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // 1. Validar que no existan citas futuras o pendientes
        const activeAppointments = await prisma.appointment.findFirst({
            where: {
                OR: [
                    { patientId: userId },
                    ...(user.professional ? [{ professionalId: user.professional.id }] : []),
                ],
                status: { in: ['PENDING', 'CONFIRMED'] },
                scheduledAt: { gte: new Date() },
            },
        })

        if (activeAppointments) {
            return NextResponse.json(
                {
                    error: user.role === 'PROFESSIONAL'
                        ? 'No puedes dar de baja tu cuenta mientras tengas sesiones agendadas o pendientes con pacientes. Cancela o reprograma las citas previas.'
                        : 'No es posible eliminar la cuenta mientras tengas citas futuras o pendientes.',
                },
                { status: 409 }
            )
        }

        // 2. Anonimización estricta protegiendo ficha clínica legal (Ley 20.584 y Ley 19.628)
        const deletionConsentText = `SOLICITUD_BAJA_DEFINITIVA_ARCO_LEY19628_${userId}`
        const consentTextHash = createHash('sha256').update(deletionConsentText).digest('hex')

        await prisma.$transaction(async (tx) => {
            // Log de revocación y baja
            await tx.consentLog.create({
                data: {
                    userId,
                    consentType: 'ACCOUNT_DELETION_REQUEST',
                    consentVersion: 'v1.0',
                    consentTextHash,
                    granted: false,
                    revokedAt: new Date(),
                    revokedReason: 'Derecho ARCO: Supresión / Baja definitiva solicitada por el titular',
                },
            })

            // Si es profesional, despublicar de inmediato y anonimizar datos de perfil
            if (user.professional) {
                await tx.professional.update({
                    where: { userId },
                    data: {
                        isPublic: false,
                        isActive: false,
                        bio: 'Cuenta cerrada',
                        officeAddress: null,
                        linkedinUrl: null,
                        profileImageUrl: null,
                    },
                })
            }

            // Anonimizar usuario principal
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: 'Usuario Eliminado',
                    email: `deleted_${userId.slice(0, 8)}@anonymized.psydoctor.cl`,
                    phone: null,
                    image: null,
                    isActive: false,
                },
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Tu cuenta ha sido dada de baja y tus datos personales han sido anonimizados conforme a la Ley N° 19.628.',
        })
    } catch (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json(
            { error: 'Error interno al procesar la baja de la cuenta' },
            { status: 500 }
        )
    }
}
