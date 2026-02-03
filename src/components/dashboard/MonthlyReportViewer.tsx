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
        } catch (err) {
            console.error('Error loading report:', err)
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
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    📊 Reportes Mensuales
                </h1>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {[2024, 2025, 2026, 2027].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Generando...' : 'Generar Reporte'}
                        </button>
                    </div>

                    {report && (
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={() => exportToPDF(report)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Exportar a PDF"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                            <button
                                onClick={() => exportToCSV(report)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando reporte...</p>
                </div>
            )}

            {/* Report content */}
            {report && !loading && (
                <div className="space-y-6">
                    {/* Resumen Financiero */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
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
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6">🏥 Desglose por Previsión</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Sistema</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Sesiones</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Bruto</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Líquido</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">Isapres</td>
                                        <td className="text-right py-3 px-4">{report.healthSystemBreakdown.isapres.count}</td>
                                        <td className="text-right py-3 px-4">{formatCurrency(report.healthSystemBreakdown.isapres.brutAmount)}</td>
                                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                                            {formatCurrency(report.healthSystemBreakdown.isapres.netAmount)}
                                        </td>
                                        <td className="text-right py-3 px-4">{report.healthSystemBreakdown.isapres.percentage.toFixed(1)}%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">Fonasa</td>
                                        <td className="text-right py-3 px-4">{report.healthSystemBreakdown.fonasa.count}</td>
                                        <td className="text-right py-3 px-4">{formatCurrency(report.healthSystemBreakdown.fonasa.brutAmount)}</td>
                                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                                            {formatCurrency(report.healthSystemBreakdown.fonasa.netAmount)}
                                        </td>
                                        <td className="text-right py-3 px-4">{report.healthSystemBreakdown.fonasa.percentage.toFixed(1)}%</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">Particular</td>
                                        <td className="text-right py-3 px-4">{report.healthSystemBreakdown.private.count}</td>
                                        <td className="text-right py-3 px-4">{formatCurrency(report.healthSystemBreakdown.private.brutAmount)}</td>
                                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                                            {formatCurrency(report.healthSystemBreakdown.private.netAmount)}
                                        </td>
                                        <td className="text-right py-3 px-4">{report.healthSystemBreakdown.private.percentage.toFixed(1)}%</td>
                                    </tr>
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="py-3 px-4">TOTAL</td>
                                        <td className="text-right py-3 px-4">{report.financialSummary.totalSessions}</td>
                                        <td className="text-right py-3 px-4">{formatCurrency(report.financialSummary.totalBrut)}</td>
                                        <td className="text-right py-3 px-4 text-green-600">
                                            {formatCurrency(report.financialSummary.totalNet)}
                                        </td>
                                        <td className="text-right py-3 px-4">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Métricas de Gestión */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
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
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6">📄 Estado de Boletas ({report.invoices.length})</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">N° Boleta</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Paciente</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Previsión</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Líquido</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.invoices.slice(0, 10).map((invoice) => (
                                        <tr key={invoice.invoiceNumber} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                                            <td className="py-3 px-4 text-sm">{formatDate(invoice.date)}</td>
                                            <td className="py-3 px-4">{invoice.patientName}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                    {invoice.healthSystem}
                                                </span>
                                            </td>
                                            <td className="text-right py-3 px-4 font-semibold text-green-600">
                                                {formatCurrency(invoice.netAmount)}
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {report.invoices.length > 10 && (
                                <div className="text-center py-4 text-sm text-gray-500">
                                    Mostrando 10 de {report.invoices.length} boletas
                                </div>
                            )}
                        </div>
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
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    )
}
