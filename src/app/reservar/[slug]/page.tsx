'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import { ClinicalConsentForm } from '@/components/forms/ClinicalConsentForm'
import {
    Loader2, Calendar, Clock, DollarSign, ChevronLeft,
    ChevronRight, Check, Video, MapPin, FileText
} from 'lucide-react'

interface Props {
    params: { slug: string }
}

interface Professional {
    id: string
    slug: string
    professionalType: string
    bio: string
    sessionPrice: number
    sessionDuration: number
    modality: string
    specialties: string[]
    // Location for in-person sessions
    region: string | null
    comuna: string | null
    officeAddress: string | null
    user: {
        name: string
        image: string | null
    }
    availability: {
        dayOfWeek: number
        startTime: string
        endTime: string
    }[]
}

const professionalTypeLabels: Record<string, string> = {
    PSYCHOLOGIST: 'Psicólogo/a',
    PSYCHIATRIST: 'Psiquiatra',
    CLINICAL_PSYCHOLOGIST: 'Psicólogo/a Clínico',
    THERAPIST: 'Terapeuta',
    COUNSELOR: 'Consejero/a',
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function ReservarPage({ params }: Props) {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [professional, setProfessional] = useState<Professional | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState('')

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedModality, setSelectedModality] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE')
    const [consultationReason, setConsultationReason] = useState('')

    // Consent state
    const [requiresConsent, setRequiresConsent] = useState(false)
    const [hasSignedConsent, setHasSignedConsent] = useState(false)
    const [checkingConsent, setCheckingConsent] = useState(false)

    const [step, setStep] = useState<'date' | 'time' | 'consent' | 'confirm'>('date')

    const fetchProfessional = useCallback(async () => {
        try {
            const response = await fetch(`/api/profesional/${params.slug}`)
            if (!response.ok) {
                notFound()
            }
            const data = await response.json()
            setProfessional(data)
        } catch (err) {
            notFound()
        } finally {
            setIsLoading(false)
        }
    }, [params.slug])

    useEffect(() => {
        fetchProfessional()
    }, [params.slug, fetchProfessional])

    // Check if patient needs to sign consent
    const checkFirstSession = useCallback(async () => {
        if (!session?.user?.id || !professional) return

        setCheckingConsent(true)
        try {
            const response = await fetch(`/api/citas/check-first-session?professionalId=${professional.id}`)
            const data = await response.json()

            setRequiresConsent(data.requiresConsent || false)
            setHasSignedConsent(data.hasSignedConsent || false)
        } catch (error) {
            console.error('Error checking first session:', error)
            setRequiresConsent(false)
        } finally {
            setCheckingConsent(false)
        }
    }, [session, professional])

    useEffect(() => {
        if (session && professional) {
            checkFirstSession()
        }
    }, [session, professional, checkFirstSession])

    // Generate calendar days
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = firstDay.getDay()

        const days: (Date | null)[] = []

        // Add empty slots for days before the first day
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null)
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const isDateAvailable = (date: Date) => {
        if (!professional) return false

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Can't book in the past
        if (date < today) return false

        // Check if professional works on this day
        const dayOfWeek = date.getDay()
        return professional.availability.some(a => a.dayOfWeek === dayOfWeek)
    }

    const getAvailableTimeSlots = (date: Date) => {
        if (!professional) return []

        const dayOfWeek = date.getDay()
        const dayAvailability = professional.availability.filter(a => a.dayOfWeek === dayOfWeek)

        const slots: string[] = []

        dayAvailability.forEach(({ startTime, endTime }) => {
            let [startHour, startMin] = startTime.split(':').map(Number)
            const [endHour] = endTime.split(':').map(Number)

            while (startHour < endHour) {
                slots.push(`${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`)
                startMin += 30
                if (startMin >= 60) {
                    startMin = 0
                    startHour++
                }
            }
        })

        return slots.sort()
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setSelectedTime(null)
        setStep('time')
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
        // Solo avanzar a confirmar si ya eligió modalidad o solo hay una opción
        if (professional?.modality === 'ONLINE' || professional?.modality === 'IN_PERSON') {
            // Check if needs consent before confirming
            const nextStep = (requiresConsent && !hasSignedConsent) ? 'consent' : 'confirm'
            setStep(nextStep)
        }
        // Si es BOTH, se queda en time para elegir modalidad
    }

    const handleModalityAndContinue = (modality: 'ONLINE' | 'IN_PERSON') => {
        setSelectedModality(modality)
        // Check if needs consent before confirming
        const nextStep = (requiresConsent && !hasSignedConsent) ? 'consent' : 'confirm'
        setStep(nextStep)
    }

    const handleConsentAccept = async () => {
        if (!session?.user || !professional) return

        try {
            const response = await fetch('/api/consent/clinical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professionalId: professional.id,
                    signature: session.user.name,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al guardar consentimiento')
            }

            setHasSignedConsent(true)
            setStep('confirm')
        } catch (error) {
            console.error('Error saving consent:', error)
            setError('Error al guardar consentimiento. Por favor intenta nuevamente.')
        }
    }

    const handleConsentCancel = () => {
        setStep('time')
    }

    const handleBooking = async () => {
        if (!session) {
            router.push(`/login?callbackUrl=/reservar/${params.slug}`)
            return
        }

        if (!selectedDate || !selectedTime || !professional) return

        setIsBooking(true)
        setError('')

        try {
            // Combine date and time
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const scheduledAt = new Date(selectedDate)
            scheduledAt.setHours(hours, minutes, 0, 0)

            const response = await fetch('/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professionalId: professional.id,
                    scheduledAt: scheduledAt.toISOString(),
                    modality: selectedModality,
                    consultationReason,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al reservar')
            }

            // Redirect to confirmation or payment
            router.push(`/cita/${data.appointmentId}/confirmar`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al reservar')
        } finally {
            setIsBooking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (!professional) return null

    const calendarDays = getDaysInMonth(currentMonth)
    const availableSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : []

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        {/* Back link */}
                        <Link
                            href={`/profesional/${params.slug}`}
                            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Volver al perfil
                        </Link>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Calendar / Booking Flow */}
                            <div className="lg:col-span-2">
                                <div className="card p-6">
                                    {/* Step Indicator */}
                                    <div className="flex items-center gap-4 mb-8">
                                        {(requiresConsent && !hasSignedConsent
                                            ? ['Fecha', 'Hora', 'Consentimiento', 'Confirmar']
                                            : ['Fecha', 'Hora', 'Confirmar']
                                        ).map((label, index) => {
                                            const stepLabels = requiresConsent && !hasSignedConsent
                                                ? ['date', 'time', 'consent', 'confirm']
                                                : ['date', 'time', 'confirm']
                                            const stepIndex = stepLabels.indexOf(step)
                                            const isActive = index === stepIndex
                                            const isComplete = index < stepIndex

                                            return (
                                                <div key={label} className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isComplete ? 'bg-primary-600 text-white' :
                                                        isActive ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' :
                                                            'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        {isComplete ? <Check className="w-4 h-4" /> : index + 1}
                                                    </div>
                                                    <span className={isActive ? 'font-medium text-gray-900' : 'text-gray-500'}>
                                                        {label}
                                                    </span>
                                                    {index < (requiresConsent && !hasSignedConsent ? 3 : 2) && <div className="w-8 h-px bg-gray-200" />}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Step: Date Selection */}
                                    {step === 'date' && (
                                        <div>
                                            <h2 className="text-xl font-heading font-semibold mb-6">
                                                Selecciona una fecha
                                            </h2>

                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between mb-4">
                                                <button
                                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <h3 className="font-semibold text-gray-900">
                                                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                                </h3>
                                                <button
                                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Calendar Grid */}
                                            <div className="grid grid-cols-7 gap-1 mb-4">
                                                {DAYS.map(day => (
                                                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                                        {day}
                                                    </div>
                                                ))}
                                                {calendarDays.map((date, index) => {
                                                    if (!date) {
                                                        return <div key={`empty-${index}`} />
                                                    }

                                                    const isAvailable = isDateAvailable(date)
                                                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                                                    const isToday = new Date().toDateString() === date.toDateString()

                                                    return (
                                                        <button
                                                            key={date.toISOString()}
                                                            onClick={() => isAvailable && handleDateSelect(date)}
                                                            disabled={!isAvailable}
                                                            className={`p-3 rounded-lg text-center transition-colors ${isSelected ? 'bg-primary-600 text-white' :
                                                                isAvailable ? 'hover:bg-primary-50 text-gray-900' :
                                                                    'text-gray-300 cursor-not-allowed'
                                                                } ${isToday && !isSelected ? 'ring-2 ring-primary-200' : ''}`}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            <p className="text-sm text-gray-500">
                                                Días marcados son disponibles para agendar
                                            </p>
                                        </div>
                                    )}

                                    {/* Step: Time Selection */}
                                    {step === 'time' && selectedDate && (
                                        <div>
                                            <button
                                                onClick={() => setStep('date')}
                                                className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                                            >
                                                ← Cambiar fecha
                                            </button>

                                            <h2 className="text-xl font-heading font-semibold mb-2">
                                                Selecciona una hora
                                            </h2>
                                            <p className="text-gray-600 mb-6">
                                                {selectedDate.toLocaleDateString('es-CL', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </p>

                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {availableSlots.length === 0 ? (
                                                    <p className="col-span-full text-gray-500">
                                                        No hay horarios disponibles para esta fecha
                                                    </p>
                                                ) : (
                                                    availableSlots.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => handleTimeSelect(time)}
                                                            className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${selectedTime === time
                                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            {/* Selección de modalidad - solo si el profesional ofrece ambas */}
                                            {selectedTime && professional.modality === 'BOTH' && (
                                                <div className="mt-8 pt-6 border-t border-gray-100">
                                                    <h3 className="text-lg font-heading font-semibold mb-4">
                                                        ¿Cómo prefieres tu sesión?
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => handleModalityAndContinue('ONLINE')}
                                                            className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 text-left transition-colors group"
                                                        >
                                                            <Video className="w-6 h-6 text-primary-600 mb-2" />
                                                            <p className="font-medium text-gray-900">Online</p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Sesión por videollamada desde donde estés
                                                            </p>
                                                        </button>
                                                        <button
                                                            onClick={() => handleModalityAndContinue('IN_PERSON')}
                                                            className="p-4 rounded-lg border-2 border-gray-200 hover:border-secondary-500 hover:bg-secondary-50 text-left transition-colors group"
                                                        >
                                                            <MapPin className="w-6 h-6 text-secondary-600 mb-2" />
                                                            <p className="font-medium text-gray-900">Presencial</p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {professional.comuna ? `En ${professional.comuna}` : 'En la consulta del profesional'}
                                                            </p>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step: Consent */}
                                    {step === 'consent' && requiresConsent && !hasSignedConsent && (
                                        <div>
                                            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h3 className="font-medium text-primary-900 mb-1">
                                                            Consentimiento Informado Requerido
                                                        </h3>
                                                        <p className="text-sm text-primary-700">
                                                            Antes de tu primera sesión con {professional?.user.name}, necesitamos que leas y aceptes el consentimiento informado para el proceso terapéutico.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <ClinicalConsentForm
                                                patientName={session?.user?.name || ''}
                                                professionalName={professional?.user.name || ''}
                                                onAccept={handleConsentAccept}
                                                onCancel={handleConsentCancel}
                                            />
                                        </div>
                                    )}

                                    {/* Step: Confirm */}
                                    {step === 'confirm' && selectedDate && selectedTime && (
                                        <div>
                                            <button
                                                onClick={() => setStep('time')}
                                                className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                                            >
                                                ← Cambiar hora
                                            </button>

                                            <h2 className="text-xl font-heading font-semibold mb-6">
                                                Confirma tu reserva
                                            </h2>

                                            {/* Resumen de modalidad seleccionada */}
                                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">Modalidad seleccionada</p>
                                                <div className="flex items-center gap-2">
                                                    {selectedModality === 'ONLINE' ? (
                                                        <>
                                                            <Video className="w-5 h-5 text-primary-600" />
                                                            <span className="font-medium">Online (videollamada)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-5 h-5 text-secondary-600" />
                                                            <span className="font-medium">Presencial</span>
                                                            {professional.comuna && (
                                                                <span className="text-gray-500">en {professional.comuna}</span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {professional.modality === 'BOTH' && (
                                                    <button
                                                        onClick={() => setStep('time')}
                                                        className="text-sm text-primary-600 hover:underline mt-2"
                                                    >
                                                        Cambiar modalidad
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reason */}
                                            <div className="mb-6">
                                                <label className="label">¿Qué te gustaría trabajar? (opcional)</label>
                                                <textarea
                                                    value={consultationReason}
                                                    onChange={(e) => setConsultationReason(e.target.value)}
                                                    className="input min-h-[100px]"
                                                    placeholder="Cuéntale brevemente al profesional el motivo de tu consulta..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Esta información es privada y solo la verá tu profesional.
                                                </p>
                                            </div>

                                            {/* Confirm Button */}
                                            <button
                                                onClick={handleBooking}
                                                disabled={isBooking}
                                                className="btn-primary w-full flex items-center justify-center gap-2"
                                            >
                                                {isBooking ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Calendar className="w-5 h-5" />
                                                        {session ? 'Confirmar reserva' : 'Iniciar sesión para reservar'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar - Summary */}
                            <div className="lg:col-span-1">
                                <div className="card p-6 sticky top-24">
                                    {/* Professional info */}
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden relative">
                                            {professional.user.image ? (
                                                <Image
                                                    src={professional.user.image}
                                                    alt={professional.user.name}
                                                    width={56}
                                                    height={56}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold text-primary-600">
                                                    {professional.user.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{professional.user.name}</p>
                                            <p className="text-sm text-primary-600">
                                                {professionalTypeLabels[professional.professionalType]}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location for in-person */}
                                    {professional.modality !== 'ONLINE' && professional.officeAddress && (
                                        <div className="flex items-start gap-3 py-4 border-t border-gray-100">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Atención presencial</p>
                                                <p className="text-sm text-gray-500">{professional.officeAddress}</p>
                                                {professional.comuna && (
                                                    <p className="text-xs text-gray-400">{professional.comuna}, {professional.region}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Booking Summary */}
                                    <div className="space-y-3 mb-6">
                                        {selectedDate && (
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <span>
                                                    {selectedDate.toLocaleDateString('es-CL', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {selectedTime && (
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Clock className="w-5 h-5 text-gray-400" />
                                                <span>{selectedTime} ({professional.sessionDuration} min)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Total a pagar</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {formatPrice(professional.sessionPrice)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            El pago se realiza después de confirmar la reserva
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
