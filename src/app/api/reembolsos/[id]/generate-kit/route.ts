/**
 * API: Generar kit de reembolso en PDF
 * POST /api/reembolsos/[id]/generate-kit
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function POST(
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

        // Obtener solicitud con datos completos
        const request = await prisma.reimbursementRequest.findUnique({
            where: { id: params.id },
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

        // Generar PDF
        const doc = new jsPDF()

        // Página 1: Portada
        doc.setFontSize(24)
        doc.text('Kit de Reembolso', 105, 40, { align: 'center' })

        doc.setFontSize(12)
        doc.text(`Paciente: ${request.patient.name}`, 20, 60)
        doc.text(`Período: ${getMonthName(request.month)} ${request.year}`, 20, 70)
        doc.text(`Sistema de Salud: ${request.healthSystem}`, 20, 80)
        if (request.isapre) {
            doc.text(`Isapre: ${request.isapre.name}`, 20, 90)
        }
        doc.text(`Total: $${request.totalAmount.toLocaleString('es-CL')}`, 20, 100)
        doc.text(`Reembolso Estimado: $${request.estimatedReimbursement.toLocaleString('es-CL')}`, 20, 110)
        doc.text(`Sesiones: ${request.appointments.length}`, 20, 120)

        // Página 2: Detalle de Sesiones
        doc.addPage()
        doc.setFontSize(16)
        doc.text('Detalle de Sesiones', 20, 20)

        const tableData = request.appointments.map(apt => [
            new Date(apt.scheduledAt).toLocaleDateString('es-CL'),
            apt.professional.user.name || 'N/A',
            apt.invoice?.invoiceNumber || 'N/A',
            `$${(apt.invoice?.brutAmount || 0).toLocaleString('es-CL')}`
        ])

        autoTable(doc, {
            startY: 30,
            head: [['Fecha', 'Profesional', 'Boleta', 'Monto']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        })

        // Página 3: Certificado
        doc.addPage()
        doc.setFontSize(16)
        doc.text('Certificado de Asistencia', 105, 30, { align: 'center' })

        doc.setFontSize(11)
        const certText = `
Por medio del presente certifico que ${request.patient.name} asistió a ${request.appointments.length} 
sesión(es) de psicoterapia durante el período de ${getMonthName(request.month)} ${request.year}.

Las sesiones fueron realizadas por profesionales de la salud mental debidamente certificados 
y se adjuntan las boletas de honorarios electrónicas correspondientes.

Fecha de emisión: ${new Date().toLocaleDateString('es-CL')}
        `.trim()

        const lines = doc.splitTextToSize(certText, 170)
        doc.text(lines, 20, 50)

        // Generar PDF como base64
        const pdfBase64 = doc.output('dataurlstring')

        return NextResponse.json({
            success: true,
            kitUrl: pdfBase64,
            filename: `kit-reembolso-${request.month}-${request.year}.pdf`
        })
    } catch (error) {
        console.error('Error generating reimbursement kit:', error)
        return NextResponse.json(
            { error: 'Error al generar kit de reembolso', details: String(error) },
            { status: 500 }
        )
    }
}

function getMonthName(month: number): string {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1]
}
