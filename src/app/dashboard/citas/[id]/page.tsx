'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { PageContainer } from '@/components/layout/shell'
import { formatPrice } from '@/lib/utils'
import { paymentMethodLabels } from '@/lib/paymentMethods'
import { appointmentToEvent, buildGoogleCalendarUrl } from '@/lib/calendarLinks'
import { Loader2, Calendar, CalendarPlus, Clock, Video, MapPin, ArrowLeft, ExternalLink, AlertTriangle, Download } from 'lucide-react'

interface AppointmentDetail {
    id: string
    scheduledAt: string
    duration: number
    modality: string
    status: string
    videoLink?: string | null
    consultationReason?: string | null
    patientReconfirmedAt?: string | null
    professionalConfirmedAt?: string | null
    cancellationReason?: string | null
    patient: { name: string | null; email: string; image: string | null; noShowCount?: number }
    professional: {
        sessionPrice: number
        professionalType?: string
        profileImageUrl?: string | null
        officeAddress?: string | null
        acceptedPaymentMethods?: string[]
        paymentNotes?: string | null
        user: { name: string | null; image: string | null }
    }
    payment?: { amount: number } | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Esperando aceptación', color: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
    COMPLETED: { label: 'Completada', color: 'bg-gray-100 text-gray-700' },
    CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
    NO_SHOW: { label: 'No asistió', color: 'bg-red-100 text-red-700' },
}

