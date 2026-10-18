/**
 * Monthly Report Viewer Component
 * 
 * Displays consolidated monthly financial reports for professionals
 * with export capabilities (PDF/CSV)
 */

'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react'
import { exportToPDF, exportToCSV } from '@/lib/reportExport'
import { TableContainer, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, TableEmptyState } from '@/components/layout/shell'

interface MonthlyReportData {
    professionalId: string
    professionalName: string
    period: {
        year: number
        month: number
        monthName: string
    }
    generatedAt: Date

    financialSummary: {
        totalSessions: number
        totalBrut: number
        totalSiiRetention: number
        totalCommission: number
        totalNet: number
        avgSessionPrice: number
        avgNetPerSession: number
    }

    healthSystemBreakdown: {
        isapres: {
            count: number
            brutAmount: number
            netAmount: number
            percentage: number
        }
        fonasa: {
            count: number
            brutAmount: number
            netAmount: number
            percentage: number
        }
        private: {
            count: number
            brutAmount: number
            netAmount: number
            percentage: number
        }
    }

    invoices: Array<{
        invoiceNumber: string
        date: Date
        patientName: string
        healthSystem: string
        brutAmount: number
        siiRetention: number
        netAmount: number
        status: string
    }>

    metrics: {
        attendance: {
            completed: number
            cancelled: number
            rate: number
        }
        productivity: {
            totalHours: number
            avgIncomePerHour: number
        }
    }
}

