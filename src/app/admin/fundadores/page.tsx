'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Loader2,
    CheckCircle2,
    XCircle,
    FileSpreadsheet,
    ShieldAlert,
    ShieldCheck,
    Search,
    AlertCircle,
    Sparkles,
    Calendar,
    Award
} from 'lucide-react'

interface FounderApplication {
    id: string
    nombreCompleto: string
    rut: string
    profesion: string
    registroSuperintendencia: string
    email: string
    telefono: string
    modalidadAtencion: string
    comunaRegion: string
    estado: 'pendiente' | 'aprobado' | 'rechazado'
    motivoRechazo: string | null
    verificadoEnRegistro: boolean
    numeroCupo: number | null
    fechaAceptacion: string
    versionTerminos: string
    fechaInicioBeneficio: string | null
    fechaFinBeneficio: string | null
    createdAt: string
}

export default function AdminFundadoresPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [applications, setApplications] = useState<FounderApplication[]>([])
    const [approvedCount, setApprovedCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('todos')

    // Modal de rechazo
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectApp, setRejectApp] = useState<FounderApplication | null>(null)
    const [motivoRechazo, setMotivoRechazo] = useState('')
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/403')
        }
    }, [status, session, router])

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/fundadores')
            if (res.ok) {
                const data = await res.json()
                setApplications(data.applications || [])
                setApprovedCount(data.approvedCount || 0)
            }
        } catch (error) {
            console.error('Error cargando postulaciones:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchApplications()
        }
    }, [status, session])

    const handleApprove = async (app: FounderApplication) => {
        if (approvedCount >= 20) {
            alert('Cupos completos. No es posible aprobar más de 20 profesionales fundadores.')
            return
        }

        if (!confirm(`¿Aprobar a ${app.nombreCompleto} como Profesional Fundador? Se asignará correlativamente el cupo N° ${approvedCount + 1} de 20 y 12 meses de beneficio.`)) {
            return
        }

        setProcessingId(app.id)
        setActionError('')
        try {
            const res = await fetch('/api/admin/fundadores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: app.id, action: 'aprobar' }),
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Error al aprobar')
            } else {
                await fetchApplications()
            }
        } catch (err) {
            alert('Error de conexión al aprobar')
        } finally {
            setProcessingId(null)
        }
    }

    const handleToggleVerificado = async (app: FounderApplication) => {
        setProcessingId(app.id)
        try {
            const res = await fetch('/api/admin/fundadores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: app.id,
                    action: 'toggle-verificado',
                    verificadoEnRegistro: !app.verificadoEnRegistro,
                }),
            })
            if (res.ok) {
                await fetchApplications()
            }
        } catch (err) {
            console.error('Error al cambiar verificación:', err)
        } finally {
            setProcessingId(null)
        }
    }

    const openRejectModal = (app: FounderApplication) => {
        setRejectApp(app)
        setMotivoRechazo('')
        setShowRejectModal(true)
    }

    const handleConfirmReject = async () => {
        if (!rejectApp) return
        if (!motivoRechazo.trim()) {
            setActionError('El motivo de rechazo es obligatorio.')
            return
        }

        setProcessingId(rejectApp.id)
        try {
            const res = await fetch('/api/admin/fundadores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: rejectApp.id,
                    action: 'rechazar',
                    motivoRechazo: motivoRechazo.trim(),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setActionError(data.error || 'Error al rechazar')
            } else {
                setShowRejectModal(false)
                setRejectApp(null)
                await fetchApplications()
            }
        } catch (err) {
            setActionError('Error de conexión al rechazar')
        } finally {
            setProcessingId(null)
        }
    }

    const handleExportCSV = () => {
        window.open('/api/admin/fundadores?format=csv', '_blank')
    }

    const filtered = applications.filter((app) => {
        const matchesStatus = filterStatus === 'todos' || app.estado === filterStatus
        const q = searchTerm.toLowerCase()
        const matchesSearch =
            app.nombreCompleto.toLowerCase().includes(q) ||
            app.rut.toLowerCase().includes(q) ||
            app.email.toLowerCase().includes(q) ||
            app.registroSuperintendencia.toLowerCase().includes(q) ||
            app.comunaRegion.toLowerCase().includes(q)
        return matchesStatus && matchesSearch
    })

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-teal-600" />
                        <span>Postulaciones Programa Profesionales Fundadores</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Control de cupos, validación manual en el Registro de la Superintendencia y activación de 12 meses de beneficio.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        <span>Exportar a CSV</span>
                    </button>
                </div>
            </div>

            {/* Cupos Counter Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                            Cupos Asignados
                        </span>
                        <Award className="h-5 w-5 text-teal-700" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-teal-950">{approvedCount}</span>
                        <span className="text-sm font-semibold text-teal-700">/ 20 cupos</span>
                    </div>
                    {approvedCount >= 20 ? (
                        <span className="mt-2 inline-block rounded-full bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 text-xs">
                            Cupos completos (bloqueado)
                        </span>
                    ) : (
                        <span className="mt-2 inline-block text-xs text-teal-700">
                            {20 - approvedCount} cupo(s) disponible(s)
                        </span>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Postulaciones Pendientes
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">
                            {applications.filter((a) => a.estado === 'pendiente').length}
                        </span>
                        <span className="text-xs text-slate-500">por revisar</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                        Ningún perfil se publica sin aprobación manual.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Postulaciones
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{applications.length}</span>
                        <span className="text-xs text-slate-500">recibidas</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                        Términos aceptados: Versión 1.0
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, RUT, registro o comuna..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-medium text-slate-600">Estado:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:border-teal-600"
                    >
                        <option value="todos">Todos ({applications.length})</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="aprobado">Aprobados ({approvedCount})</option>
                        <option value="rechazado">Rechazados</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Cargando postulaciones...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs">
                        No hay postulaciones que coincidan con el filtro actual.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Cupo</th>
                                    <th className="px-4 py-3">Postulante</th>
                                    <th className="px-4 py-3">Registro SuperSalud</th>
                                    <th className="px-4 py-3">Modalidad / Comuna</th>
                                    <th className="px-4 py-3">Aceptación & Versión</th>
                                    <th className="px-4 py-3">Vigencia Beneficio</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-4 py-3.5 font-bold">
                                            {app.numeroCupo ? (
                                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-teal-100 text-teal-900 font-extrabold text-xs">
                                                    #{app.numeroCupo}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-mono">—</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-slate-900">{app.nombreCompleto}</div>
                                            <div className="text-[11px] text-slate-500 font-mono">{app.rut}</div>
                                            <div className="text-[11px] text-teal-700 font-medium capitalize">
                                                {app.profesion === 'psicologo' ? 'Psicólogo/a' : 'Psiquiatra'}
                                            </div>
                                            <div className="text-[11px] text-slate-400">{app.email} · {app.telefono}</div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="font-mono font-semibold text-slate-900">
                                                N° {app.registroSuperintendencia}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVerificado(app)}
                                                disabled={processingId === app.id}
                                                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                                    app.verificadoEnRegistro
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {app.verificadoEnRegistro ? (
                                                    <>
                                                        <ShieldCheck className="h-3 w-3 text-emerald-700" />
                                                        <span>Verificado en el Registro</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldAlert className="h-3 w-3 text-slate-400" />
                                                        <span>Marcar verificado</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="capitalize text-slate-800 font-medium">{app.modalidadAtencion}</div>
                                            <div className="text-[11px] text-slate-500">{app.comunaRegion}</div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="text-slate-700">
                                                {new Date(app.fechaAceptacion).toLocaleDateString('es-CL', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Versión: <strong>{app.versionTerminos}</strong>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            {app.fechaInicioBeneficio && app.fechaFinBeneficio ? (
                                                <div className="text-[11px]">
                                                    <div className="text-emerald-700 font-medium flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>12 meses activos</span>
                                                    </div>
                                                    <div className="text-slate-500">
                                                        Hasta: {new Date(app.fechaFinBeneficio).toLocaleDateString('es-CL')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-[11px]">No iniciada</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    app.estado === 'aprobado'
                                                        ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                                        : app.estado === 'rechazado'
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}
                                            >
                                                {app.estado}
                                            </span>
                                            {app.motivoRechazo && (
                                                <div className="text-[10px] text-rose-600 mt-1 max-w-[150px] truncate" title={app.motivoRechazo}>
                                                    Motivo: {app.motivoRechazo}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                            {app.estado === 'pendiente' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(app)}
                                                        disabled={processingId === app.id || approvedCount >= 20}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs disabled:opacity-40 transition"
                                                    >
                                                        {processingId === app.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        )}
                                                        <span>Aprobar</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openRejectModal(app)}
                                                        disabled={processingId === app.id}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition"
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                        <span>Rechazar</span>
                                                    </button>
                                                </>
                                            )}

                                            {app.estado === 'aprobado' && (
                                                <span className="text-[11px] text-teal-700 font-semibold">
                                                    Fundador #{app.numeroCupo} activo
                                                </span>
                                            )}

                                            {app.estado === 'rechazado' && (
                                                <span className="text-[11px] text-rose-500 font-medium">
                                                    Postulación rechazada
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Rechazo con Motivo Obligatorio */}
            {showRejectModal && rejectApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-scale-in">
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                            Rechazar Postulación
                        </h3>
                        <p className="text-xs text-slate-600 mb-4">
                            Estás rechazando a <strong>{rejectApp.nombreCompleto}</strong> (RUT: {rejectApp.rut}). Debes indicar obligatoriamente el motivo fundamentado.
                        </p>

                        {actionError && (
                            <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 mb-3 flex items-start gap-1.5">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{actionError}</span>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Motivo de rechazo <span className="text-rose-600">*</span>
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                                placeholder="Ej. No figura en el Registro de Prestadores Individuales o la cédula no coincide..."
                                className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:border-rose-600"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectApp(null)
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                disabled={processingId === rejectApp.id}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {processingId === rejectApp.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                <span>Confirmar Rechazo</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
