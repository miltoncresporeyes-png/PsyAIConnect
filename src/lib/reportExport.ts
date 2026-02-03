/**
 * Report Export Utilities
 * 
 * Functions to export monthly reports to PDF and CSV formats
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface MonthlyReportData {
    professionalName: string
    period: {
        monthName: string
    }
    financialSummary: {
        totalSessions: number
        totalBrut: number
        totalSiiRetention: number
        totalCommission: number
        totalNet: number
    }
    healthSystemBreakdown: {
        isapres: { count: number; brutAmount: number; netAmount: number; percentage: number }
        fonasa: { count: number; brutAmount: number; netAmount: number; percentage: number }
        private: { count: number; brutAmount: number; netAmount: number; percentage: number }
    }
    invoices: Array<{
        invoiceNumber: string
        date: Date
        patientName: string
        healthSystem: string
        netAmount: number
        status: string
    }>
    metrics: {
        attendance: { completed: number; cancelled: number; rate: number }
        productivity: { totalHours: number; avgIncomePerHour: number }
    }
}

/**
 * Export report to PDF
 */
export function exportToPDF(report: MonthlyReportData) {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229) // Indigo
    doc.text('PsyConnect', 14, 20)

    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Reporte de Gestión Mensual', 14, 30)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Profesional: ${report.professionalName}`, 14, 38)
    doc.text(`Período: ${report.period.monthName}`, 14, 44)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, 14, 50)

    // Line separator
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 55, 196, 55)

    let yPos = 65

    // 1. Financial Summary
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('📊 Resumen Financiero', 14, yPos)
    yPos += 10

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Monto']],
        body: [
            ['Total Sesiones', report.financialSummary.totalSessions.toString()],
            ['Monto Bruto', formatCurrency(report.financialSummary.totalBrut)],
            ['Retención SII (15.25%)', formatCurrency(-report.financialSummary.totalSiiRetention)],
            ['Comisión Plataforma', formatCurrency(-report.financialSummary.totalCommission)],
            ['Monto Líquido', formatCurrency(report.financialSummary.totalNet)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // 2. Health System Breakdown
    doc.setFontSize(14)
    doc.text('🏥 Desglose por Previsión', 14, yPos)
    yPos += 10

    autoTable(doc, {
        startY: yPos,
        head: [['Sistema', 'Sesiones', 'Bruto', 'Líquido', '%']],
        body: [
            [
                'Isapres',
                report.healthSystemBreakdown.isapres.count.toString(),
                formatCurrency(report.healthSystemBreakdown.isapres.brutAmount),
                formatCurrency(report.healthSystemBreakdown.isapres.netAmount),
                report.healthSystemBreakdown.isapres.percentage.toFixed(1) + '%',
            ],
            [
                'Fonasa',
                report.healthSystemBreakdown.fonasa.count.toString(),
                formatCurrency(report.healthSystemBreakdown.fonasa.brutAmount),
                formatCurrency(report.healthSystemBreakdown.fonasa.netAmount),
                report.healthSystemBreakdown.fonasa.percentage.toFixed(1) + '%',
            ],
            [
                'Particular',
                report.healthSystemBreakdown.private.count.toString(),
                formatCurrency(report.healthSystemBreakdown.private.brutAmount),
                formatCurrency(report.healthSystemBreakdown.private.netAmount),
                report.healthSystemBreakdown.private.percentage.toFixed(1) + '%',
            ],
            [
                'TOTAL',
                report.financialSummary.totalSessions.toString(),
                formatCurrency(report.financialSummary.totalBrut),
                formatCurrency(report.financialSummary.totalNet),
                '100%',
            ],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
        foot: [['TOTAL', report.financialSummary.totalSessions.toString(), formatCurrency(report.financialSummary.totalBrut), formatCurrency(report.financialSummary.totalNet), '100%']],
        footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // 3. Metrics
    doc.setFontSize(14)
    doc.text('📈 Métricas de Gestión', 14, yPos)
    yPos += 10

    autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: [
            ['Sesiones Asistidas', report.metrics.attendance.completed.toString()],
            ['Sesiones Canceladas', report.metrics.attendance.cancelled.toString()],
            ['Tasa de Asistencia', report.metrics.attendance.rate.toFixed(1) + '%'],
            ['Total Horas Trabajadas', report.metrics.productivity.totalHours.toFixed(1) + ' hrs'],
            ['Ingreso Promedio por Hora', formatCurrency(report.metrics.productivity.avgIncomePerHour)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
    })

    // New page for invoices
    doc.addPage()
    yPos = 20

    // 4. Invoices
    doc.setFontSize(14)
    doc.text(`📄 Estado de Boletas (${report.invoices.length})`, 14, yPos)
    yPos += 10

    const invoiceRows = report.invoices.slice(0, 30).map(inv => [
        inv.invoiceNumber,
        new Date(inv.date).toLocaleDateString('es-CL'),
        inv.patientName,
        inv.healthSystem,
        formatCurrency(inv.netAmount),
        inv.status,
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['N° Boleta', 'Fecha', 'Paciente', 'Previsión', 'Líquido', 'Estado']],
        body: invoiceRows,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
    })

    // Footer
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
            'Generado por PsyConnect',
            14,
            doc.internal.pageSize.height - 10
        )
    }

    // Download with clean filename
    const cleanPeriod = report.period.monthName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
    const filename = `Reporte-Mensual-${cleanPeriod}.pdf`
    doc.save(filename)
}

/**
 * Export report to CSV
 */
export function exportToCSV(report: MonthlyReportData) {
    let csv = ''

    // Header
    csv += `REPORTE DE GESTIÓN MENSUAL\n`
    csv += `Profesional,${report.professionalName}\n`
    csv += `Período,${report.period.monthName}\n`
    csv += `Generado,${new Date().toLocaleDateString('es-CL')}\n`
    csv += `\n`

    // Financial Summary
    csv += `RESUMEN FINANCIERO\n`
    csv += `Concepto,Monto\n`
    csv += `Total Sesiones,${report.financialSummary.totalSessions}\n`
    csv += `Bruto Acumulado,${report.financialSummary.totalBrut}\n`
    csv += `Retención SII (15.25%),-${report.financialSummary.totalSiiRetention}\n`
    csv += `Comisión Plataforma,-${report.financialSummary.totalCommission}\n`
    csv += `Líquido Final,${report.financialSummary.totalNet}\n`
    csv += `\n`

    // Health System Breakdown
    csv += `DESGLOSE POR PREVISIÓN\n`
    csv += `Sistema,Sesiones,Bruto,Líquido,Porcentaje\n`
    csv += `Isapres,${report.healthSystemBreakdown.isapres.count},${report.healthSystemBreakdown.isapres.brutAmount},${report.healthSystemBreakdown.isapres.netAmount},${report.healthSystemBreakdown.isapres.percentage.toFixed(1)}%\n`
    csv += `Fonasa,${report.healthSystemBreakdown.fonasa.count},${report.healthSystemBreakdown.fonasa.brutAmount},${report.healthSystemBreakdown.fonasa.netAmount},${report.healthSystemBreakdown.fonasa.percentage.toFixed(1)}%\n`
    csv += `Particular,${report.healthSystemBreakdown.private.count},${report.healthSystemBreakdown.private.brutAmount},${report.healthSystemBreakdown.private.netAmount},${report.healthSystemBreakdown.private.percentage.toFixed(1)}%\n`
    csv += `TOTAL,${report.financialSummary.totalSessions},${report.financialSummary.totalBrut},${report.financialSummary.totalNet},100%\n`
    csv += `\n`

    // Metrics
    csv += `MÉTRICAS DE GESTIÓN\n`
    csv += `Métrica,Valor\n`
    csv += `Sesiones Asistidas,${report.metrics.attendance.completed}\n`
    csv += `Sesiones Canceladas,${report.metrics.attendance.cancelled}\n`
    csv += `Tasa de Asistencia,${report.metrics.attendance.rate.toFixed(1)}%\n`
    csv += `Total Horas,${report.metrics.productivity.totalHours.toFixed(1)}\n`
    csv += `Ingreso por Hora,${report.metrics.productivity.avgIncomePerHour}\n`
    csv += `\n`

    // Invoices
    csv += `BOLETAS DE HONORARIOS\n`
    csv += `Número,Fecha,Paciente,Previsión,Líquido,Estado\n`
    report.invoices.forEach(inv => {
        csv += `${inv.invoiceNumber},${new Date(inv.date).toLocaleDateString('es-CL')},${inv.patientName},${inv.healthSystem},${inv.netAmount},${inv.status}\n`
    })

    // Download with clean filename
    const cleanPeriod = report.period.monthName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
    const filename = `Reporte-Mensual-${cleanPeriod}.csv`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
