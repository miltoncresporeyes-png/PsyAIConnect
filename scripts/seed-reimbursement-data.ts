/**
 * Script para crear datos de prueba para el flujo de reembolso
 * 
 * Este script crea:
 * 1. Un paciente con perfil completo
 * 2. Citas completadas con el profesional
 * 3. Boletas (invoices) para cada cita
 * 4. Pagos completados
 * 
 * Usar: npx ts-node scripts/seed-reimbursement-data.ts <email-paciente>
 */

const { PrismaClient } = require('../src/generated/client')
const prisma = new PrismaClient()

async function main() {
    const patientEmail = process.argv[2]

    if (!patientEmail) {
        console.error('❌ Debes proporcionar el email del paciente')
        console.log('Uso: npx ts-node scripts/seed-reimbursement-data.ts paciente@example.com')
        process.exit(1)
    }

    console.log('🔍 Buscando paciente:', patientEmail)

    // 1. Buscar el paciente
    const patient = await prisma.user.findUnique({
        where: { email: patientEmail },
        include: { patientProfile: true }
    })

    if (!patient) {
        console.error(`❌ No se encontró un paciente con email: ${patientEmail}`)
        console.log('\n💡 Pacientes disponibles:')
        const allPatients = await prisma.user.findMany({
            where: { role: 'PATIENT' },
            select: { email: true, name: true }
        })
        allPatients.forEach(p => console.log(`   - ${p.email} (${p.name})`))
        process.exit(1)
    }

    console.log(`✅ Paciente encontrado: ${patient.name}`)

    // 2. Buscar un profesional
    const professional = await prisma.professional.findFirst({
        where: { isActive: true },
        include: { user: true }
    })

    if (!professional) {
        console.error('❌ No hay profesionales activos en el sistema')
        process.exit(1)
    }

    console.log(`✅ Profesional encontrado: ${professional.user.name}`)

    // 3. Crear 3 citas completadas con boletas y pagos
    const today = new Date()
    const sessionsData = [
        { daysAgo: 30, duration: 50, price: 35000 },
        { daysAgo: 23, duration: 50, price: 35000 },
        { daysAgo: 16, duration: 50, price: 35000 },
    ]

    console.log('\n📅 Creando citas...')

    for (const [index, session] of sessionsData.entries()) {
        const scheduledAt = new Date(today)
        scheduledAt.setDate(scheduledAt.getDate() - session.daysAgo)
        scheduledAt.setHours(14, 0, 0, 0)

        // Crear cita
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                professionalId: professional.id,
                scheduledAt,
                duration: session.duration,
                modality: 'ONLINE',
                status: 'COMPLETED',
                consultationReason: 'Sesión de psicoterapia',
            }
        })

        console.log(`   ✅ Cita ${index + 1} creada: ${scheduledAt.toLocaleDateString('es-CL')}`)

        // Crear pago
        const payment = await prisma.payment.create({
            data: {
                appointmentId: appointment.id,
                amount: session.price,
                currency: 'CLP',
                method: 'CREDIT_CARD',
                status: 'COMPLETED',
                transactionId: `TEST-${Date.now()}-${index}`,
                commission: Math.round(session.price * 0.114), // 11.4%
                paidAt: scheduledAt
            }
        })

        console.log(`   💰 Pago creado: $${session.price}`)

        // Crear boleta
        const invoiceNumber = `BH-${scheduledAt.getFullYear()}${String(scheduledAt.getMonth() + 1).padStart(2, '0')}${String(index + 1).padStart(4, '0')}`
        const brutAmount = session.price
        const siiRetention = Math.round(brutAmount * 0.1525) // 15.25%
        const netAmount = brutAmount - siiRetention - payment.commission

        await prisma.invoice.create({
            data: {
                appointmentId: appointment.id,
                invoiceNumber,
                issueDate: scheduledAt,
                brutAmount,
                siiRetention,
                netAmount,
                healthSystem: patient.patientProfile?.healthSystem || 'PRIVATE',
                status: 'PAID',
                paidAt: scheduledAt
            }
        })

        console.log(`   📄 Boleta creada: ${invoiceNumber}`)
    }

    console.log('\n✅ ¡Datos de prueba creados exitosamente!')
    console.log('\n📋 Resumen:')
    console.log(`   Paciente: ${patient.name} (${patient.email})`)
    console.log(`   Profesional: ${professional.user.name}`)
    console.log(`   Citas creadas: 3`)
    console.log(`   Monto total: $${sessionsData.reduce((sum, s) => sum + s.price, 0)}`)
    console.log('\n🎯 Ahora puedes:')
    console.log('   1. Iniciar sesión como:', patientEmail)
    console.log('   2. Ir a "Solicitar Reembolso"')
    console.log('   3. Seleccionar las 3 sesiones')
    console.log('   4. Generar el kit de reembolso')

    await prisma.$disconnect()
}

main().catch((error) => {
    console.error('Error:', error)
    prisma.$disconnect()
    process.exit(1)
})
