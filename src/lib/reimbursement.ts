/**
 * Reimbursement Service
 * 
 * Handles generation of reimbursement kits, validation of appointments,
 * and calculation of estimated reimbursements
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { prisma } from './prisma'

interface ReimbursementKitData {
    patient: {
        name: string
        rut: string
        healthSystem: string
        isapreName?: string
    }
    appointments: Array<{
        date: Date
        professional: string
        amount: number
        invoiceNumber: string
        duration: number
    }>
    totalAmount: number
    estimatedReimbursement: number
    period: {
        month: number
        year: number
        monthName: string
    }
}

/**
 * Valida que las citas sean elegibles para reembolso
 */
export async function validateAppointmentsForReimbursement(
    appointmentIds: string[]
): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
        const appointments = await prisma.appointment.findMany({
            where: { id: { in: appointmentIds } },
            include: {
                invoice: true,
                payment: true,
                reimbursementRequest: true
            }
        })

        for (const apt of appointments) {
            const dateStr = new Date(apt.scheduledAt).toLocaleDateString('es-CL')

            // Validar que esté completada
            if (apt.status !== 'COMPLETED') {
                errors.push(`La sesión del ${dateStr} no está completada`)
            }

            // Validar que tenga boleta
            if (!apt.invoice) {
                errors.push(`La sesión del ${dateStr} no tiene boleta generada`)
            }

            // Validar que esté pagada
            if (apt.payment?.status !== 'COMPLETED') {
                errors.push(`La sesión del ${dateStr} no está pagada`)
            }

            // Validar que no esté ya en otra solicitud
            if (apt.reimbursementRequestId) {
                errors.push(`La sesión del ${dateStr} ya está en otra solicitud de reembolso`)
            }
        }

        return {
            valid: errors.length === 0,
            errors
        }
    } catch (error) {
        console.error('Error validating appointments:', error)
        return {
            valid: false,
            errors: ['Error al validar las sesiones']
        }
    }
}

/**
 * Calcula el reembolso estimado según la Isapre
 */
export function calculateEstimatedReimbursement(
    totalAmount: number,
    healthSystem: string,
    isapreSlug?: string
): number {
    // Porcentajes promedio de reembolso por Isapre
    const reimbursementRates: Record<string, number> = {
        'colmena': 0.60,        // 60%
        'banmedica': 0.50,      // 50%
        'consalud': 0.575,      // 57.5%
        'cruz-blanca': 0.525,   // 52.5%
        'vida-tres': 0.60,      // 60%
        'fonasa': 0.00          // FONASA no hace reembolso retroactivo
    }

    if (healthSystem === 'FONASA') {
        return 0
    }

    const rate = isapreSlug ? reimbursementRates[isapreSlug] || 0.55 : 0.55
    return Math.round(totalAmount * rate)
}

/**
 * Genera el PDF del Kit de Reembolso
 */
