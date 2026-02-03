'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import {
    Loader2, Calendar, Clock, DollarSign, Users,
    Settings, LogOut, ExternalLink, BarChart3, FileText
} from 'lucide-react'

// Componentes del dashboard clínico del paciente
import { MetricsCards } from '@/components/dashboard/patient/MetricsCards'
import { PrimaryAction } from '@/components/dashboard/patient/PrimaryAction'
import { HistorySection } from '@/components/dashboard/patient/HistorySection'
import { EmotionalCheckIn } from '@/components/dashboard/patient/EmotionalCheckIn'
import { BreathingResource } from '@/components/dashboard/patient/BreathingResource'
import { SafetyMicroCopy } from '@/components/dashboard/patient/SafetyMicroCopy'
import FeeCalculator from '@/components/dashboard/FeeCalculator'
import ReimbursementCard from '@/components/dashboard/ReimbursementCard'

interface PatientSummary {
    totalSessions: number
    lastSession?: string
    lastSessionDaysAgo?: string
    nextSession?: string
    professionalName?: string
    professionalType?: string
    hasHistory: boolean
}

interface ProfessionalStats {
    todayAppointments: number
    weekAppointments: number
    totalPatients: number
    monthlyIncome: number
    pendingCount: number
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [patientData, setPatientData] = useState<PatientSummary>({
        totalSessions: 0,
        hasHistory: false
    })

