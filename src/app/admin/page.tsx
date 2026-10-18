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
import { PageContainer, PageHeader, KPIGrid } from '@/components/layout/shell'

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
        <PageContainer size="full" padding="md">
            <PageHeader
                title="Dashboard"
                description="Resumen de la plataforma"
            />

            <KPIGrid count={3}>
                <AdminStatCard
                    icon={Users}
                    label="Total Usuarios"
                    value={stats?.totalUsers?.toLocaleString('es-CL') || '0'}
                    iconColor="blue"
                    trend={<TrendingUp className="w-5 h-5 text-green-500" />}
                />
                <AdminStatCard
                    icon={Stethoscope}
                    label="Médicos Pendientes"
                    value={stats?.pendingProfessionals || 0}
                    iconColor="red"
                    alert={Boolean(stats?.pendingProfessionals && stats.pendingProfessionals > 0)}
                />
                <AdminStatCard
                    icon={DollarSign}
                    label="Ingresos del Mes"
                    value={formatCurrency(stats?.monthlyRevenue || 0)}
                    iconColor="green"
                    trend={<TrendingUp className="w-5 h-5 text-green-500" />}
                />
            </KPIGrid>
        </PageContainer>
    )
}

function AdminStatCard({
    icon: Icon,
    label,
    value,
    iconColor,
    trend,
    alert
}: {
    icon: any
    label: string
    value: string | number
    iconColor: 'blue' | 'red' | 'green' | 'purple' | 'amber'
    trend?: React.ReactNode
    alert?: boolean
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[iconColor]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && <div className="flex-shrink-0">{trend}</div>}
            </div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {alert && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Pendiente
                </span>
            )}
        </div>
    )
}