import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Endpoint for ARCO Rights: Right of Erasure / Deletion (Derecho de Cancelación / Supresión)
 * Complies with Chilean Ley 19.628 and health platform standards.
 */
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Check for active or pending appointments
        const activeAppointments = await prisma.appointment.findFirst({
            where: {
                patientId: userId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                scheduledAt: { gte: new Date() },
            },
        })

        if (activeAppointments) {
            return NextResponse.json(
                {
                    error: 'No es posible eliminar la cuenta mientras tengas citas futuras o pendientes.',
                },
                { status: 409 }
            )
        }

        // Anonymize user personal data while preserving medical record legal requirements
        const deletionConsentText = `SOLICITUD_ELIMINACION_CUENTA_ARCO_LEY19628_${userId}`
        const consentTextHash = createHash('sha256').update(deletionConsentText).digest('hex')

        await prisma.$transaction([
            prisma.consentLog.create({
                data: {
                    userId,
                    consentType: 'ACCOUNT_DELETION_REQUEST',
                    consentVersion: 'v1.0',
                    consentTextHash,
                    granted: false,
                    revokedAt: new Date(),
                    revokedReason: 'Derecho ARCO: Supresión solicitada por el usuario',
                },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    name: 'Usuario Eliminado',
                    email: `deleted_${userId.slice(0, 8)}@anonymized.psydoctor.cl`,
                    phone: null,
                    image: null,
                    isActive: false,
                },
            }),
        ])

        return NextResponse.json({
            success: true,
            message: 'Tu cuenta y datos identificatorios han sido eliminados/anonimizados conforme a la Ley 19.628.',
        })
    } catch (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json(
            { error: 'Error interno al procesar la solicitud de eliminación' },
            { status: 500 }
        )
    }
}
