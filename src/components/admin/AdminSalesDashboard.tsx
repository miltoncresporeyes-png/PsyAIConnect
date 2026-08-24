'use client'

import { useState, useEffect } from 'react'
import { 
    Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle, 
    Clock, DollarSign, TrendingUp, Filter, Download
} from 'lucide-react'

interface SaleItem {
    id: string
    date: string
    professionalName: string
    patientName: string
    amount: number
    discount: number
    total: number
    status: string
    invoiceNumber: string | null
    siiFolio: string | null
    errorMessage: string | null
    attempts: number
    maxAttempts: number
}

interface Totals {
    total: number
    completed: number
    pending: number
    failed: number
    processing: number
    totalAmount: number
    completedAmount: number
}

export default function AdminSalesDashboard() {
    const [sales, setSales] = useState<SaleItem[]>([])
    const [totals, setTotals] = useState<Totals | null>(null)
    const [loading, setLoading] = useState(true)
    const [retryingId, setRetryingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<string>('all')

    const fetchSales = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter !== 'all') {
                params.set('status', filter)
            }

            const response = await fetch(`/api/admin/sales?${params}`)
            const data = await response.json()

            if (response.ok) {
                setSales(data.sales)
                setTotals(data.totals)
            }
        } catch (error) {
            console.error('Error fetching sales:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSales()
    }, [filter])

    const handleRetry = async (invoiceId: string) => {
        setRetryingId(invoiceId)
        try {
            const response = await fetch('/api/admin/sales/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceQueueId: invoiceId }),
            })

            if (response.ok) {
                await fetchSales()
            }
        } catch (error) {
            console.error('Error retrying invoice:', error)
        } finally {
            setRetryingId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3" />
                        Emitida
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock className="w-3 h-3" />
                        Pendiente
                    </span>
                )
            case 'PROCESSING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Procesando
                    </span>
                )
            case 'FAILED':
            case 'MANUAL_REVIEW':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        Error
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {status}
                    </span>
                )
        }
    }

    const formatDate = (dateStr: string | Date) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading && !sales.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Consolidado de Ventas</h2>
                    <p className="text-gray-500">Panel de control de facturación</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Todos</option>
                        <option value="completed">Emitidas</option>
                        <option value="pending">Pendientes</option>
                        <option value="failed">Con Error</option>
                    </select>
                    <button
                        onClick={fetchSales}
                        disabled={loading}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {totals && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Transacciones</p>
                                <p className="text-xl font-bold">{totals.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Emitidas</p>
                                <p className="text-xl font-bold">{totals.completed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Con Error</p>
                                <p className="text-xl font-bold">{totals.failed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Emitido</p>
                                <p className="text-xl font-bold">{formatCurrency(totals.completedAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesional</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Folio SII</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">
                                    {formatDate(sale.date)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">
                                    {sale.professionalName}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {sale.patientName}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium">
                                    {formatCurrency(sale.total)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {getStatusBadge(sale.status)}
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-mono">
                                    {sale.siiFolio || sale.invoiceNumber || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {(sale.status === 'FAILED' || sale.status === 'MANUAL_REVIEW') && (
                                        <button
                                            onClick={() => handleRetry(sale.id)}
                                            disabled={retryingId === sale.id}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                        >
                                            {retryingId === sale.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-3 h-3" />
                                            )}
                                            Reintentar
                                        </button>
                                    )}
                                    {sale.status === 'COMPLETED' && (
                                        <button className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                            <Download className="w-3 h-3" />
                                            Descargar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sales.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        No hay transacciones para mostrar
                    </div>
                )}
            </div>
        </div>
    )
}
