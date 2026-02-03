'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import {
    Loader2, TrendingUp, Calendar, DollarSign,
    Users, Star, Clock, ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { BackToDashboard } from '@/components/ui/BackToDashboard'

interface Stats {
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    totalRevenue: number
    averageRating: number
    uniquePatients: number
    thisMonthAppointments: number
    lastMonthAppointments: number
}

export default function EstadisticasPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchStats()
        }
    }, [status, router])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/profesional/estadisticas')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Error fetching stats:', err)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    const appointmentChange = stats
        ? ((stats.thisMonthAppointments - stats.lastMonthAppointments) / (stats.lastMonthAppointments || 1)) * 100
        : 0

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide">
                    <div className="max-w-5xl mx-auto">
                        {/* Back to Dashboard */}
                        <BackToDashboard />
                        <div className="mb-8">
                            <h1 className="text-2xl font-heading font-bold text-gray-900">
                                Estadísticas
                            </h1>
                            <p className="text-gray-600">
                                Resumen de tu actividad profesional
                            </p>
                        </div>

                        {/* Main Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                icon={Calendar}
                                label="Citas totales"
                                value={stats?.totalAppointments || 0}
                                color="primary"
                            />
                            <StatCard
                                icon={Users}
                                label="Pacientes únicos"
                                value={stats?.uniquePatients || 0}
                                color="secondary"
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Ingresos totales"
                                value={formatPrice(stats?.totalRevenue || 0)}
                                color="green"
                            />
                            <StatCard
                                icon={Star}
                                label="Valoración"
                                value={stats?.averageRating ? `${stats.averageRating.toFixed(1)}★` : 'N/A'}
                                color="yellow"
                            />
                        </div>

                        {/* Comparison */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="card p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Este mes vs. anterior</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats?.thisMonthAppointments || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Citas este mes</p>
                                    </div>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${appointmentChange >= 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {appointmentChange >= 0 ? (
                                            <ArrowUp className="w-4 h-4" />
                                        ) : (
                                            <ArrowDown className="w-4 h-4" />
                                        )}
                                        {Math.abs(appointmentChange).toFixed(0)}%
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Tasa de completado</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats?.totalAppointments
                                                ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(0)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {stats?.completedAppointments || 0} de {stats?.totalAppointments || 0} citas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Empty state */}
                        {(!stats || stats.totalAppointments === 0) && (
                            <div className="card p-12 text-center">
                                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Sin datos aún
                                </h3>
                                <p className="text-gray-600">
                                    Las estadísticas aparecerán cuando completes tus primeras citas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}

function StatCard({
    icon: Icon,
    label,
    value,
    color
}: {
    icon: React.ElementType
    label: string
    value: string | number
    color: 'primary' | 'secondary' | 'green' | 'yellow'
}) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        secondary: 'bg-secondary-50 text-secondary-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    }

    return (
        <div className="card p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]} mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    )
}
