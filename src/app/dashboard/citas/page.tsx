'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader, ListContainer, ListItem } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import { formatPrice } from '@/lib/utils'
import {
    Loader2, Calendar, Clock, Video, MapPin,
    X, ExternalLink, Filter
} from 'lucide-react'

interface Appointment {
    id: string
    scheduledAt: string
    duration: number
    modality: string
    status: string
    videoLink?: string
    patientReconfirmedAt?: string | null
    consultationReason?: string
    professional?: {
        sessionPrice: number
        profileImageUrl?: string | null
        user: {
            name: string
            image: string | null
        }
    }
    patient?: {
        name: string
        email: string
        image: string | null
        noShowCount?: number
    }
    payment?: {
        amount: number
        status: string
    }
}

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Esperando aceptación', color: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
    COMPLETED: { label: 'Completada', color: 'bg-gray-100 text-gray-700' },
    CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
    NO_SHOW: { label: 'No asistió', color: 'bg-red-100 text-red-700' },
}

export default function CitasPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

    const isProfessional = session?.user?.role === 'PROFESSIONAL'

    const fetchAppointments = useCallback(async () => {
        try {
            const role = isProfessional ? 'professional' : 'patient'
            const response = await fetch(`/api/citas?role=${role}`)
            if (response.ok) {
                const data = await response.json()
                setAppointments(data)
            }
        } catch {
            console.error('Error fetching appointments')
        } finally {
            setIsLoading(false)
        }
    }, [isProfessional])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchAppointments()
        }
    }, [status, router, fetchAppointments])

    const [actionError, setActionError] = useState('')

    const updateStatus = async (id: string, status: string, cancellationReason?: string) => {
        setActionError('')
        try {
            const response = await fetch(`/api/citas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...(cancellationReason && { cancellationReason }) }),
            })
            if (response.ok) {
                fetchAppointments()
            } else {
                const data = await response.json().catch(() => ({}))
                setActionError(data.error || 'No se pudo actualizar la cita')
            }
        } catch {
            setActionError('No se pudo actualizar la cita')
        }
    }

    const handleCancel = (id: string) => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return
        updateStatus(id, 'CANCELLED', isProfessional ? 'Cancelada por el profesional' : 'Cancelada por el paciente')
    }

    const handleAccept = (id: string) => updateStatus(id, 'CONFIRMED')

    const handleReject = (id: string) => {
        if (!confirm('¿Rechazar esta solicitud? El paciente será avisado para que elija otro horario.')) return
        updateStatus(id, 'CANCELLED', 'El profesional no puede atender en ese horario')
    }

    const handleNoShow = (id: string) => {
        if (!confirm('¿Registrar que el paciente no se conectó? Quedará en su historial de inasistencias.')) return
        updateStatus(id, 'NO_SHOW')
    }

    const handleReconfirm = async (id: string) => {
        setActionError('')
        try {
            const response = await fetch(`/api/citas/${id}/reconfirmar`, { method: 'POST' })
            if (response.ok) {
                fetchAppointments()
            } else {
                const data = await response.json().catch(() => ({}))
                setActionError(data.error || 'No se pudo reconfirmar la cita')
            }
        } catch {
            setActionError('No se pudo reconfirmar la cita')
        }
    }

    const now = new Date()
    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt)
        // Una sesion en curso (o recien terminada, dentro de la ventana de ingreso) sigue vigente
        const stillActive =
            ['PENDING', 'CONFIRMED'].includes(apt.status) &&
            now.getTime() <= aptDate.getTime() + (apt.duration + 30) * 60000
        if (filter === 'upcoming') return stillActive
        if (filter === 'past') return !stillActive
        return true
    })

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <>
            <Header />

            <PageContainer variant="dashboard" size="medium">
                <BackToDashboard />

                <PageHeader
                    title="Mis citas"
                    description={isProfessional ? 'Gestiona las citas con tus pacientes' : 'Revisa tus próximas sesiones'}
                    actions={!isProfessional && (
                        <Link href="/buscar" className="btn-primary">
                            Nueva cita
                        </Link>
                    )}
                />

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Filtrar citas">
                    {(['upcoming', 'past', 'all'] as const).map(f => (
                        <button
                            key={f}
                            role="tab"
                            aria-selected={filter === f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {f === 'upcoming' ? 'Próximas' : f === 'past' ? 'Pasadas' : 'Todas'}
                        </button>
                    ))}
                </div>

                {actionError && (
                    <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                            Aún no tienes citas
                        </h3>
                        <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
                            {isProfessional
                                ? 'No tienes sesiones programadas por ahora. Revisa tu disponibilidad en la agenda.'
                                : 'Cuando estés listo/a, te ayudamos a encontrar apoyo.'}
                        </p>
                        {!isProfessional ? (
                            <Link href="/buscar" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition">
                                Encontrar apoyo
                            </Link>
                        ) : (
                            <Link href="/dashboard/disponibilidad" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition">
                                Ver mi agenda
                            </Link>
                        )}
                    </div>
                ) : (
                    <ListContainer divided>
                        {filteredAppointments.map(apt => {
                            const aptDate = new Date(apt.scheduledAt)
                            const isUpcoming = aptDate >= now && apt.status === 'CONFIRMED'
                            const canJoin =
                                apt.status === 'CONFIRMED' &&
                                apt.modality === 'ONLINE' &&
                                now.getTime() >= aptDate.getTime() - 15 * 60000 &&
                                now.getTime() <= aptDate.getTime() + (apt.duration + 30) * 60000
                            const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status) && aptDate > now
                            const hoursToStart = (aptDate.getTime() - now.getTime()) / 3600000
                            const needsReconfirm =
                                !isProfessional && apt.status === 'CONFIRMED' && !apt.patientReconfirmedAt && aptDate > now && hoursToStart <= 24
                            const canMarkNoShow =
                                isProfessional && apt.status === 'CONFIRMED' && now.getTime() >= aptDate.getTime() + 15 * 60000
                            const awaitingAcceptance = apt.status === 'PENDING' && aptDate > now

                            const person = isProfessional ? apt.patient : apt.professional?.user

                            return (
                                <ListItem
                                    key={apt.id}
                                    action={
                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            {awaitingAcceptance && isProfessional && (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(apt.id)}
                                                        className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
                                                    >
                                                        Aceptar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(apt.id)}
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 whitespace-nowrap"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}
                                            {needsReconfirm && (
                                                <button
                                                    onClick={() => handleReconfirm(apt.id)}
                                                    className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
                                                >
                                                    Reconfirmar asistencia
                                                </button>
                                            )}
                                            {canMarkNoShow && (
                                                <button
                                                    onClick={() => handleNoShow(apt.id)}
                                                    className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 whitespace-nowrap"
                                                >
                                                    No se conectó
                                                </button>
                                            )}
                                            {!isProfessional && apt.status === 'COMPLETED' && (
                                                <Link
                                                    href={`/opinar/${apt.id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800 font-medium whitespace-nowrap"
                                                >
                                                    Dejar opinión
                                                </Link>
                                            )}
                                            {canJoin && (
                                                <Link
                                                    href={`/dashboard/citas/${apt.id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium whitespace-nowrap"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    {isProfessional ? 'Iniciar sesión' : 'Unirme'}
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            )}
                                            {canCancel && !(awaitingAcceptance && isProfessional) && (
                                                <button
                                                    onClick={() => handleCancel(apt.id)}
                                                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 whitespace-nowrap"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    }
                                >
                                    <Link className="flex w-full items-start gap-4" href={`/dashboard/citas/${apt.id}`}>
                                        {/* Avatar */}
                                        <Avatar
                                            src={(!isProfessional && apt.professional?.profileImageUrl) || person?.image}
                                            name={person?.name}
                                            size={56}
                                        />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {person?.name}
                                                </h3>
                                                <span className={`badge ${statusLabels[apt.status]?.color || 'bg-gray-100'} flex-shrink-0`}>
                                                    {statusLabels[apt.status]?.label || apt.status}
                                                </span>
                                                {apt.status === 'CONFIRMED' && apt.patientReconfirmedAt && aptDate > now && (
                                                    <span className="badge bg-teal-50 text-teal-700 flex-shrink-0">Asistencia reconfirmada</span>
                                                )}
                                                {isProfessional && (apt.patient?.noShowCount ?? 0) >= 2 && apt.status === 'PENDING' && (
                                                    <span className="badge bg-amber-100 text-amber-800 flex-shrink-0">
                                                        {apt.patient?.noShowCount} inasistencias previas
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                                <span className="flex items-center gap-1 whitespace-nowrap">
                                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                                    {aptDate.toLocaleDateString('es-CL', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                                    {aptDate.toLocaleTimeString('es-CL', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })} ({apt.duration} min)
                                                </span>
                                                <span className="flex items-center gap-1 whitespace-nowrap">
                                                    {apt.modality === 'ONLINE' ? (
                                                        <Video className="w-4 h-4 flex-shrink-0" />
                                                    ) : (
                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    )}
                                                    {apt.modality === 'ONLINE' ? 'Online' : 'Presencial'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        {apt.payment && (
                                            <div className="text-right shrink-0 min-w-[140px]">
                                                <p className="font-semibold text-gray-900">
                                                    {formatPrice(apt.payment.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {apt.payment.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                                                </p>
                                            </div>
                                        )}
                                    </Link>
                                </ListItem>
                            )
                        })}
                    </ListContainer>
                )}
            </PageContainer>

            <Footer />
        </>
    )
}