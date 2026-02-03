/**
 * Reimbursement Tracker
 * 
 * Dashboard to view and track all reimbursement requests
 */

'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ReimbursementRequest {
    id: string
    period: {
        monthName: string
    }
    healthSystem: string
    isapreName?: string
    totalAmount: number
    estimatedReimbursement: number
    reimbursedAmount?: number
    sessionsCount: number
    status: string
    kitPdfUrl?: string
    trackingNumber?: string
    submittedAt?: string
    createdAt: string
}

export default function ReimbursementTracker() {
    const [requests, setRequests] = useState<ReimbursementRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        loadRequests()
    }, [filter])

    const loadRequests = async () => {
        try {
            const url = filter === 'all'
                ? '/api/reembolsos'
                : `/api/reembolsos?status=${filter}`

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (error) {
            console.error('Error loading requests:', error)
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

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string; icon: any }> = {
            DRAFT: { label: 'Borrador', className: 'bg-gray-100 text-gray-700', icon: FileText },
            PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
            IN_REVIEW: { label: 'En Revisión', className: 'bg-blue-100 text-blue-700', icon: AlertCircle },
            APPROVED: { label: 'Aprobado', className: 'bg-green-100 text-green-700', icon: CheckCircle },
            REJECTED: { label: 'Rechazado', className: 'bg-red-100 text-red-700', icon: XCircle },
            PAID: { label: 'Pagado', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            CANCELLED: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600', icon: XCircle },
        }

        const badge = badges[status] || badges.DRAFT
        const Icon = badge.icon

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📊 Mis Solicitudes de Reembolso</h1>
                    <p className="text-gray-600 mt-1">Gestiona y da seguimiento a tus solicitudes</p>
                </div>
                <Link
                    href="/dashboard/reembolsos/nuevo"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    Nueva Solicitud
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex gap-2 overflow-x-auto">
                    {[
                        { value: 'all', label: 'Todas' },
                        { value: 'DRAFT', label: 'Borradores' },
                        { value: 'PENDING', label: 'Pendientes' },
                        { value: 'APPROVED', label: 'Aprobadas' },
                        { value: 'PAID', label: 'Pagadas' },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === value
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? 'Aún no has creado ninguna solicitud de reembolso.'
                            : `No hay solicitudes con estado "${filter}".`
                        }
                    </p>
                    <Link
                        href="/dashboard/reembolsos/nuevo"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Crear Primera Solicitud
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(request => (
                        <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {request.period.monthName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {request.isapreName || request.healthSystem} • {request.sessionsCount} {request.sessionsCount === 1 ? 'sesión' : 'sesiones'}
                                    </p>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Monto Total</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(request.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Estimado</p>
                                    <p className="font-semibold text-green-600">{formatCurrency(request.estimatedReimbursement)}</p>
                                </div>
                                {request.reimbursedAmount && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Reembolsado</p>
                                        <p className="font-semibold text-emerald-600">{formatCurrency(request.reimbursedAmount)}</p>
                                    </div>
                                )}
                                {request.trackingNumber && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">N° Seguimiento</p>
                                        <p className="font-mono text-sm text-gray-900">{request.trackingNumber}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/reembolsos/${request.id}`}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver Detalles
                                </Link>
                                {request.kitPdfUrl && (
                                    <a
                                        href={request.kitPdfUrl}
                                        download
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar Kit
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