export default function CitaDetallePage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [apt, setApt] = useState<AppointmentDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [actionError, setActionError] = useState('')
    const [imageFailed, setImageFailed] = useState(false)

    const isProfessional = session?.user?.role === 'PROFESSIONAL'

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/citas/${params.id}`)
            if (!res.ok) {
                setNotFound(true)
                return
            }
            setApt(await res.json())
        } catch {
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login')
        else if (status === 'authenticated') load()
    }, [status, router, load])

    const updateStatus = async (newStatus: string, cancellationReason?: string) => {
        setActionError('')
        const res = await fetch(`/api/citas/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, ...(cancellationReason && { cancellationReason }) }),
        })
        if (res.ok) await load()
        else setActionError((await res.json().catch(() => ({}))).error || 'No se pudo actualizar la cita')
    }

    const joinSession = async () => {
        setActionError('')
        // Abrir la ventana antes del fetch evita que el navegador bloquee el popup
        const popup = window.open('', '_blank')
        const res = await fetch(`/api/citas/${params.id}/unirse`, { method: 'POST' })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.url) {
            if (popup) popup.location.href = data.url
            else window.location.href = data.url
            await load()
        } else {
            popup?.close()
            setActionError(data.error || 'No se pudo abrir la sala')
        }
    }

    const reconfirm = async () => {
        setActionError('')
        const res = await fetch(`/api/citas/${params.id}/reconfirmar`, { method: 'POST' })
        if (res.ok) await load()
        else setActionError((await res.json().catch(() => ({}))).error || 'No se pudo reconfirmar la cita')
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (notFound || !apt) {
        return (
            <>
                <Header />
                <PageContainer variant="dashboard" size="medium">
                    <div className="text-center py-16">
                        <p className="text-slate-700 mb-4">No encontramos esta cita o no tienes acceso a ella.</p>
                        <Link href="/dashboard/citas" className="btn-primary">
                            Volver a mis citas
                        </Link>
                    </div>
                </PageContainer>
                <Footer />
            </>
        )
    }

    const now = new Date()
    const when = new Date(apt.scheduledAt)
    const hoursToStart = (when.getTime() - now.getTime()) / 3600000
    const dateLabel = when.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timeLabel = when.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })

    const person = isProfessional
        ? { name: apt.patient.name || apt.patient.email, image: apt.patient.image, role: 'Paciente' }
        : {
              name: apt.professional.user.name || 'Profesional',
              image: apt.professional.profileImageUrl || apt.professional.user.image,
              role: apt.professional.professionalType === 'PSYCHIATRIST' ? 'Psiquiatra' : 'Psicólogo/a',
          }

    const upcoming = when > now
    const awaitingAcceptance = isProfessional && apt.status === 'PENDING' && upcoming
    const needsReconfirm =
        !isProfessional && apt.status === 'CONFIRMED' && !apt.patientReconfirmedAt && upcoming && hoursToStart <= 24
    const canMarkNoShow = isProfessional && apt.status === 'CONFIRMED' && now.getTime() >= when.getTime() + 15 * 60000
    const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status) && upcoming && !awaitingAcceptance
    const endsAt = when.getTime() + apt.duration * 60000
    const canJoin =
        apt.status === 'CONFIRMED' &&
        apt.modality === 'ONLINE' &&
        now.getTime() >= when.getTime() - 15 * 60000 &&
        now.getTime() <= endsAt + 30 * 60000
    const canFinish = isProfessional && apt.status === 'CONFIRMED' && now.getTime() >= when.getTime()
    const paymentLabels = paymentMethodLabels(apt.professional.acceptedPaymentMethods)
    const canAddToCalendar = ['PENDING', 'CONFIRMED'].includes(apt.status) && endsAt >= now.getTime()
    const googleCalendarUrl = canAddToCalendar
        ? buildGoogleCalendarUrl(
              appointmentToEvent({
                  appointmentId: apt.id,
                  scheduledAt: when,
                  durationMin: apt.duration,
                  modality: apt.modality,
                  otherPartyName: isProfessional ? apt.patient.name : apt.professional.user.name,
                  baseUrl: window.location.origin,
                  officeAddress: apt.professional.officeAddress,
              })
          )
        : null
    const amount = apt.payment?.amount ?? apt.professional.sessionPrice

    return (
        <>
            <Header />
            <PageContainer variant="dashboard" size="medium">
                <Link
                    href="/dashboard/citas"
                    className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Mis citas
                </Link>

                <div className="card p-6 md:p-8 mb-6">
                    <div className="flex items-start gap-4 pb-6 mb-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {person.image && !imageFailed ? (
                                <Image
                                    src={person.image}
                                    alt={person.name}
                                    width={64}
                                    height={64}
                                    unoptimized
                                    onError={() => setImageFailed(true)}
                                    className="object-cover w-16 h-16"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-primary-600">
                                    {person.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-gray-900 capitalize truncate">{person.name}</h1>
                            <p className="text-sm text-gray-600">{person.role}</p>
                            <span className={`badge mt-2 inline-block ${statusLabels[apt.status]?.color || 'bg-gray-100'}`}>
                                {statusLabels[apt.status]?.label || apt.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6 text-gray-700">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="capitalize">{dateLabel}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span>{timeLabel} hrs · {apt.duration} min</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {apt.modality === 'ONLINE' ? (
                                <Video className="w-5 h-5 text-gray-400" />
                            ) : (
                                <MapPin className="w-5 h-5 text-gray-400" />
                            )}
                            <span>{apt.modality === 'ONLINE' ? 'Online (videollamada)' : 'Presencial'}</span>
                        </div>
                        <div className="font-semibold text-gray-900">Valor de la sesión: {formatPrice(amount)}</div>
                    </div>

                    {apt.consultationReason && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-1">Motivo de consulta</p>
                            <p className="text-gray-700 whitespace-pre-line">{apt.consultationReason}</p>
                        </div>
                    )}

                    {isProfessional && (apt.patient.noShowCount ?? 0) >= 2 && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 mb-6 text-sm text-amber-900">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Este paciente registra {apt.patient.noShowCount} inasistencias previas.
                        </div>
                    )}

                    {apt.status === 'CONFIRMED' && upcoming && (
                        <p className="text-sm text-slate-600 mb-6">
                            {apt.patientReconfirmedAt
                                ? 'El paciente reconfirmó su asistencia.'
                                : 'La asistencia se reconfirma 24 horas antes; si no se reconfirma, el horario se libera 3 horas antes.'}
                        </p>
                    )}

                    {apt.status === 'CANCELLED' && apt.cancellationReason && (
                        <p className="text-sm text-red-700 mb-6">Motivo de cancelación: {apt.cancellationReason}</p>
                    )}

                    {actionError && (
                        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}

                    {canJoin && (
                        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                            Esta sala de Google Meet se creó solo para esta cita. No compartas el enlace con nadie.
                            {isProfessional
                                ? ` Si ves a alguien que no es ${apt.patient.name?.split(' ')[0] || 'tu paciente'}, no continúes la sesión.`
                                : ''}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {awaitingAcceptance && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => updateStatus('CONFIRMED')}
                                    className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                                >
                                    Aceptar solicitud
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('¿Rechazar esta solicitud? El paciente será avisado.'))
                                            updateStatus('CANCELLED', 'El profesional no puede atender en ese horario')
                                    }}
                                    className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Rechazar
                                </button>
                            </>
                        )}
                        {needsReconfirm && (
                            <button
                                type="button"
                                onClick={reconfirm}
                                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                            >
                                Reconfirmar asistencia
                            </button>
                        )}
                        {canJoin && (
                            <button
                                type="button"
                                onClick={joinSession}
                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                            >
                                <Video className="w-4 h-4" />
                                {isProfessional ? 'Iniciar sesión' : 'Unirme a la sesión'}
                                <ExternalLink className="w-3 h-3" />
                            </button>
                        )}
                        {canFinish && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Finalizar la sesión? La cita quedará como completada.'))
                                        updateStatus('COMPLETED')
                                }}
                                className="rounded-xl border border-teal-300 px-5 py-2.5 text-sm font-medium text-teal-800 hover:bg-teal-50"
                            >
                                Finalizar sesión
                            </button>
                        )}
                        {canMarkNoShow && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Registrar que el paciente no se conectó? Quedará en su historial.'))
                                        updateStatus('NO_SHOW')
                                }}
                                className="rounded-xl border border-amber-300 px-5 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
                            >
                                No se conectó
                            </button>
                        )}
                        {canCancel && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Estás seguro de que quieres cancelar esta cita?'))
                                        updateStatus(
                                            'CANCELLED',
                                            isProfessional ? 'Cancelada por el profesional' : 'Cancelada por el paciente'
                                        )
                                }}
                                className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Cancelar cita
                            </button>
                        )}
                    </div>
                </div>

                {googleCalendarUrl && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CalendarPlus className="w-4 h-4 text-primary-600" />
                            Agregar a tu calendario
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={googleCalendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Google Calendar
                            </a>
                            <a
                                href={`/api/citas/${apt.id}/calendario`}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Download className="w-4 h-4" />
                                Descargar .ics (Apple, Outlook)
                            </a>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            El evento no incluye el motivo de consulta ni el enlace de la videollamada, que se entrega
                            solo dentro de PsyDoctor.
                        </p>
                    </div>
                )}

                {paymentLabels.length > 0 && (
                    <div className="card p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">Formas de pago</h2>
                        <div className="flex flex-wrap gap-2">
                            {paymentLabels.map((label) => (
                                <span
                                    key={label}
                                    className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-100"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                        {apt.professional.paymentNotes && (
                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{apt.professional.paymentNotes}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">El pago se coordina directamente con el profesional.</p>
                    </div>
                )}
            </PageContainer>
            <Footer />
        </>
    )
}