export default function MonthlyReportViewer() {
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [report, setReport] = useState<MonthlyReportData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadReport = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(
                `/api/profesional/reportes/mensual?year=${selectedYear}&month=${selectedMonth}`
            )

            if (!res.ok) {
                throw new Error('Error al cargar el reporte')
            }

            const data = await res.json()
            setReport(data)
        } catch {
            console.error('Error loading report')
            setError('No se pudo cargar el reporte. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    return (
        <div className="space-y-6">
            {/* Header con selectores */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    📊 Reportes Mensuales
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent input"
                        >
                            {monthNames.map((name, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent input"
                        >
                            {[2024, 2025, 2026, 2027].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-primary"
                        >
                            {loading ? 'Generando...' : 'Generar Reporte'}
                        </button>
                    </div>

                    {report && (
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => exportToPDF(report)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors btn-ghost"
                                title="Exportar a PDF"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                            <button
                                onClick={() => exportToCSV(report)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors btn-ghost"
                                title="Exportar a CSV"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                CSV
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando reporte...</p>
                </div>
            )}

            {/* Report content */}
            {report && !loading && (
                <div className="space-y-6">
                    {/* Resumen Financiero */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            Resumen Financiero - {report.period.monthName}
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatCard
                                label="Total Sesiones"
                                value={report.financialSummary.totalSessions.toString()}
                                icon={Calendar}
                                color="blue"
                            />
                            <StatCard
                                label="Bruto Acumulado"
                                value={formatCurrency(report.financialSummary.totalBrut)}
                                icon={TrendingUp}
                                color="indigo"
                            />
                            <StatCard
                                label="Retención SII"
                                value={formatCurrency(report.financialSummary.totalSiiRetention)}
                                icon={FileText}
                                color="amber"
                            />
                            <StatCard
                                label="Líquido Final"
                                value={formatCurrency(report.financialSummary.totalNet)}
                                icon={DollarSign}
                                color="green"
                            />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Monto Bruto</span>
                                <span className="font-semibold">{formatCurrency(report.financialSummary.totalBrut)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-amber-600">
                                <span>- Retención SII (15.25%)</span>
                                <span className="font-semibold">-{formatCurrency(report.financialSummary.totalSiiRetention)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-indigo-600">
                                <span>- Comisión Plataforma</span>
                                <span className="font-semibold">-{formatCurrency(report.financialSummary.totalCommission)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Monto Líquido</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(report.financialSummary.totalNet)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desglose por Previsión */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">🏥 Desglose por Previsión</h2>

                        <TableContainer>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>Sistema</TableHeaderCell>
                                    <TableHeaderCell align="right">Sesiones</TableHeaderCell>
                                    <TableHeaderCell align="right">Bruto</TableHeaderCell>
                                    <TableHeaderCell align="right">Líquido</TableHeaderCell>
                                    <TableHeaderCell align="right">%</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell font="semibold">Isapres</TableCell>
                                    <TableCell align="right">{report.healthSystemBreakdown.isapres.count}</TableCell>
                                    <TableCell align="right">{formatCurrency(report.healthSystemBreakdown.isapres.brutAmount)}</TableCell>
                                    <TableCell align="right" color="success">{formatCurrency(report.healthSystemBreakdown.isapres.netAmount)}</TableCell>
                                    <TableCell align="right">{report.healthSystemBreakdown.isapres.percentage.toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell font="semibold">Fonasa</TableCell>
                                    <TableCell align="right">{report.healthSystemBreakdown.fonasa.count}</TableCell>
                                    <TableCell align="right">{formatCurrency(report.healthSystemBreakdown.fonasa.brutAmount)}</TableCell>
                                    <TableCell align="right" color="success">{formatCurrency(report.healthSystemBreakdown.fonasa.netAmount)}</TableCell>
                                    <TableCell align="right">{report.healthSystemBreakdown.fonasa.percentage.toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell font="semibold">Particular</TableCell>
                                    <TableCell align="right">{report.healthSystemBreakdown.private.count}</TableCell>
                                    <TableCell align="right">{formatCurrency(report.healthSystemBreakdown.private.brutAmount)}</TableCell>
                                    <TableCell align="right" color="success">{formatCurrency(report.healthSystemBreakdown.private.netAmount)}</TableCell>
                                    <TableCell align="right">{report.healthSystemBreakdown.private.percentage.toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow className="bg-gray-50 font-bold">
                                    <TableCell>TOTAL</TableCell>
                                    <TableCell align="right">{report.financialSummary.totalSessions}</TableCell>
                                    <TableCell align="right">{formatCurrency(report.financialSummary.totalBrut)}</TableCell>
                                    <TableCell align="right" color="success">{formatCurrency(report.financialSummary.totalNet)}</TableCell>
                                    <TableCell align="right">100%</TableCell>
                                </TableRow>
                            </TableBody>
                        </TableContainer>
                    </div>

                    {/* Métricas de Gestión */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">📈 Métricas de Gestión</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Asistencia */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3">Tasa de Asistencia</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Asistidas</span>
                                        <span className="font-semibold text-green-600">{report.metrics.attendance.completed}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${report.metrics.attendance.rate}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Canceladas: {report.metrics.attendance.cancelled}</span>
                                        <span className="font-bold text-green-600">{report.metrics.attendance.rate.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Productividad */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3">Productividad</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total horas trabajadas</span>
                                        <span className="font-semibold">{report.metrics.productivity.totalHours.toFixed(1)} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Ingreso promedio por hora</span>
                                        <span className="font-semibold text-indigo-600">
                                            {formatCurrency(report.metrics.productivity.avgIncomePerHour)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estado de Boletas */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                            <h2 className="text-xl font-bold">📄 Estado de Boletas ({report.invoices.length})</h2>
                            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto">
                                Emisión automática directa al SII: Próximamente
                            </span>
                        </div>

                        <TableContainer>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>N° Boleta</TableHeaderCell>
                                    <TableHeaderCell>Fecha</TableHeaderCell>
                                    <TableHeaderCell>Paciente</TableHeaderCell>
                                    <TableHeaderCell>Previsión</TableHeaderCell>
                                    <TableHeaderCell align="right">Líquido</TableHeaderCell>
                                    <TableHeaderCell align="center">Estado</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.invoices.slice(0, 10).map((invoice) => (
                                    <TableRow key={invoice.invoiceNumber} hover>
                                        <TableCell font="mono" className="text-sm">{invoice.invoiceNumber}</TableCell>
                                        <TableCell className="text-sm">{formatDate(invoice.date)}</TableCell>
                                        <TableCell>{invoice.patientName}</TableCell>
                                        <TableCell>
                                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                {invoice.healthSystem}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right" font="semibold" color="success">
                                            {formatCurrency(invoice.netAmount)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                {invoice.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableContainer>

                        {report.invoices.length > 10 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                                Mostrando 10 de {report.invoices.length} boletas
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper component for stat cards
function StatCard({ label, value, icon: Icon, color }: {
    label: string
    value: string
    icon: any
    color: string
}) {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        amber: 'bg-amber-50 text-amber-600',
        green: 'bg-green-50 text-green-600',
    }

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1 truncate">{value}</p>
            <p className="text-sm text-gray-600 truncate">{label}</p>
        </div>
    )
}