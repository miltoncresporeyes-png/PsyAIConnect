/**
 * API endpoint para generar datos de prueba del sistema de reembolsos
 * POST /api/admin/seed-reimbursement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        console.log('🌱 Generando datos de prueba...')

        // 1. Buscar paciente demo
        const patient = await prisma.user.findUnique({
            where: { email: 'paciente@demo.com' },
            include: { patientProfile: true }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Paciente demo no encontrado' }, { status: 404 })
        }

        // 2. Buscar profesional demo
        const professionalUser = await prisma.user.findUnique({
            where: { email: 'profesional@demo.com' },
            include: { professional: true }
        })

        if (!professionalUser?.professional) {
            return NextResponse.json({ error: 'Profesional demo no encontrado' }, { status: 404 })
        }

        // 3. Generar sesiones de enero 2026
        const sessions = [
            { date: new Date('2026-01-08T10:00:00-03:00'), amount: 45000 },
            { date: new Date('2026-01-15T10:00:00-03:00'), amount: 45000 },
            { date: new Date('2026-01-22T10:00:00-03:00'), amount: 45000 },
        ]

        const created = []

        for (const session of sessions) {
            // Crear cita
            const appointment = await prisma.appointment.create({
                data: {
                    patientId: patient.id,
                    professionalId: professionalUser.professional.id,
                    scheduledAt: session.date,
                    duration: 50,
                    modality: 'ONLINE', // Corregido: usar ONLINE en lugar de VIDEO
                    status: 'COMPLETED',
                    consultationReason: 'Sesión de psicoterapia individual'
                }
            })

            // Crear pago
            const commission = Math.round(session.amount * 0.05) // 5% comisión
            const netAmount = session.amount - commission

            await prisma.payment.create({
                data: {
                    appointmentId: appointment.id,
                    amount: session.amount,
                    commission,
                    netAmount,
                    status: 'COMPLETED',
                    flowToken: `test-token-${appointment.id}`,
                    paidAt: session.date
                }
            })

            // Crear boleta
            const invoiceNumber = `BH-2026${String(session.date.getMonth() + 1).padStart(2, '0')}${String(session.date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

            const brutAmount = session.amount
            const siiRetention = Math.round(brutAmount * 0.1525) // 15.25% retención SII
            const invoiceNetAmount = brutAmount - siiRetention

            await prisma.invoice.create({
                data: {
                    appointmentId: appointment.id,
                    invoiceNumber,
                    issueDate: session.date,
                    healthSystem: 'ISAPRE',
                    isapre: 'Colmena',
                    brutAmount,
                    siiRetention,
                    netAmount: invoiceNetAmount,
                    status: 'PAID',
                    paidAt: session.date
                }
            })

            created.push({
                date: session.date.toLocaleDateString('es-CL'),
                amount: session.amount,
                invoiceNumber
            })
        }

        const totalAmount = sessions.reduce((sum, s) => sum + s.amount, 0)
        const estimatedReimbursement = Math.round(totalAmount * 0.55)

        return NextResponse.json({
            success: true,
            message: 'Datos de prueba generados exitosamente',
            summary: {
                sessionsCreated: sessions.length,
                totalAmount,
                estimatedReimbursement,
                sessions: created
            }
        })

    } catch (error) {
        console.error('Error generando datos:', error)
        return NextResponse.json(
            { error: 'Error al generar datos de prueba', details: String(error) },
            { status: 500 }
        )
    }
}
