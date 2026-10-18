'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import {
    Loader2, Calendar, Clock, DollarSign, Users,
    Settings, LogOut, ExternalLink, BarChart3, FileText,
    Sparkles, ArrowRight, CheckCircle2, ShieldCheck, HeartPulse,
    HelpCircle, ChevronRight, AlertCircle, Compass, Zap
} from 'lucide-react'

// Componentes del dashboard clínico del paciente
import { MetricsCards } from '@/components/dashboard/patient/MetricsCards'
import { PrimaryAction } from '@/components/dashboard/patient/PrimaryAction'
import { HistorySection } from '@/components/dashboard/patient/HistorySection'
import EmotionalCheckInCard from '@/components/dashboard/EmotionalCheckInCard'
import PatientOnboardingChecklist from '@/components/dashboard/PatientOnboardingChecklist'
import { BreathingResource } from '@/components/dashboard/patient/BreathingResource'
import { SafetyMicroCopy } from '@/components/dashboard/patient/SafetyMicroCopy'
import { DiagnosisSection, PatientDiagnosis } from '@/components/dashboard/patient/DiagnosisSection'
import FeeCalculator from '@/components/dashboard/FeeCalculator'
import ReimbursementCard from '@/components/dashboard/ReimbursementCard'
import { MobileDashboardNav } from '@/components/dashboard/MobileDashboardNav'

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
    isSuspended?: boolean
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [patientData, setPatientData] = useState<PatientSummary>({
        totalSessions: 0,
        hasHistory: false
    })

    const [diagnoses, setDiagnoses] = useState<PatientDiagnosis[]>([])
    const [diagnosesLoading, setDiagnosesLoading] = useState(false)

    const [professionalStats, setProfessionalStats] = useState<ProfessionalStats>({
        todayAppointments: 0,
        weekAppointments: 0,
        totalPatients: 0,
        monthlyIncome: 0,
        pendingCount: 0,
        isSuspended: false,
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
                    const [statsRes, accountRes] = await Promise.all([
                        fetch('/api/profesional/stats'),
                        fetch('/api/usuario/eliminar-cuenta')
                    ])

                    let isSuspended = false
                    if (accountRes.ok) {
                        const accData = await accountRes.json()
                        isSuspended = accData.isSuspended || false
                    }

                    if (statsRes.ok) {
                        const data = await statsRes.json()
                        setProfessionalStats({
                            todayAppointments: data.todayAppointments || 0,
                            weekAppointments: data.weekAppointments || 0,
                            totalPatients: data.totalPatients || 0,
                            monthlyIncome: data.monthlyIncome || 0,
                            pendingCount: data.pendingCount || 0,
                            isSuspended,
                        })
                    }
                } catch {
                    console.error("Error fetching professional stats")
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
                } catch {
                    console.error("Error fetching patient summary")
                }
            }

            const fetchDiagnoses = async () => {
                setDiagnosesLoading(true)
                try {
                    const res = await fetch('/api/patient/diagnoses')
                    if (res.ok) {
                        const data = await res.json()
                        setDiagnoses(data.diagnoses || [])
                    }
                } catch {
                    console.error("Error fetching patient diagnoses")
                } finally {
                    setDiagnosesLoading(false)
                }
            }

            fetchAppointments()
            fetchDiagnoses()
        }
    }, [session])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
        )
    }

    if (!session) return null

    const isProfessional = session.user.role === 'PROFESSIONAL'
    const userName = session.user.name?.split(' ')[0] || 'Usuario'

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

            <div className="min-h-screen bg-slate-50/70 pb-24 md:pb-16 pt-4 sm:pt-6">
                <div className="container-wide max-w-6xl mx-auto px-4 sm:px-6">

                    {/* =========================================================
                        HERO HEADER MÓVIL ENRIQUECIDO
                       ========================================================= */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl mb-6">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                    {session.user.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={userName}
                                            width={60}
                                            height={60}
                                            className="rounded-xl object-cover h-full w-full"
                                        />
                                    ) : (
                                        <span className="text-xl sm:text-2xl font-extrabold text-teal-200">
                                            {userName.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/20 border border-teal-300/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-200">
                                            <Sparkles className="h-3 w-3" />
                                            {isProfessional ? 'Portal Profesional' : 'Espacio de Bienestar'}
                                        </span>
                                        {isProfessional && professionalStats.isSuspended && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                                                Agenda en pausa
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mt-1">
                                        Hola, {userName}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-teal-100/90 truncate">
                                        {isProfessional
                                            ? 'Supervisión clínica, agenda y pacientes en un solo lugar'
                                            : 'Tu espacio para acompañar tu proceso.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <Link
                                    href="/dashboard/cuenta"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2 text-xs font-semibold text-white transition backdrop-blur-xs"
                                >
                                    <Settings className="h-3.5 w-3.5 text-teal-200" />
                                    <span>Mi cuenta</span>
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-teal-200 transition"
                                    title="Cerrar sesión"
                                    aria-label="Cerrar sesión"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* =========================================================
                        VISTA PROFESIONAL
                       ========================================================= */}
                    {isProfessional && (
                        <div className="space-y-6">
                            {/* Alerta de Citas Pendientes */}
                            {professionalStats.pendingCount > 0 && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold text-amber-950">
                                                {professionalStats.pendingCount} cita(s) pendiente(s) de confirmación
                                            </p>
                                            <p className="text-xs text-amber-800">
                                                Revisa las solicitudes para confirmar los horarios con tus pacientes.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard/citas"
                                        className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white px-3 py-2 text-xs font-semibold shadow-xs flex-shrink-0 transition"
                                    >
                                        Confirmar
                                    </Link>
                                </div>
                            )}

                            {/* Alerta de Suspensión Activa */}
                            {professionalStats.isSuspended && (
                                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0" />
                                        <p className="text-xs text-amber-900">
                                            Tu perfil público y agenda están <strong>pausados temporalmente</strong>. No recibirás nuevos pacientes hasta que los reactives.
                                        </p>
                                    </div>
                                    <Link
                                        href="/dashboard/cuenta"
                                        className="rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-3 py-1.5 text-xs font-semibold flex-shrink-0 transition"
                                    >
                                        Reactivar
                                    </Link>
                                </div>
                            )}

                            {/* Métricas Principales (KPIs móviles con tarjetas suaves) */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs hover:border-teal-300 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Citas hoy
                                        </span>
                                        <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        {loading ? '-' : professionalStats.todayAppointments}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">sesiones programadas</p>
                                </div>

                                <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs hover:border-teal-300 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Esta semana
                                        </span>
                                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        {loading ? '-' : professionalStats.weekAppointments}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">atenciones agendadas</p>
                                </div>

                                <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs hover:border-teal-300 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Pacientes
                                        </span>
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                                            <Users className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        {loading ? '-' : professionalStats.totalPatients}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">fichas activas</p>
                                </div>

                                <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs hover:border-teal-300 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Ingresos mes
                                        </span>
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                            <DollarSign className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-slate-900">
                                        {loading ? '-' : formatCurrency(professionalStats.monthlyIncome)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">bruto estimado</p>
                                </div>
                            </div>

                            {/* Accesos Rápidos de Acción Clínica (Grid interactivo optimizado para touch) */}
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 px-1">
                                    Herramientas de consulta
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <Link
                                        href="/dashboard/citas"
                                        className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                                Agenda de Citas
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                Revisa y gestiona próximas sesiones
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/dashboard/pacientes"
                                        className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                                Fichas de Pacientes
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                Historial y notas clínicas reservadas
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/dashboard/disponibilidad"
                                        className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                                Horarios de Atención
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                Configura días y bloques online/presencial
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/dashboard/estadisticas"
                                        className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                                Estadísticas e Ingresos
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                Métricas de retención y consulta
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/dashboard/reportes"
                                        className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                                Reportes Mensuales
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                Comprobantes e integración SII
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/profesional/completar-perfil"
                                        className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                                Editar Perfil
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                                Bio, especialidades y foto
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Calculadora de Honorarios y Retención SII */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                                <FeeCalculator />
                            </div>
                        </div>
                    )}

                    {/* =========================================================
                        VISTA PACIENTE (Dashboard Clínico y de Bienestar)
                       ========================================================= */}
                    {!isProfessional && (
                        <div className="space-y-6">
                            {/* Checklist de inicio si no tiene cita ni profesional */}
                            {!patientData.hasHistory && !patientData.nextSession ? (
                                <PatientOnboardingChecklist
                                    hasProfile={!!session.user.name && !!session.user.email}
                                    hasConsents={true}
                                    hasProfessional={!!patientData.professionalName}
                                    hasBookedSession={!!patientData.nextSession}
                                />
                            ) : (
                                <>
                                    {patientData.nextSession && (
                                        <div className="bg-white rounded-2xl border border-teal-200/90 p-5 shadow-xs mb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        Tu próxima sesión
                                                    </span>
                                                    <h3 className="text-base font-bold text-slate-900 mt-2">
                                                        {patientData.professionalName || 'Sesión programada'}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {patientData.nextSession} • Online por Videollamada
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/dashboard/citas"
                                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition"
                                                >
                                                    Entrar a la sesión
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <MetricsCards
                                        totalSessions={patientData.totalSessions}
                                        lastSessionDate={patientData.lastSessionDaysAgo}
                                        nextSessionDate={patientData.nextSession}
                                        professionalName={patientData.professionalName}
                                        professionalType={patientData.professionalType}
                                    />
                                </>
                            )}

                            {/* ZONA 2: Acción principal (agendar / continuar) */}
                            <PrimaryAction
                                hasProfessional={!!patientData.professionalName}
                                professionalName={patientData.professionalName}
                            />

                            {/* ZONA 3: Grid de Acompañamiento y Ficha */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Columna Principal */}
                                <div className="lg:col-span-7 space-y-5 min-w-0">
                                    <EmotionalCheckInCard />
                                    <HistorySection hasHistory={patientData.hasHistory} />
                                </div>

                                {/* Columna Lateral */}
                                <div className="lg:col-span-5 space-y-4 min-w-0">
                                    <ReimbursementCard />
                                    <BreathingResource />
                                    <SafetyMicroCopy />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de navegación inferior en dispositivos móviles */}
            <MobileDashboardNav
                isProfessional={isProfessional}
                hasPendingAppointments={professionalStats.pendingCount > 0}
            />

            <Footer />
        </>
    )
}