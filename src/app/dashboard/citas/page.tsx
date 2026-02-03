'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import {
    Loader2, Calendar, Clock, Video, MapPin,
    ChevronRight, X, ExternalLink
} from 'lucide-react'
import { BackToDashboard } from '@/components/ui/BackToDashboard'

interface Appointment {
    id: string
    scheduledAt: string
    duration: number
    modality: string
    status: string
    videoLink?: string
    consultationReason?: string
    professional?: {
        sessionPrice: number
        user: {
            name: string
            image: string | null
        }
    }
    patient?: {
        name: string
        email: string
        image: string | null
    }
    payment?: {
        amount: number
        status: string
    }
}

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pendiente pago', color: 'bg-yellow-100 text-yellow-700' },
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
        } catch (err) {
            console.error('Error fetching appointments:', err)
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

    const handleCancel = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return

        try {
            const response = await fetch(`/api/citas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'CANCELLED',
                    cancellationReason: 'Cancelada por el usuario',
                }),
            })

            if (response.ok) {
                fetchAppointments()
            }
        } catch (err) {
            console.error('Error cancelling appointment:', err)
        }
    }

    const now = new Date()
    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledAt)
        if (filter === 'upcoming') return aptDate >= now && apt.status !== 'CANCELLED'
        if (filter === 'past') return aptDate < now || apt.status === 'CANCELLED' || apt.status === 'COMPLETED'
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

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        {/* Back to Dashboard */}
                        <BackToDashboard />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-heading font-bold text-gray-900">
                                    Mis citas
                                </h1>
                                <p className="text-gray-600">
                                    {isProfessional ? 'Gestiona las citas con tus pacientes' : 'Revisa tus próximas sesiones'}
                                </p>
                            </div>
                            {!isProfessional && (
                                <Link href="/buscar" className="btn-primary">
                                    Nueva cita
                                </Link>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-6">
                            {(['upcoming', 'past', 'all'] as const).map(f => (
                                <button
                                    key={f}
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

                        {/* Appointments List */}
                        {filteredAppointments.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No hay citas {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {isProfessional
                                        ? 'Cuando tengas citas agendadas, aparecerán aquí.'
                                        : 'Busca un profesional y agenda tu primera sesión.'}
                                </p>
                                {!isProfessional && (
                                    <Link href="/buscar" className="btn-primary">
                                        Buscar profesional
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAppointments.map(apt => {
                                    const aptDate = new Date(apt.scheduledAt)
                                    const isUpcoming = aptDate >= now && apt.status === 'CONFIRMED'
                                    const canJoin = isUpcoming && apt.modality === 'ONLINE' && apt.videoLink
                                    const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status) && aptDate > now

                                    const person = isProfessional ? apt.patient : apt.professional?.user

                                    return (
                                        <div key={apt.id} className="card p-6 hover:border-primary-200 transition-colors">
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                                    {person?.image ? (
                                                        <Image
                                                            src={person.image}
                                                            alt={person.name || ''}
                                                            width={56}
                                                            height={56}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl font-bold text-primary-600">
                                                            {person?.name?.charAt(0) || '?'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {person?.name}
                                                        </h3>
                                                        <span className={`badge ${statusLabels[apt.status]?.color || 'bg-gray-100'}`}>
                                                            {statusLabels[apt.status]?.label || apt.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {aptDate.toLocaleDateString('es-CL', {
                                                                weekday: 'short',
                                                                day: 'numeric',
                                                                month: 'short',
                                                            })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {aptDate.toLocaleTimeString('es-CL', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })} ({apt.duration} min)
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {apt.modality === 'ONLINE' ? (
                                                                <Video className="w-4 h-4" />
                                                            ) : (
                                                                <MapPin className="w-4 h-4" />
                                                            )}
                                                            {apt.modality === 'ONLINE' ? 'Online' : 'Presencial'}
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {apt.status === 'PENDING' && !isProfessional && (
                                                            <Link
                                                                href={`/cita/${apt.id}/confirmar`}
                                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                            >
                                                                Completar pago →
                                                            </Link>
                                                        )}
                                                        {canJoin && (
                                                            <a
                                                                href={apt.videoLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                                                            >
                                                                <Video className="w-4 h-4" />
                                                                Unirse a la sesión
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {canCancel && (
                                                            <button
                                                                onClick={() => handleCancel(apt.id)}
                                                                className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Cancelar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                {apt.payment && (
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            {formatPrice(apt.payment.amount)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {apt.payment.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
