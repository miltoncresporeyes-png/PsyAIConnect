'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import { Loader2, Check, Calendar, Clock, Video, MapPin, CreditCard, ShieldCheck } from 'lucide-react'

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

type ProviderType = 'TRANSBANK' | 'MERCADOPAGO' | 'PAYPAL' | 'FLOW'

interface ProviderOption {
    id: ProviderType
    name: string
    subtitle: string
    badge?: string
    iconBg: string
    description: string
}

const PROVIDERS: ProviderOption[] = [
    {
        id: 'TRANSBANK',
        name: 'Webpay Plus / Transbank',
        subtitle: 'Débito, Crédito y Redcompra',
        badge: 'Más usado en Chile',
        iconBg: 'bg-red-50 text-red-600 border-red-200',
        description: 'Paga con tus tarjetas bancarias chilenas sin comisión adicional.',
    },
    {
        id: 'MERCADOPAGO',
        name: 'Mercado Pago',
        subtitle: 'Dinero en cuenta, tarjetas o cuotas',
        badge: 'Rápido',
        iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
        description: 'Usa tu saldo de Mercado Pago o tarjetas de débito/crédito.',
    },
    {
        id: 'PAYPAL',
        name: 'PayPal',
        subtitle: 'Tarjetas internacionales y saldo PayPal',
        badge: 'Internacional',
        iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
        description: 'Ideal para tarjetas extranjeras o cuentas internacionales.',
    },
    {
        id: 'FLOW',
        name: 'Flow.cl',
        subtitle: 'Servipag, Multicaja y Webpay',
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        description: 'Paga con transferencias, casas comerciales y comercios asociados.',
    },
]

export default function ConfirmarCitaPage({ params }: Props) {
    const router = useRouter()
    const [appointment, setAppointment] = useState<Appointment | null>(null)
    const [selectedProvider, setSelectedProvider] = useState<ProviderType>('TRANSBANK')
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider: selectedProvider,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar pago')
            }

            if (!data.paymentUrl) {
                throw new Error('No se recibió la URL de pago de la pasarela.')
            }

            // Redirect to the chosen payment provider gateway
            window.location.href = data.paymentUrl
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
                                Selecciona tu medio de pago preferido para confirmar tu cita
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

                        {/* Payment Provider Selector */}
                        <div className="card p-8 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary-600" />
                                Elige tu medio de pago
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Tu transacción está 100% cifrada y protegida.
                            </p>

                            <div className="space-y-3">
                                {PROVIDERS.map((provider) => {
                                    const isSelected = selectedProvider === provider.id
                                    return (
                                        <div
                                            key={provider.id}
                                            onClick={() => setSelectedProvider(provider.id)}
                                            className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className="mt-1">
                                                <input
                                                    type="radio"
                                                    name="paymentProvider"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedProvider(provider.id)}
                                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-semibold text-gray-900">
                                                        {provider.name}
                                                    </span>
                                                    {provider.badge && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary-100 text-primary-700">
                                                            {provider.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium mb-0.5">
                                                    {provider.subtitle}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {provider.description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="btn-primary w-full flex items-center justify-center gap-2 mb-4 text-base py-3"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Conectando pasarela de pago...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Continuar al pago con {PROVIDERS.find(p => p.id === selectedProvider)?.name}
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-gray-400" />
                            Pago seguro garantizado. Puedes reprogramar o cancelar hasta 24h antes sin costo.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
