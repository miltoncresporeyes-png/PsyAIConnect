'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
    Loader2,
    ArrowLeft,
    User,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    AlertTriangle,
    Ban,
    RotateCcw,
    Save,
    Stethoscope,
    Shield,
    ShieldOff
} from 'lucide-react'
import { BackButton } from '../../../../components/ui/BackButton'

interface UserDetail {
    id: string
    email: string
    name: string | null
    phone: string | null
    role: string
    createdAt: string
    isActive: boolean
    adminNotes: string | null
    patientProfile: {
        rut: string | null
        birthDate: string | null
        gender: string | null
        region: string | null
        comuna: string | null
    } | null
    professional: {
        rut: string | null
        licenseNumber: string | null
        professionalType: string
        specialties: string[]
        verificationStatus: string
        isPublic: boolean
    } | null
    appointments: {
        id: string
        scheduledAt: string
        status: string
        modality: string
        professionalName: string | null
        payment: {
            amount: number
            status: string
        } | null
    }[]
}

const roleLabels: Record<string, string> = {
    PATIENT: 'Paciente',
    PROFESSIONAL: 'Profesional',
    ADMIN: 'Administrador',
}

const statusLabels: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: 'Confirmada', class: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completada', class: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Cancelada', class: 'bg-red-100 text-red-700' },
    NO_SHOW: { label: 'No asistió', class: 'bg-gray-100 text-gray-700' },
}

const paymentStatusLabels: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-700' },
    COMPLETED: { label: 'Pagado', class: 'bg-green-100 text-green-700' },
    REFUNDED: { label: 'Reembolsado', class: 'bg-purple-100 text-purple-700' },
    FAILED: { label: 'Fallido', class: 'bg-red-100 text-red-700' },
}

export default function UserDetailPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const userId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined
    const [user, setUser] = useState<UserDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [adminNotes, setAdminNotes] = useState('')
    const [savingNotes, setSavingNotes] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/403')
        }
    }, [status, session, router])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!userId) return
                const response = await fetch(`/api/admin/users/${userId}`)
                if (response.ok) {
                    const data = await response.json()
                    setUser(data)
                    setAdminNotes(data.adminNotes || '')
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setIsLoading(false)
            }
        }
        if (status === 'authenticated' && session?.user?.role === 'ADMIN' && userId) {
            fetchUser()
        }
    }, [status, session, userId])

    const handleSaveNotes = async () => {
        setSavingNotes(true)
        try {
            if (!userId) return
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateNotes', adminNotes }),
            })
            if (response.ok) {
                setMessage({ type: 'success', text: 'Notas guardadas' })
                setTimeout(() => setMessage(null), 3000)
            }
        } catch (error) {
            console.error('Error saving notes:', error)
            setMessage({ type: 'error', text: 'Error al guardar notas' })
        } finally {
            setSavingNotes(false)
        }
    }

    const handleBan = async () => {
        if (!confirm(`¿Estás seguro de banear a ${user?.name || user?.email}?`)) return
        setActionLoading('ban')
        try {
            if (!userId) return
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: user?.isActive ? 'ban' : 'unban' }),
            })
            if (response.ok) {
                setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
                setMessage({ type: 'success', text: user?.isActive ? 'Usuario baneado' : 'Usuario desbaneado' })
                setTimeout(() => setMessage(null), 3000)
            }
        } catch (error) {
            console.error('Error banning user:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleResetPassword = async () => {
        setActionLoading('reset')
        try {
            if (!userId) return
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resetPassword' }),
            })
            if (response.ok) {
                setMessage({ type: 'success', text: 'Email de recuperación enviado' })
                setTimeout(() => setMessage(null), 3000)
            }
        } catch (error) {
            console.error('Error resetting password:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Usuario no encontrado</p>
                <Link href="/admin/usuarios" className="text-blue-600 hover:underline mt-2 inline-block">
                    Volver a usuarios
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton href="/admin/usuarios" variant="chevron" />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {user.name || 'Sin nombre'}
                    </h1>
                    <p className="text-gray-500">{user.email}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Datos Personales
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-medium text-gray-900">{user.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">RUT</p>
                                <p className="font-medium text-gray-900">{user.patientProfile?.rut || user.professional?.rut || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {user.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Teléfono</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {user.phone || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rol</p>
                                <p className="font-medium text-gray-900">{roleLabels[user.role] || user.role}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fecha de registro</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </div>

                        {user.professional && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5" />
                                    Datos Profesionales
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Tipo</p>
                                        <p className="font-medium text-gray-900">{user.professional.professionalType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Licencia</p>
                                        <p className="font-medium text-gray-900">{user.professional.licenseNumber || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Especialidades</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.professional.specialties.map(s => (
                                                <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Estado verificación</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded mt-1 ${
                                            user.professional.verificationStatus === 'VERIFIED' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {user.professional.verificationStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Historial de Citas
                        </h2>
                        {user.appointments.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay citas registradas</p>
                        ) : (
                            <div className="space-y-3">
                                {user.appointments.map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{apt.professionalName}</p>
                                            <p className="text-sm text-gray-500">{formatDate(apt.scheduledAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusLabels[apt.status]?.class}`}>
                                                {statusLabels[apt.status]?.label || apt.status}
                                            </span>
                                            {apt.payment && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatCurrency(apt.payment.amount)} - 
                                                    <span className={`ml-1 ${paymentStatusLabels[apt.payment.status]?.class.replace('bg-', 'text-')}`}>
                                                        {paymentStatusLabels[apt.payment.status]?.label || apt.payment.status}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Acciones
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={handleBan}
                                disabled={actionLoading === 'ban'}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    user.isActive
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                } disabled:opacity-50`}
                            >
                                {actionLoading === 'ban' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : user.isActive ? (
                                    <>
                                        <Ban className="w-4 h-4" />
                                        Banear Usuario
                                    </>
                                ) : (
                                    <>
                                        <ShieldOff className="w-4 h-4" />
                                        Desbanear Usuario
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={actionLoading === 'reset'}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {actionLoading === 'reset' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        Resetear Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Notas Internas
                        </h2>
                        <p className="text-sm text-gray-500 mb-3">
                            Notas privadas solo visibles para administradores
                        </p>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Ej: Cliente VIP, Usuario conflictivo, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={4}
                        />
                        <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {savingNotes ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Guardar Notas
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