    const [professionalStats, setProfessionalStats] = useState<ProfessionalStats>({
        todayAppointments: 0,
        weekAppointments: 0,
        totalPatients: 0,
        monthlyIncome: 0,
        pendingCount: 0,
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    // Fetch de datos para el profesional
    useEffect(() => {
        if (session?.user?.role === 'PROFESSIONAL') {
            const fetchProfessionalStats = async () => {
                try {
                    const res = await fetch('/api/profesional/stats')
                    if (res.ok) {
                        const data = await res.json()
                        setProfessionalStats({
                            todayAppointments: data.todayAppointments || 0,
                            weekAppointments: data.weekAppointments || 0,
                            totalPatients: data.totalPatients || 0,
                            monthlyIncome: data.monthlyIncome || 0,
                            pendingCount: data.pendingCount || 0,
                        })
                    }
                } catch (error) {
                    console.error("Error fetching professional stats", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchProfessionalStats()
        } else {
            setLoading(false)
        }
    }, [session])

    // Fetch de datos resumen para el paciente
    useEffect(() => {
        if (session?.user?.role === 'PATIENT') {
            const fetchAppointments = async () => {
                try {
                    const res = await fetch('/api/citas')
                    if (res.ok) {
                        const appointments = await res.json()
                        const now = new Date()

                        // Filtrar citas válidas
                        const validAppointments = appointments.filter((a: any) => a.status !== 'CANCELLED')
                        const completedSessions = validAppointments.filter((a: any) =>
                            a.status === 'COMPLETED' || new Date(a.scheduledAt) <= now
                        )

                        // Próxima cita
                        const upcoming = validAppointments
                            .filter((a: any) => new Date(a.scheduledAt) > now)
                            .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

                        // Última cita completada
                        const past = completedSessions
                            .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0]

                        // Calcular días desde última sesión
                        let lastSessionDaysAgo = undefined
                        if (past) {
                            const daysDiff = Math.floor((now.getTime() - new Date(past.scheduledAt).getTime()) / (1000 * 60 * 60 * 24))
                            if (daysDiff === 0) {
                                lastSessionDaysAgo = 'Hoy'
                            } else if (daysDiff === 1) {
                                lastSessionDaysAgo = 'Ayer'
                            } else {
                                lastSessionDaysAgo = `Hace ${daysDiff} días`
                            }
                        }

                        // Profesional actual
                        const currentProf = upcoming?.professional || past?.professional

                        setPatientData({
                            totalSessions: completedSessions.length,
                            lastSession: past ? new Date(past.scheduledAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : undefined,
                            lastSessionDaysAgo,
                            nextSession: upcoming ? new Date(upcoming.scheduledAt).toLocaleDateString('es-CL', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : undefined,
                            professionalName: currentProf?.user?.name,
                            professionalType: currentProf ? 'Psicólogo/a' : undefined,
                            hasHistory: completedSessions.length > 0
                        })
                    }
                } catch (error) {
                    console.error("Error fetching patient summary", error)
                }
            }
            fetchAppointments()
        }
    }, [session])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (!session) return null

    const isProfessional = session.user.role === 'PROFESSIONAL'
    const userName = session.user.name?.split(' ')[0] || 'Usuario'

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <>
            <Header />

            <div className="min-h-screen bg-[#F8F9FA] py-8">
                <div className="container-wide max-w-5xl mx-auto px-4">

                    {/* =========================================================
                        VISTA PROFESIONAL
                       ========================================================= */}
                    {isProfessional && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                                    Hola, {userName} 👋
                                </h1>
                                <p className="text-gray-600">Gestiona tu práctica profesional</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <StatCard
                                    icon={Calendar}
                                    label="Citas hoy"
                                    value={loading ? '-' : professionalStats.todayAppointments.toString()}
                                    color="primary"
                                />
                                <StatCard
                                    icon={Clock}
                                    label="Esta semana"
                                    value={loading ? '-' : professionalStats.weekAppointments.toString()}
                                    color="secondary"
                                />
                                <StatCard
                                    icon={Users}
                                    label="Pacientes"
                                    value={loading ? '-' : professionalStats.totalPatients.toString()}
                                    color="accent"
                                />
                                <StatCard
                                    icon={DollarSign}
                                    label="Ingresos mes"
                                    value={loading ? '-' : formatCurrency(professionalStats.monthlyIncome)}
                                    color="green"
                                />
                            </div>

                            {/* Pending notification */}
                            {professionalStats.pendingCount > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-yellow-800">
                                                {professionalStats.pendingCount} cita{professionalStats.pendingCount > 1 ? 's' : ''} pendiente{professionalStats.pendingCount > 1 ? 's' : ''} de confirmación
                                            </p>
                                            <Link href="/dashboard/citas" className="text-sm text-yellow-700 underline hover:no-underline">
                                                Ver y confirmar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fee Calculator */}
                            <div className="mb-8">
                                <FeeCalculator />
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DashboardCard icon={Calendar} title="Mis citas" description="Revisa y gestiona tus próximas citas" href="/dashboard/citas" />
                                <DashboardCard icon={Users} title="Mis pacientes" description="Ver historial y notas de pacientes" href="/dashboard/pacientes" />
                                <DashboardCard icon={Clock} title="Disponibilidad" description="Configura tu horario de atención" href="/dashboard/disponibilidad" />
                                <DashboardCard icon={BarChart3} title="Estadísticas" description="Revisa tus métricas e ingresos" href="/dashboard/estadisticas" />
                                <DashboardCard icon={FileText} title="Reportes" description="Reportes mensuales financieros" href="/dashboard/reportes" />
                                <DashboardCard icon={Settings} title="Mi perfil" description="Edita tu información profesional" href="/profesional/completar-perfil" />
                                <DashboardCard icon={ExternalLink} title="Ver mi página" description="Mira cómo te ven los pacientes" href="/profesional/ps-demo-profesional" target="_blank" />
                            </div>
                        </>
                    )}

                    {/* =========================================================
                        VISTA PACIENTE (Dashboard Clínico)
                       ========================================================= */}
                    {!isProfessional && (
                        <>
                            {/* Encabezado */}
                            <div className="mb-6">
                                <h1 className="text-xl font-heading font-semibold text-gray-900 mb-1">
                                    Tu panel de salud mental
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Bienvenido/a, {userName}
                                </p>
                            </div>

                            {/* ZONA 1: Métricas operativas */}
                            <MetricsCards
                                totalSessions={patientData.totalSessions}
                                lastSessionDate={patientData.lastSessionDaysAgo}
                                nextSessionDate={patientData.nextSession}
                                professionalName={patientData.professionalName}
                                professionalType={patientData.professionalType}
                            />

                            {/* ZONA 2: Acción principal */}
                            <PrimaryAction
                                hasProfessional={!!patientData.professionalName}
                                professionalName={patientData.professionalName}
                            />

                            {/* ZONA 3, 4, 5: Layout de dos columnas */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* Columna Principal */}
                                <div className="lg:col-span-7 space-y-6">
                                    {/* ZONA 3: Historial */}
                                    <HistorySection hasHistory={patientData.hasHistory} />
                                </div>

                                {/* Columna Lateral */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* ZONA 4: Check-in emocional (reducido) */}
                                    <EmotionalCheckIn />

                                    {/* Reembolsos */}
                                    <ReimbursementCard />

                                    {/* ZONA 5: Recursos (terciario) */}
                                    <BreathingResource />

                                    {/* Privacidad */}
                                    <SafetyMicroCopy />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Sign Out (Común) */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}

// Componentes Auxiliares para Profesional
function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colorClasses: any = {
        primary: 'bg-primary-50 text-primary-600',
        secondary: 'bg-secondary-100 text-secondary-700',
        accent: 'bg-accent-50 text-accent-600',
        green: 'bg-green-50 text-green-600',
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

function DashboardCard({ icon: Icon, title, description, href, target }: { icon: any, title: string, description: string, href: string, target?: string }) {
    return (
        <Link href={href} target={target} className="card p-6 hover:border-primary-300 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <Icon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </Link>
    )
}
