import { prisma } from '../src/lib/prisma'

async function main() {
    try {
        console.log('='.repeat(60))
        console.log('DIAGNÓSTICO DE DATOS DE PACIENTES')
        console.log('='.repeat(60))

        // 1. Listar todos los pacientes
        const patients = await prisma.user.findMany({
            where: { role: 'PATIENT' },
            include: {
                patientProfile: true,
                appointmentsAsPatient: {
                    include: {
                        professional: {
                            include: { user: true }
                        },
                        payment: true,
                        invoice: true
                    }
                }
            }
        })

        console.log(`\n📊 Total de pacientes en el sistema: ${patients.length}\n`)

        for (const patient of patients) {
            console.log('─'.repeat(60))
            console.log(`👤 PACIENTE: ${patient.name}`)
            console.log(`   Email: ${patient.email}`)
            console.log(`   ID: ${patient.id}`)
            console.log(`   Previsión: ${patient.patientProfile?.healthSystem || 'No configurada'}`)

            const appointments = patient.appointmentsAsPatient
            console.log(`\n   📅 Total de citas: ${appointments.length}`)

            if (appointments.length > 0) {
                const completed = appointments.filter(a => a.status === 'COMPLETED')
                const withInvoice = completed.filter(a => a.invoice !== null)
                const withPayment = completed.filter(a => a.payment?.status === 'COMPLETED')
                const eligible = completed.filter(a =>
                    a.invoice !== null &&
                    a.payment?.status === 'COMPLETED' &&
                    a.reimbursementRequestId === null
                )

                console.log(`   ✅ Completadas: ${completed.length}`)
                console.log(`   📄 Con boleta: ${withInvoice.length}`)
                console.log(`   💰 Con pago completado: ${withPayment.length}`)
                console.log(`   ⭐ Elegibles para reembolso: ${eligible.length}`)

                if (eligible.length > 0) {
                    console.log(`\n   🎯 CITAS ELEGIBLES PARA REEMBOLSO:`)
                    eligible.forEach((apt, i) => {
                        console.log(`   ${i + 1}. ${new Date(apt.scheduledAt).toLocaleDateString('es-CL')} - ${apt.professional.user.name}`)
                        console.log(`      Monto: $${apt.invoice?.brutAmount || 0}`)
                    })
                } else {
                    console.log(`\n   ⚠️  NO HAY CITAS ELEGIBLES`)
                    console.log(`   Razones posibles:`)
                    if (completed.length === 0) console.log(`      - No hay citas completadas`)
                    if (withInvoice.length < completed.length) console.log(`      - Faltan boletas en citas completadas`)
                    if (withPayment.length < completed.length) console.log(`      - Faltan pagos completados`)
                }
            } else {
                console.log(`   ⚠️  Este paciente NO tiene citas`)
            }

            // Check reimbursement requests
            const requests = await prisma.reimbursementRequest.findMany({
                where: { patientId: patient.id },
                include: { appointments: true }
            })

            if (requests.length > 0) {
                console.log(`\n   📋 Solicitudes de reembolso: ${requests.length}`)
                requests.forEach((req, i) => {
                    console.log(`   ${i + 1}. ${req.status} - ${req.appointments.length} sesiones - $${req.totalAmount}`)
                })
            } else {
                console.log(`\n   📋 No tiene solicitudes de reembolso creadas`)
            }

            console.log('')
        }

        console.log('='.repeat(60))
        console.log('RESUMEN GENERAL')
        console.log('='.repeat(60))

        const totalAppointments = await prisma.appointment.count()
        const completedAppointments = await prisma.appointment.count({ where: { status: 'COMPLETED' } })
        const totalInvoices = await prisma.invoice.count()
        const totalPayments = await prisma.payment.count({ where: { status: 'COMPLETED' } })

        console.log(`Citas totales: ${totalAppointments}`)
        console.log(`Citas completadas: ${completedAppointments}`)
        console.log(`Boletas generadas: ${totalInvoices}`)
        console.log(`Pagos completados: ${totalPayments}`)
        console.log('')

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
