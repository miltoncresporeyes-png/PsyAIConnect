/**
 * Reimbursement Card - Dashboard Widget
 * 
 * Shows eligible sessions count and estimated reimbursement amount
 */

'use client'

import { useEffect, useState } from 'react'
import { DollarSign, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EligibleSessionsSummary {
    count: number
    totalAmount: number
}

export default function ReimbursementCard() {
    const [summary, setSummary] = useState<EligibleSessionsSummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadEligibleSessions()
    }, [])

    const loadEligibleSessions = async () => {
        try {
            const res = await fetch('/api/reembolsos/eligible-sessions')
            if (res.ok) {
                const data = await res.json()
                setSummary(data.summary)
            }
        } catch {
            console.error('Error loading eligible sessions')
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

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        )
    }

    if (!summary || summary.count === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Documentos para tu reembolso</h3>
                        <p className="text-sm text-gray-500">Aún no tienes sesiones con boleta</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Cuando una sesión se realice y el profesional emita su boleta de honorarios, podrás reunir aquí tus
                    documentos para presentarlos a tu Isapre o seguro.
                </p>
                <p className="mt-2 text-xs text-gray-500">
                    El reembolso lo define tu plan de salud: PsyDoctor no lo gestiona ni lo garantiza.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Documentos para tu reembolso</h3>
                        <p className="text-sm text-green-700">
                            {summary.count} {summary.count === 1 ? 'sesión con boleta disponible' : 'sesiones con boleta disponible'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto total:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(summary.totalAmount)}</span>
                </div>
            </div>

            <div className="bg-white/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Te ayudamos a reunir los documentos de tus sesiones. El monto a reembolsar y su aprobación dependen de tu
                    Isapre o seguro, según las condiciones de tu plan; PsyDoctor no los gestiona ni los garantiza.
                </p>
            </div>

            <Link
                href="/dashboard/reembolsos/nuevo"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
                Preparar mis documentos
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    )
}
