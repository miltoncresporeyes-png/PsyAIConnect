'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import { paymentMethodLabels } from '@/lib/paymentMethods'
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
        professionalType?: string
        profileImageUrl?: string | null
        acceptedPaymentMethods?: string[]
        paymentNotes?: string | null
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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [imageFailed, setImageFailed] = useState(false)

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
    const professionalName = appointment.professional.user.name || 'Profesional'
    const avatarSrc = appointment.professional.profileImageUrl || appointment.professional.user.image
    const professionalRole =
        appointment.professional.professionalType === 'PSYCHIATRIST' ? 'Psiquiatra' : 'Psicólogo/a'
    const professionalPaymentLabels = paymentMethodLabels(appointment.professional.acceptedPaymentMethods)
    const dateLabel = scheduledDate.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
    const dateLabelCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
    const timeLabel = scheduledDate.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

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
                                ¡Reserva solicitada!
                            </h1>
                            <p className="text-gray-600">
                                Tu solicitud fue enviada. El profesional debe aceptarla para confirmar la cita; te avisaremos por correo. 24 horas antes te pediremos reconfirmar tu asistencia.
                            </p>
                        </div>

                        {/* Appointment Details */}
                        <div className="card p-8 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Detalles de la cita
                            </h2>

                            {/* Professional */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                                    {avatarSrc && !imageFailed ? (
                                        <Image
                                            src={avatarSrc}
                                            alt={professionalName}
                                            width={64}
                                            height={64}
                                            unoptimized
                                            onError={() => setImageFailed(true)}
                                            className="object-cover w-16 h-16"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary-600">
                                            {professionalName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {professionalName}
                                    </p>
                                    <p className="text-sm text-gray-600">{professionalRole}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span>{dateLabelCapitalized}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <span>{timeLabel} hrs · {appointment.duration} min</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    {appointment.modality === 'ONLINE' ? (
                                        <Video className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                    )}
                                    <span>
                                        {appointment.modality === 'ONLINE' ? 'Online (videollamada)' : 'Presencial'}
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
                                    <span className="font-medium text-gray-900">Valor de la sesión</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatPrice(appointment.payment.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Provider Selector */}
                        <div className="card p-8 mb-6">
                            <h2 className="text-lg font-semibold text-gray-500 mb-2 flex items-center gap-2 flex-wrap">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                Elige tu medio de pago
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                                    No disponible por ahora
                                </span>
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Por ahora PsyDoctor no intermedia los pagos: el profesional define cómo y cuándo cobrar, y te contactará para coordinarlo.
                            </p>

                            {professionalPaymentLabels.length > 0 && (
                                <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                                    <p className="text-sm font-semibold text-emerald-900 mb-2">
                                        {professionalName} acepta:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {professionalPaymentLabels.map((label) => (
                                            <span
                                                key={label}
                                                className="px-3 py-1 bg-white text-emerald-800 rounded-full text-xs font-medium border border-emerald-200"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                    {appointment.professional.paymentNotes && (
                                        <p className="mt-3 text-sm text-emerald-900/80 leading-relaxed">
                                            {appointment.professional.paymentNotes}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3 opacity-50 pointer-events-none select-none" aria-disabled="true">
                                {PROVIDERS.map((provider) => {
                                    return (
                                        <div
                                            key={provider.id}
                                            className="relative flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
                                        >
                                            <div className="mt-1">
                                                <input
                                                    type="radio"
                                                    name="paymentProvider"
                                                    checked={false}
                                                    disabled
                                                    readOnly
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
                        <Link
                            href="/dashboard"
                            className="btn-primary w-full flex items-center justify-center gap-2 mb-4 text-base py-3"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Ir a mis citas
                        </Link>

                        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-gray-400" />
                            Puedes reprogramar o cancelar hasta 24h antes sin costo.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
