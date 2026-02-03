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

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Preparar datos de actualización
        const updateData: any = {}

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
