'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import {
    Loader2, User, Mail, Shield, Download, Trash2,
    PauseCircle, PlayCircle, AlertTriangle, Calendar, Info, CheckCircle2, X
} from 'lucide-react'

interface AccountStatus {
    role: string
    isActive: boolean
    isProfessional: boolean
    isSuspended: boolean
    professionalDetails?: {
        isActive: boolean
        isPublic: boolean
        suspendedAt: string | null
        suspendedUntil: string | null
        suspensionReason: string | null
    } | null
}

export default function CuentaPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [isExporting, setIsExporting] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
    const [isLoadingStatus, setIsLoadingStatus] = useState(true)

    // Modales
    const [showSuspendModal, setShowSuspendModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Formulario Suspensión
    const [suspendDias, setSuspendDias] = useState<number>(30)
    const [suspendMotivo, setSuspendMotivo] = useState('')
    const [isSuspending, setIsSuspending] = useState(false)

    // Formulario Baja
    const [confirmDeleteText, setConfirmDeleteText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/usuario/eliminar-cuenta')
            if (res.ok) {
                const data = await res.json()
                setAccountStatus(data)
            }
        } catch (err) {
            console.error('Error fetching account status:', err)
        } finally {
            setIsLoadingStatus(false)
        }
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchStatus()
        }
    }, [status])

    const showMsg = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleExportData = async () => {
        setIsExporting(true)
        try {
            const response = await fetch('/api/usuario/exportar-datos')
            if (!response.ok) throw new Error('Error al exportar')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `psydoctor-datos-${session?.user?.id?.slice(0, 8)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            showMsg('Tus datos han sido exportados correctamente.')
        } catch (err) {
            showMsg('Error al exportar datos personales', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    const handleSuspend = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSuspending(true)
        try {
            const res = await fetch('/api/usuario/eliminar-cuenta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'suspender',
                    dias: suspendDias,
                    motivo: suspendMotivo,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                showMsg(data.error || 'Error al suspender cuenta', 'error')
            } else {
                showMsg(data.message || 'Cuenta suspendida temporalmente con éxito.')
                setShowSuspendModal(false)
                await fetchStatus()
            }
        } catch (err) {
            showMsg('Error de conexión al suspender cuenta', 'error')
        } finally {
            setIsSuspending(false)
        }
    }

    const handleReactivate = async () => {
        setIsSuspending(true)
        try {
            const res = await fetch('/api/usuario/eliminar-cuenta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reactivar' }),
            })

            const data = await res.json()
            if (!res.ok) {
                showMsg(data.error || 'Error al reactivar cuenta', 'error')
            } else {
                showMsg(data.message || 'Cuenta reactivada exitosamente.')
                await fetchStatus()
            }
        } catch (err) {
            showMsg('Error de conexión al reactivar cuenta', 'error')
        } finally {
            setIsSuspending(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (confirmDeleteText !== 'ELIMINAR MI CUENTA') {
            showMsg('Debes escribir exactamente "ELIMINAR MI CUENTA" para confirmar.', 'error')
            return
        }

        setIsDeleting(true)
        try {
            const res = await fetch('/api/usuario/eliminar-cuenta', {
                method: 'DELETE',
            })

            const data = await res.json()
            if (!res.ok) {
                showMsg(data.error || 'No fue posible dar de baja la cuenta', 'error')
                setIsDeleting(false)
            } else {
                showMsg('Tu cuenta ha sido dada de baja. Cerrando sesión...')
                setTimeout(() => {
                    signOut({ callbackUrl: '/' })
                }, 1500)
            }
        } catch (err) {
            showMsg('Error de conexión al eliminar la cuenta', 'error')
            setIsDeleting(false)
        }
    }

    if (status === 'loading' || isLoadingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    const isProfessional = session?.user?.role === 'PROFESSIONAL'
    const isSuspended = accountStatus?.isSuspended ?? false

    return (
        <>
            <Header />

            <div className="min-h-screen bg-slate-50 py-10">
                <div className="container-wide">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
                                Mi cuenta y privacidad
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Administra tu información personal, privacidad y el estado de tu cuenta en PsyDoctor.
                            </p>
                        </div>

                        {notification && (
                            <div
                                className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${
                                    notification.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}
                            >
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{notification.message}</span>
                            </div>
                        )}

                        {/* Banner de Estado de Suspensión (si aplica) */}
                        {isSuspended && (
                            <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-xs">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <PauseCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-base font-bold text-amber-950">
                                                {isProfessional
                                                    ? 'Tu perfil y agenda se encuentran temporalmente pausados'
                                                    : 'Tu cuenta se encuentra pausada'}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-amber-900/85 mt-1 leading-relaxed">
                                                {isProfessional
                                                    ? 'Tu perfil está oculto del directorio público y no estás recibiendo nuevas reservas de pacientes.'
                                                    : 'Tu cuenta está en pausa temporal y no recibes notificaciones activas.'}
                                                {accountStatus?.professionalDetails?.suspendedUntil && (
                                                    <span className="block font-semibold mt-1">
                                                        Pausa programada hasta:{' '}
                                                        {new Date(accountStatus.professionalDetails.suspendedUntil).toLocaleDateString('es-CL', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                )}
                                                {accountStatus?.professionalDetails?.suspensionReason && (
                                                    <span className="block text-xs text-amber-800 mt-0.5 italic">
                                                        Motivo: &ldquo;{accountStatus.professionalDetails.suspensionReason}&rdquo;
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleReactivate}
                                        disabled={isSuspending}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 text-xs font-semibold shadow-sm transition flex-shrink-0 disabled:opacity-60"
                                    >
                                        {isSuspending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <PlayCircle className="w-4 h-4" />
                                        )}
                                        <span>Reactivar ahora</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Profile Info */}
                        <div className="card p-6 rounded-2xl shadow-xs border border-slate-200 bg-white">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Información personal
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center overflow-hidden relative">
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || ''}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-teal-700" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                                        <p className="text-sm text-gray-500">{session?.user?.email}</p>
                                        <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                                            {isProfessional ? 'Profesional de Salud' : 'Paciente'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span>{session?.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span>
                                            Estado:{' '}
                                            <strong className={isSuspended ? 'text-amber-600' : 'text-emerald-700'}>
                                                {isSuspended ? 'Pausada' : 'Activa'}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gestión del Estado: Pausa temporal / Vacaciones */}
                        <div className="card p-6 rounded-2xl shadow-xs border border-slate-200 bg-white">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <PauseCircle className="w-5 h-5 text-teal-700" />
                                        <span>
                                            {isProfessional
                                                ? 'Pausa temporal de agenda y perfil'
                                                : 'Pausar temporalmente mi cuenta'}
                                        </span>
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                                        {isProfessional
                                            ? '¿Saldrás de vacaciones, licencia o capacitación? Puedes suspender temporalmente tu perfil por el tiempo que definas (ej. 15, 30 días o fecha personalizada). Tus pacientes existentes conservarán su historial y podrás reactivarte cuando quieras.'
                                            : 'Pausa tu cuenta para dejar de recibir recordatorios o notificaciones temporales sin perder tu historial clínico.'}
                                    </p>
                                </div>

                                {isSuspended ? (
                                    <button
                                        onClick={handleReactivate}
                                        disabled={isSuspending}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition flex-shrink-0 disabled:opacity-60"
                                    >
                                        <PlayCircle className="w-4 h-4" />
                                        <span>Reactivar perfil</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowSuspendModal(true)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-semibold shadow-xs transition flex-shrink-0"
                                    >
                                        <PauseCircle className="w-4 h-4 text-slate-600" />
                                        <span>Pausar por X tiempo</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Privacidad y Datos (Ley 19.628 / Derechos ARCO) */}
                        <div className="card p-6 rounded-2xl shadow-xs border border-slate-200 bg-white">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Derechos de privacidad y datos (Ley N° 19.628)
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                Conforme a la legislación chilena y normativas de salud (Ley N° 20.584), puedes exportar tu información o solicitar la baja definitiva.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="font-medium text-xs sm:text-sm text-gray-900">
                                            Exportar mis datos personales (Portabilidad)
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Descarga un archivo JSON con tu información registrada en la plataforma.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleExportData}
                                        disabled={isExporting}
                                        className="btn-secondary text-xs flex items-center gap-2 px-3.5 py-2"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        <span>Exportar</span>
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-xs sm:text-sm text-rose-700">
                                            Dar de baja definitivamente mi cuenta
                                        </p>
                                        <p className="text-xs text-gray-500 max-w-md">
                                            Eliminación permanente y anonimización de tus datos identificatorios conforme a la Ley N° 19.628. No se puede revertir.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Dar de baja</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Pausar / Suspender por X tiempo */}
            {showSuspendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-teal-800">
                                <PauseCircle className="w-6 h-6" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isProfessional ? 'Pausar perfil y agenda' : 'Pausar cuenta temporalmente'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSuspend} className="space-y-4 text-left">
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                                <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                                <p>
                                    {isProfessional
                                        ? 'Al suspender, tu perfil desaparecerá del directorio público de PsyDoctor y ningún nuevo paciente podrá agendar citas. Podrás reanudar tu atención en cualquier momento.'
                                        : 'Tu cuenta quedará en pausa sin recibir notificaciones ni alertas hasta que vuelvas a ingresar.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    ¿Por cuánto tiempo deseas pausar?
                                </label>
                                <select
                                    value={suspendDias}
                                    onChange={(e) => setSuspendDias(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                                >
                                    <option value={7}>1 semana (7 días)</option>
                                    <option value={15}>15 días</option>
                                    <option value={30}>1 mes (30 días)</option>
                                    <option value={60}>2 meses (60 días)</option>
                                    <option value={90}>3 meses (90 días)</option>
                                    <option value={180}>6 meses (180 días)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Motivo de la pausa (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={suspendMotivo}
                                    onChange={(e) => setSuspendMotivo(e.target.value)}
                                    placeholder="Ej. Vacaciones, capacitación, sobrecarga laboral..."
                                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSuspendModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSuspending}
                                    className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isSuspending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>Confirmar pausa de {suspendDias} días</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Baja Definitiva / Eliminar Cuenta */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-200">
                        <div className="flex items-center gap-3 text-rose-700 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Dar de baja definitivamente
                                </h3>
                                <p className="text-xs text-rose-600">Acción irreversible</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs text-slate-600 mb-5 leading-relaxed">
                            <p>
                                Conforme a la <strong>Ley N° 19.628</strong> (protección de datos) y la <strong>Ley N° 20.584</strong> (deberes y derechos en salud):
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-700">
                                <li>Tu acceso a la plataforma será cerrado inmediatamente.</li>
                                <li>Tus datos personales e identificatorios serán anonimizados.</li>
                                <li>No podrás darte de baja si tienes citas clínicas pendientes o futuras.</li>
                                <li>Si eres profesional, tu perfil e historial serán despublicados de forma definitiva.</li>
                            </ul>
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                                Para confirmar, escribe exactamente: <strong className="text-rose-700 select-all">ELIMINAR MI CUENTA</strong>
                            </label>
                            <input
                                type="text"
                                value={confirmDeleteText}
                                onChange={(e) => setConfirmDeleteText(e.target.value)}
                                placeholder="ELIMINAR MI CUENTA"
                                className="w-full rounded-xl border border-rose-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setConfirmDeleteText('')
                                }}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || confirmDeleteText !== 'ELIMINAR MI CUENTA'}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Confirmar baja definitiva</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}
