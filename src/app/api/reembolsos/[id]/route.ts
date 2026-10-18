import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
/**
 * API: Obtener detalles de una solicitud de reembolso
 * GET /api/reembolsos/[id]
 * 
 * PATCH /api/reembolsos/[id] - Actualizar estado
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatReimbursementData } from '@/lib/reimbursement'
import { z } from 'zod'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const blocked = getWaitlistBlockedResponse()
    if (blocked) return blocked

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Obtener solicitud
        const request = await prisma.reimbursementRequest.findUnique({
            where: { id: params.id }
        })

        if (!request) {
            return NextResponse.json(
                { error: 'Solicitud no encontrada' },
                { status: 404 }
            )
        }

        // Verificar que pertenece al usuario
        if (request.patientId !== user.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            )
        }

        // Formatear y retornar
        const formatted = await formatReimbursementData(params.id)

        return NextResponse.json(formatted)
    } catch (error) {
        console.error('Error fetching reimbursement request:', error)
        return NextResponse.json(
            { error: 'Error al obtener solicitud' },
            { status: 500 }
        )
    }
}

const updateReimbursementSchema = z.object({
    status: z.enum(['DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED']).optional(),
    trackingNumber: z.string().optional(),
    notes: z.string().optional(),
    reimbursedAmount: z.number().optional(),
    submittedAt: z.string().datetime().optional()
})

// Estados que un paciente (dueño de la solicitud) puede fijar por sí mismo
const PATIENT_ALLOWED_STATUS = ['PENDING', 'CANCELLED'] as const

// Transiciones permitidas para el paciente desde el estado actual
const PATIENT_ALLOWED_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['PENDING', 'CANCELLED'],
    PENDING: ['CANCELLED'],
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const blocked = getWaitlistBlockedResponse()
    if (blocked) return blocked

    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Obtener solicitud
        const request = await prisma.reimbursementRequest.findUnique({
            where: { id: params.id }
        })

        if (!request) {
            return NextResponse.json(
                { error: 'Solicitud no encontrada' },
                { status: 404 }
            )
        }

        // Verificar que pertenece al usuario
        if (request.patientId !== user.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            )
        }

        // Validar body
        const body = await req.json()
        const validation = updateReimbursementSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.errors },
                { status: 400 }
            )
        }

        const updates = validation.data
        const isAdmin = user.role === 'ADMIN'

        // Preparar datos de actualización
        const updateData: any = {}

        if (!isAdmin) {
            // Un paciente solo puede enviar a revisión o cancelar su propia solicitud.
            // El monto reembolsado, el tracking y los estados de aprobación/pago
            // están reservados al administrador.
            if (
                updates.reimbursedAmount !== undefined ||
                updates.trackingNumber !== undefined ||
                updates.submittedAt !== undefined
            ) {
                return NextResponse.json(
                    { error: 'No autorizado para modificar estos campos' },
                    { status: 403 }
                )
            }

            if (updates.status) {
                const allowedTargets: readonly string[] =
                    PATIENT_ALLOWED_TRANSITIONS[request.status] ?? []

                if (
                    !PATIENT_ALLOWED_STATUS.includes(updates.status as any) ||
                    !allowedTargets.includes(updates.status)
                ) {
                    return NextResponse.json(
                        { error: 'Transición de estado no permitida' },
                        { status: 403 }
                    )
                }
            }
        }

        if (updates.status) {
            updateData.status = updates.status

            // Si se marca como PENDING, registrar fecha de envío
            if (updates.status === 'PENDING' && !request.submittedAt) {
                updateData.submittedAt = new Date()
            }

            // Si se marca como PAID o APPROVED, registrar fecha de procesamiento
            if ((updates.status === 'PAID' || updates.status === 'APPROVED') && !request.processedAt) {
                updateData.processedAt = new Date()
            }
        }

        if (updates.trackingNumber) {
            updateData.trackingNumber = updates.trackingNumber
        }

        if (updates.notes !== undefined) {
            updateData.notes = updates.notes
        }

        if (updates.reimbursedAmount !== undefined) {
            updateData.reimbursedAmount = updates.reimbursedAmount
        }

        if (updates.submittedAt) {
            updateData.submittedAt = new Date(updates.submittedAt)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No hay cambios para aplicar' },
                { status: 400 }
            )
        }

        // Actualizar
        const updated = await prisma.reimbursementRequest.update({
            where: { id: params.id },
            data: updateData
        })

        // Retornar datos actualizados
        const formatted = await formatReimbursementData(params.id)

        return NextResponse.json(formatted)
    } catch (error) {
        console.error('Error updating reimbursement request:', error)
        return NextResponse.json(
            { error: 'Error al actualizar solicitud' },
            { status: 500 }
        )
    }
}
