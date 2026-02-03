'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import {
    Loader2, User, Mail, Phone, Download, Shield,
    Bell, LogOut, Trash2
} from 'lucide-react'

export default function CuentaPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [isExporting, setIsExporting] = useState(false)
    const [notification, setNotification] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    const handleExportData = async () => {
        setIsExporting(true)
        try {
            const response = await fetch('/api/usuario/exportar-datos')
            if (!response.ok) throw new Error('Error al exportar')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `psyconnect-data-${session?.user?.id?.slice(0, 8)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            setNotification('Datos exportados correctamente')
            setTimeout(() => setNotification(''), 3000)
        } catch (err) {
            setNotification('Error al exportar datos')
        } finally {
            setIsExporting(false)
        }
    }

    if (status === 'loading') {
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
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-8">
                            Mi cuenta
                        </h1>

                        {notification && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {notification}
                            </div>
                        )}

                        {/* Profile Info */}
                        <div className="card p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Información personal
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden relative">
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || ''}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-primary-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                                        <p className="text-sm text-gray-500">{session?.user?.email}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span>{session?.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        <span>
                                            {session?.user?.role === 'PROFESSIONAL' ? 'Profesional' : 'Paciente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Data */}
                        <div className="card p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Privacidad y datos
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Exportar mis datos</p>
                                        <p className="text-sm text-gray-500">
                                            Descarga una copia de tus datos personales
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleExportData}
                                        disabled={isExporting}
                                        className="btn-secondary text-sm flex items-center gap-2"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Exportar
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">Eliminar mi cuenta</p>
                                            <p className="text-sm text-gray-500">
                                                Elimina permanentemente tu cuenta y datos
                                            </p>
                                        </div>
                                        <button
                                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications (placeholder) */}
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Notificaciones
                            </h2>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <p className="font-medium text-gray-900">Recordatorios de cita</p>
                                        <p className="text-sm text-gray-500">
                                            Recibe un email 24h antes de tu cita
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <p className="font-medium text-gray-900">Newsletter</p>
                                        <p className="text-sm text-gray-500">
                                            Tips de bienestar y novedades
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
