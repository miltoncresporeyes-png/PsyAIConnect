'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { PageContainer, PageHeader, KPIGrid, Grid } from '@/components/layout/shell'

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
        <PageContainer size="full" padding="md">
            <PageHeader
                title="Finanzas"
                description="Resumen financiero de la plataforma"
            />

            <KPIGrid count={3}>
                <FinanceStatCard
                    icon={DollarSign}
                    label="Ingresos Totales"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    iconColor="green"
                />
                <FinanceStatCard
                    icon={TrendingUp}
                    label="Ingresos del Mes"
                    value={formatCurrency(stats?.monthlyRevenue || 0)}
                    iconColor="blue"
                />
                <FinanceStatCard
                    icon={Calendar}
                    label="Ticket Promedio"
                    value={formatCurrency(stats?.averageTicket || 0)}
                    iconColor="purple"
                />
            </KPIGrid>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Mes</h2>
                <div className="space-y-3">
                    {stats?.revenueByMonth?.map((item) => (
                        <div key={item.month} className="flex items-center justify-between gap-4 flex-wrap">
                            <span className="text-gray-600 shrink-0">{item.month}</span>
                            <div className="flex-1 min-w-[200px] flex items-center gap-3">
                                <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(100, (item.revenue / (stats?.monthlyRevenue || 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                                <span className="font-medium text-gray-900 w-24 text-right shrink-0">
                                    {formatCurrency(item.revenue)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageContainer>
    )
}

function FinanceStatCard({
    icon: Icon,
    label,
    value,
    iconColor
}: {
    icon: any
    label: string
    value: string
    iconColor: 'blue' | 'red' | 'green' | 'purple' | 'amber'
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
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[iconColor]} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-gray-600 truncate">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        </div>
    )
}