/**
 * Seed script para generar datos de prueba del sistema de reembolsos
 * 
 * Genera sesiones completadas y pagadas para el paciente demo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedReimbursementData() {
    console.log('🌱 Generando datos de prueba para sistema de reembolsos...')

    try {
        // 1. Buscar paciente demo
        const patient = await prisma.user.findUnique({
            where: { email: 'paciente@demo.com' },
            include: { patientProfile: true }
        })

        if (!patient) {
            console.error('❌ Paciente demo no encontrado')
            return
        }

        console.log(`✅ Paciente encontrado: ${patient.name}`)

        // 2. Buscar profesional demo
        const professionalUser = await prisma.user.findUnique({
            where: { email: 'profesional@demo.com' },
            include: { professional: true }
        })

        if (!professionalUser?.professional) {
            console.error('❌ Profesional demo no encontrado')
            return
        }

        console.log(`✅ Profesional encontrado: ${professionalUser.name}`)

        // 3. Generar sesiones de enero 2026
        const sessions = [
            { date: new Date('2026-01-08T10:00:00'), amount: 45000 },
            { date: new Date('2026-01-15T10:00:00'), amount: 45000 },
            { date: new Date('2026-01-22T10:00:00'), amount: 45000 },
            { date: new Date('2026-01-29T10:00:00'), amount: 45000 },
        ]

        console.log(`\n📅 Creando ${sessions.length} sesiones...`)

        for (const session of sessions) {
            // Crear cita
            const appointment = await prisma.appointment.create({
                data: {
                    patientId: patient.id,
                    professionalId: professionalUser.professional.id,
                    scheduledAt: session.date,
                    duration: 50,
                    modality: 'VIDEO',
                    status: 'COMPLETED',
                    consultationReason: 'Sesión de psicoterapia individual'
                }
            })

            console.log(`  ✓ Cita creada: ${session.date.toLocaleDateString('es-CL')}`)

            // Crear pago
            const payment = await prisma.payment.create({
                data: {
                    appointmentId: appointment.id,
                    amount: session.amount,
                    status: 'PAID',
                    method: 'FLOW',
                    flowToken: `test-token-${appointment.id}`,
                    paidAt: session.date
                }
            })

            console.log(`  ✓ Pago registrado: $${session.amount}`)

            // Crear boleta
            const invoiceNumber = `BH-2026${String(session.date.getMonth() + 1).padStart(2, '0')}${String(session.date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

            const brutAmount = session.amount
            const siiRetention = Math.round(brutAmount * 0.1525) // 15.25% retención SII
            const netAmount = brutAmount - siiRetention

            const invoice = await prisma.invoice.create({
                data: {
                    appointmentId: appointment.id,
                    reportId: null, // Se asociará cuando se genere el reporte mensual
                    invoiceNumber,
                    issueDate: session.date,
                    patientName: patient.name,
                    patientRut: patient.patientProfile?.rut || '12345678-9',
                    healthSystem: patient.patientProfile?.healthSystem || 'ISAPRE',
                    brutAmount,
                    siiRetention,
                    netAmount,
                    status: 'PAID',
                    paidAt: session.date
                }
            })

            console.log(`  ✓ Boleta generada: ${invoiceNumber}`)
        }

        console.log('\n✅ Datos de prueba generados exitosamente!')
        console.log('\n📊 Resumen:')
        console.log(`  - Sesiones creadas: ${sessions.length}`)
        console.log(`  - Total bruto: $${sessions.reduce((sum, s) => sum + s.amount, 0).toLocaleString('es-CL')}`)
        console.log(`  - Reembolso estimado (~55%): $${Math.round(sessions.reduce((sum, s) => sum + s.amount, 0) * 0.55).toLocaleString('es-CL')}`)
        console.log('\n🎯 Ahora puedes:')
        console.log('  1. Recargar el dashboard del paciente')
        console.log('  2. Ver las sesiones elegibles en ReimbursementCard')
        console.log('  3. Crear una solicitud de reembolso')
        console.log('  4. Generar el kit PDF')

    } catch (error) {
        console.error('❌ Error generando datos:', error)
    } finally {
        await prisma.$disconnect()
    }
}

// Ejecutar seed
seedReimbursementData()
    .then(() => {
        console.log('\n✨ Proceso completado')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Error fatal:', error)
        process.exit(1)
    })
