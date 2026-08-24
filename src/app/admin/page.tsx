'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Users,
    Stethoscope,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Loader2
} from 'lucide-react'

interface DashboardStats {
    totalUsers: number
    pendingProfessionals: number
    monthlyRevenue: number
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
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
                const response = await fetch('/api/admin/dashboard-stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Resumen de la plataforma</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Usuarios</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats?.totalUsers?.toLocaleString('es-CL') || '0'}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-red-600" />
                        </div>
                        {stats?.pendingProfessionals && stats.pendingProfessionals > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                Pendiente
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                Sin alertas
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Médicos Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats?.pendingProfessionals || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Ingresos del Mes</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats?.monthlyRevenue || 0)}
                    </p>
                </div>
            </div>
        </div>
    )
}
