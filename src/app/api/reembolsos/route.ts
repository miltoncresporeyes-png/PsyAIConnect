/**
 * API: Crear nueva solicitud de reembolso
 * POST /api/reembolsos
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAppointmentsForReimbursement, calculateEstimatedReimbursement } from '@/lib/reimbursement'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createReimbursementSchema = z.object({
    appointmentIds: z.array(z.string()).min(1, 'Debes seleccionar al menos una sesión'),
    hasMedicalReferral: z.boolean().default(false),
    notes: z.string().optional()
})

export async function GET(req: NextRequest) {
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

        const requests = await prisma.reimbursementRequest.findMany({
            where: { patientId: user.id },
            include: {
                appointments: {
                    include: {
                        invoice: true,
                        professional: {
                            include: { user: true }
                        }
                    }
                },
                isapre: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(requests)
    } catch (error) {
        console.error('Error fetching reimbursement requests:', error)
        return NextResponse.json(
            { error: 'Error al obtener solicitudes' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { patientProfile: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            )
        }

        // Validar body
        const body = await req.json()
        const validation = createReimbursementSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.errors },
                { status: 400 }
            )
        }

        const { appointmentIds, hasMedicalReferral, notes } = validation.data

        // Validar que las citas sean elegibles
        const validationResult = await validateAppointmentsForReimbursement(appointmentIds)

        if (!validationResult.valid) {
            return NextResponse.json(
                { error: 'Sesiones no válidas', details: validationResult.errors },
                { status: 400 }
            )
        }

        // Obtener las citas
        const appointments = await prisma.appointment.findMany({
            where: { id: { in: appointmentIds } },
            include: {
                invoice: true,
                patient: {
                    include: { patientProfile: true }
                }
            }
        })

        // Calcular totales
        const totalAmount = appointments.reduce((sum, apt) => {
            return sum + (apt.invoice?.brutAmount || 0)
        }, 0)

        // Obtener previsión del paciente
        const healthSystem = user.patientProfile?.healthSystem || 'PRIVATE'
        const isapreId = user.patientProfile?.isapreId

        // Obtener slug de Isapre si existe
        let isapreSlug: string | undefined
        if (isapreId) {
            const isapre = await prisma.isapre.findUnique({
                where: { id: isapreId }
            })
            isapreSlug = isapre?.code.toLowerCase()
        }

        // Calcular reembolso estimado
        const estimatedReimbursement = calculateEstimatedReimbursement(
            totalAmount,
            healthSystem,
            isapreSlug
        )

        // Obtener período (del primer appointment)
        const firstAppointment = appointments[0]
        const date = new Date(firstAppointment.scheduledAt)
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        // Crear solicitud de reembolso
        const request = await prisma.reimbursementRequest.create({
            data: {
                patientId: user.id,
                month,
                year,
                totalAmount,
                estimatedReimbursement,
                healthSystem,
                isapreId,
                hasMedicalReferral,
                notes,
                status: 'DRAFT'
            }
        })

        // Asociar appointments a la solicitud
        await prisma.appointment.updateMany({
            where: { id: { in: appointmentIds } },
            data: { reimbursementRequestId: request.id }
        })

        // Retornar solicitud creada
        const created = await prisma.reimbursementRequest.findUnique({
            where: { id: request.id },
            include: {
                appointments: {
                    include: {
                        invoice: true,
                        professional: {
                            include: { user: true }
                        }
                    }
                },
                isapre: true
            }
        })

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]

        return NextResponse.json({
            id: created!.id,
            period: {
                month: created!.month,
                year: created!.year,
                monthName: `${monthNames[created!.month - 1]} ${created!.year}`
            },
            healthSystem: created!.healthSystem,
            isapreName: created!.isapre?.name,
            totalAmount: created!.totalAmount,
            estimatedReimbursement: created!.estimatedReimbursement,
            sessionsCount: created!.appointments.length,
            status: created!.status,
            hasMedicalReferral: created!.hasMedicalReferral,
            createdAt: created!.createdAt
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating reimbursement request:', error)
        return NextResponse.json(
            { error: 'Error al crear solicitud de reembolso' },
            { status: 500 }
        )
    }
}
