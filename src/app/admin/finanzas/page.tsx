'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface FinanceStats {
    totalRevenue: number
    monthlyRevenue: number
    totalAppointments: number
    monthlyAppointments: number
    averageTicket: number
    revenueByMonth: { month: string; revenue: number }[]
}

export default function FinanzasPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<FinanceStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/403')
        }
    }, [status, session, router])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/finance-stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching finance stats:', error)
            } finally {
                setIsLoading(false)
            }
        }
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchStats()
        }
    }, [status, session])

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        return null
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
                <p className="text-gray-500">Resumen financiero de la plataforma</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-600">Ingresos Totales</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.totalRevenue || 0)}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600">Ingresos del Mes</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.monthlyRevenue || 0)}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-gray-600">Ticket Promedio</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.averageTicket || 0)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Mes</h2>
                <div className="space-y-3">
                    {stats?.revenueByMonth?.map((item) => (
                        <div key={item.month} className="flex items-center justify-between">
                            <span className="text-gray-600">{item.month}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-48 bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(100, (item.revenue / (stats?.monthlyRevenue || 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                                <span className="font-medium text-gray-900 w-24 text-right">
                                    {formatCurrency(item.revenue)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
