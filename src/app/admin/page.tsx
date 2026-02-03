'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import {
    Loader2, Users, Calendar, DollarSign,
    TrendingUp, UserCheck, Clock, AlertTriangle
} from 'lucide-react'

interface AdminStats {
    totalUsers: number
    totalProfessionals: number
    pendingVerification: number
    totalAppointments: number
    completedAppointments: number
    totalRevenue: number
    totalCommission: number
    waitlistCount: number
}

interface RecentActivity {
    type: 'user' | 'professional' | 'appointment' | 'payment'
    message: string
    timestamp: string
}

export default function AdminPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [stats, setStats] = useState<AdminStats | null>(null)
    const [activity, setActivity] = useState<RecentActivity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            if (session?.user?.role !== 'ADMIN') {
                router.push('/dashboard')
            } else {
                fetchAdminData()
            }
        }
    }, [status, session, router])

    const fetchAdminData = async () => {
        try {
            const response = await fetch('/api/admin/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data.stats)
                setActivity(data.activity)
            }
        } catch (err) {
            console.error('Error fetching admin data:', err)
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

    if (session?.user?.role !== 'ADMIN') {
        return null
    }

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide">
                    <div className="mb-8">
                        <h1 className="text-2xl font-heading font-bold text-gray-900">
                            Panel de Administración
                        </h1>
                        <p className="text-gray-600">
                            Métricas y gestión de PsyConnect
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={Users}
                            label="Usuarios totales"
                            value={stats?.totalUsers || 0}
                            color="primary"
                        />
                        <StatCard
                            icon={UserCheck}
                            label="Profesionales"
                            value={stats?.totalProfessionals || 0}
                            color="secondary"
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Pendientes verificación"
                            value={stats?.pendingVerification || 0}
                            color="yellow"
                        />
                        <StatCard
                            icon={Calendar}
                            label="Citas totales"
                            value={stats?.totalAppointments || 0}
                            color="blue"
                        />
                    </div>

                    {/* Revenue Stats */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-gray-600">Ingresos totales</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatPrice(stats?.totalRevenue || 0)}
                            </p>
                        </div>
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-gray-600">Comisiones</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatPrice(stats?.totalCommission || 0)}
                            </p>
                        </div>
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="text-gray-600">En waitlist</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats?.waitlistCount || 0}
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Pending Verifications */}
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Acciones rápidas
                            </h2>
                            <div className="space-y-3">
                                <a
                                    href="/admin/profesionales"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-medium">Gestionar profesionales</span>
                                    <span className="text-sm text-gray-500">{stats?.totalProfessionals || 0}</span>
                                </a>
                                <a
                                    href="/admin/verificaciones"
                                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                    <span className="font-medium">Verificaciones pendientes</span>
                                    <span className="badge bg-yellow-200 text-yellow-700">
                                        {stats?.pendingVerification || 0}
                                    </span>
                                </a>
                                <a
                                    href="/admin/waitlist"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-medium">Ver waitlist</span>
                                    <span className="text-sm text-gray-500">{stats?.waitlistCount || 0}</span>
                                </a>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Actividad reciente
                            </h2>
                            {activity.length === 0 ? (
                                <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                            ) : (
                                <div className="space-y-3">
                                    {activity.slice(0, 5).map((item, index) => (
                                        <div key={index} className="flex items-start gap-3 text-sm">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'payment' ? 'bg-green-500' :
                                                    item.type === 'appointment' ? 'bg-blue-500' :
                                                        item.type === 'professional' ? 'bg-purple-500' :
                                                            'bg-gray-500'
                                                }`} />
                                            <div>
                                                <p className="text-gray-700">{item.message}</p>
                                                <p className="text-gray-400 text-xs">{item.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
    value: number
    color: 'primary' | 'secondary' | 'blue' | 'green' | 'yellow' | 'purple'
}) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        secondary: 'bg-secondary-50 text-secondary-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
    }

    return (
        <div className="card p-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                </div>
            </div>
        </div>
    )
}