export async function generateReimbursementKit(
    requestId: string
): Promise<string> {
    try {
        // Obtener datos de la solicitud
        const request = await prisma.reimbursementRequest.findUnique({
            where: { id: requestId },
            include: {
                patient: {
                    include: { patientProfile: true }
                },
                appointments: {
                    include: {
                        professional: { include: { user: true } },
                        invoice: true
                    },
                    orderBy: { scheduledAt: 'asc' }
                },
                isapre: true
            }
        })

        if (!request) {
            throw new Error('Solicitud de reembolso no encontrada')
        }

        // Generar PDF
        const doc = new jsPDF()

        // ============================================
        // PÁGINA 1: PORTADA Y RESUMEN
        // ============================================

        // Header
        doc.setFontSize(20)
        doc.setTextColor(79, 70, 229) // Indigo
        doc.text('PsyConnect', 14, 20)

        doc.setFontSize(18)
        doc.setTextColor(0, 0, 0)
        doc.text('Kit de Reembolso', 14, 32)

        // Línea separadora
        doc.setDrawColor(200, 200, 200)
        doc.line(14, 38, 196, 38)

        // Datos del paciente
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.text('Datos del Paciente', 14, 48)

        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text(`Nombre: ${request.patient.name}`, 14, 56)
        doc.text(`RUT: ${request.patient.patientProfile?.rut || 'No registrado'}`, 14, 62)
        doc.text(`Previsión: ${request.isapre?.name || 'FONASA'}`, 14, 68)

        // Período
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        const monthName = monthNames[request.month - 1]
        doc.text(`Período: ${monthName} ${request.year}`, 14, 74)
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, 14, 80)

        // Resumen de sesiones
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.text('Resumen de Sesiones', 14, 95)

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
            }).format(amount)
        }

        const tableData = request.appointments.map(apt => [
            new Date(apt.scheduledAt).toLocaleDateString('es-CL'),
            apt.professional.user.name,
            apt.invoice?.invoiceNumber || 'N/A',
            `${apt.duration} min`,
            formatCurrency(apt.invoice?.brutAmount || 0)
        ])

        autoTable(doc, {
            startY: 102,
            head: [['Fecha', 'Profesional', 'N° Boleta', 'Duración', 'Monto']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
            styles: { fontSize: 8 },
        })

        // Totales
        const finalY = (doc as any).lastAutoTable.finalY + 10
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text(`Total Sesiones: ${request.appointments.length}`, 14, finalY)
        doc.text(`Monto Total: ${formatCurrency(request.totalAmount)}`, 14, finalY + 7)

        doc.setFontSize(12)
        doc.setTextColor(34, 197, 94) // Green
        doc.text(`Reembolso Estimado: ${formatCurrency(request.estimatedReimbursement)}`, 14, finalY + 16)

        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('* El monto real puede variar según tu plan y cobertura', 14, finalY + 23)

        // ============================================
        // PÁGINA 2: BOLETAS DE HONORARIOS
        // ============================================

        doc.addPage()
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Boletas de Honorarios Electrónicas', 14, 20)

        let yPos = 30

        for (const apt of request.appointments) {
            if (!apt.invoice) continue

            // Verificar si necesitamos nueva página
            if (yPos > 250) {
                doc.addPage()
                yPos = 20
            }

            // Boleta individual
            doc.setFillColor(250, 250, 250)
            doc.rect(14, yPos, 182, 45, 'F')

            doc.setFontSize(10)
            doc.setTextColor(0, 0, 0)
            doc.text(`Boleta N°: ${apt.invoice.invoiceNumber}`, 18, yPos + 8)
            doc.text(`Fecha: ${new Date(apt.invoice.issueDate).toLocaleDateString('es-CL')}`, 18, yPos + 15)

            doc.setFontSize(9)
            doc.text(`Profesional: ${apt.professional.user.name}`, 18, yPos + 22)
            doc.text(`RUT: ${apt.professional.rut}`, 18, yPos + 28)

            doc.text(`Prestación: Psicoterapia Individual`, 120, yPos + 22)
            doc.text(`Duración: ${apt.duration} minutos`, 120, yPos + 28)

            doc.setFontSize(10)
            doc.text(`Monto Bruto: ${formatCurrency(apt.invoice.brutAmount)}`, 18, yPos + 36)
            doc.text(`Retención SII: ${formatCurrency(apt.invoice.siiRetention)}`, 18, yPos + 42)

            doc.setTextColor(34, 197, 94)
            doc.text(`Monto Neto: ${formatCurrency(apt.invoice.netAmount)}`, 120, yPos + 36)

            yPos += 52
        }

        // ============================================
        // PÁGINA 3: CERTIFICADO DE ASISTENCIA
        // ============================================

        doc.addPage()
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text('Certificado de Asistencia', 14, 20)

        doc.setFontSize(10)
        doc.setTextColor(60, 60, 60)

        const certText = `
Por medio del presente, se certifica que el/la paciente:

${request.patient.name}
RUT: ${request.patient.patientProfile?.rut || 'No registrado'}

Asistió a las siguientes sesiones de psicoterapia durante el período de ${monthName} ${request.year}:
    `.trim()

        const lines = doc.splitTextToSize(certText, 170)
        doc.text(lines, 14, 35)

        yPos = 70

        request.appointments.forEach((apt, i) => {
            doc.text(
                `${i + 1}. ${new Date(apt.scheduledAt).toLocaleDateString('es-CL')} - ${apt.professional.user.name} - ${apt.duration} minutos`,
                20,
                yPos
            )
            yPos += 7
        })

        yPos += 10
        doc.text(`Total de sesiones: ${request.appointments.length}`, 14, yPos)

        yPos += 15
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Este certificado es generado automáticamente por PsyConnect', 14, yPos)
        doc.text('y tiene validez para trámites de reembolso ante Isapres y FONASA.', 14, yPos + 5)

        // Footer en todas las páginas
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            )
            doc.text(
                'Generado por PsyConnect - www.psyconnect.cl',
                14,
                doc.internal.pageSize.height - 10
            )
        }

        // Guardar PDF
        const pdfBlob = doc.output('blob')
        const cleanPeriod = monthName.toLowerCase()
        const filename = `Kit-Reembolso-${cleanPeriod}-${request.year}.pdf`

        // TODO: Subir a Supabase Storage
        // const url = await uploadToStorage(pdfBlob, filename)

        // Por ahora, retornar URL temporal
        const url = URL.createObjectURL(pdfBlob)

        // Actualizar request con URL
        await prisma.reimbursementRequest.update({
            where: { id: requestId },
            data: { kitPdfUrl: url }
        })

        return url
    } catch (error) {
        console.error('Error generating reimbursement kit:', error)
        throw new Error('Error al generar el kit de reembolso')
    }
}

/**
 * Formatea los datos del reporte para el frontend
 */
export async function formatReimbursementData(requestId: string) {
    const request = await prisma.reimbursementRequest.findUnique({
        where: { id: requestId },
        include: {
            patient: {
                include: { patientProfile: true }
            },
            appointments: {
                include: {
                    professional: { include: { user: true } },
                    invoice: true,
                    patient: true
                },
                orderBy: { scheduledAt: 'asc' }
            },
            isapre: true
        }
    })

    if (!request) {
        return null
    }

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    return {
        id: request.id,
        patient: {
            name: request.patient.name,
            email: request.patient.email,
            rut: request.patient.patientProfile?.rut
        },
        period: {
            month: request.month,
            year: request.year,
            monthName: `${monthNames[request.month - 1]} ${request.year}`
        },
        healthSystem: request.healthSystem,
        isapre: request.isapre ? {
            name: request.isapre.name,
            code: request.isapre.code
        } : null,
        appointments: request.appointments.map(apt => ({
            id: apt.id,
            date: apt.scheduledAt,
            professional: apt.professional.user.name,
            duration: apt.duration,
            invoice: apt.invoice ? {
                number: apt.invoice.invoiceNumber,
                brutAmount: apt.invoice.brutAmount,
                siiRetention: apt.invoice.siiRetention,
                netAmount: apt.invoice.netAmount
            } : null
        })),
        totalAmount: request.totalAmount,
        estimatedReimbursement: request.estimatedReimbursement,
        hasMedicalReferral: request.hasMedicalReferral,
        status: request.status,
        kitPdfUrl: request.kitPdfUrl,
        trackingNumber: request.trackingNumber,
        submittedAt: request.submittedAt,
        createdAt: request.createdAt
    }
}
