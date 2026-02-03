import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { Check, Calendar, Video, Mail } from 'lucide-react'

interface Props {
    params: { id: string }
}

export default function CitaExitoPage({ params }: Props) {
    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="max-w-md mx-auto text-center px-4">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                        ¡Cita confirmada!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Tu pago fue procesado correctamente y tu cita está agendada.
                    </p>

                    {/* What's next */}
                    <div className="card p-6 text-left mb-8">
                        <h3 className="font-semibold text-gray-900 mb-4">¿Qué sigue?</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Revisa tu email</p>
                                    <p className="text-sm text-gray-600">
                                        Te enviamos la confirmación con todos los detalles.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Agrega a tu calendario</p>
                                    <p className="text-sm text-gray-600">
                                        Te enviaremos un recordatorio antes de la sesión.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Video className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Prepárate para tu sesión</p>
                                    <p className="text-sm text-gray-600">
                                        El link de videollamada estará en tu dashboard.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/dashboard/citas" className="btn-primary flex-1">
                            Ver mis citas
                        </Link>
                        <Link href="/" className="btn-secondary flex-1">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
