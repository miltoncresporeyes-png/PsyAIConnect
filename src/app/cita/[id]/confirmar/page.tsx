'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import { Loader2, Check, Calendar, Clock, Video, MapPin, CreditCard } from 'lucide-react'

interface Props {
    params: { id: string }
}

interface Appointment {
    id: string
    scheduledAt: string
    duration: number
    modality: string
    status: string
    consultationReason?: string
    professional: {
        sessionPrice: number
        user: {
            name: string
            image: string | null
        }
    }
    payment: {
        amount: number
        status: string
    }
}

export default function ConfirmarCitaPage({ params }: Props) {
    const router = useRouter()
    const [appointment, setAppointment] = useState<Appointment | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const response = await fetch(`/api/citas/${params.id}`)
                if (!response.ok) {
                    throw new Error('Cita no encontrada')
                }
                const data = await response.json()
                setAppointment(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar cita')
            } finally {
                setIsLoading(false)
            }
        }
        fetchAppointment()
    }, [params.id])

    const handlePayment = async () => {
        setIsProcessing(true)
        setError('')

        try {
            const response = await fetch(`/api/citas/${params.id}/pagar`, {
                method: 'POST',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al procesar pago')
            }

            const { paymentUrl } = await response.json()

            // Redirect to Flow payment page
            window.location.href = paymentUrl
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar pago')
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (error && !appointment) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Link href="/buscar" className="btn-primary">
                            Buscar profesional
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    if (!appointment) return null

    const scheduledDate = new Date(appointment.scheduledAt)

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container-wide">
                    <div className="max-w-2xl mx-auto">
                        {/* Success indicator */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                                ¡Reserva creada!
                            </h1>
                            <p className="text-gray-600">
                                Completa el pago para confirmar tu cita
                            </p>
                        </div>

                        {/* Appointment Details */}
                        <div className="card p-8 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Detalles de la cita
                            </h2>

                            {/* Professional */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden relative">
                                    {appointment.professional.user.image ? (
                                        <Image
                                            src={appointment.professional.user.image}
                                            alt={appointment.professional.user.name}
                                            width={64}
                                            height={64}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary-600">
                                            {appointment.professional.user.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {appointment.professional.user.name}
                                    </p>
                                    <p className="text-sm text-gray-600">Profesional</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span>
                                        {scheduledDate.toLocaleDateString('es-CL', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <span>
                                        {scheduledDate.toLocaleTimeString('es-CL', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })} ({appointment.duration} min)
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    {appointment.modality === 'ONLINE' ? (
                                        <Video className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                    )}
                                    <span>
                                        {appointment.modality === 'ONLINE' ? 'Videollamada' : 'Presencial'}
                                    </span>
                                </div>
                            </div>

                            {/* Consultation Reason */}
                            {appointment.consultationReason && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Motivo de consulta</p>
                                    <p className="text-gray-700">{appointment.consultationReason}</p>
                                </div>
                            )}

                            {/* Price */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between text-lg">
                                    <span className="font-medium text-gray-900">Total a pagar</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatPrice(appointment.payment.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Payment Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Pagar con Flow.cl
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            Pago seguro procesado por Flow.cl. Puedes cancelar hasta 24h antes sin costo.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
