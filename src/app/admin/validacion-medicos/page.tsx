'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Loader2,
    CheckCircle,
    XCircle,
    FileText,
    ExternalLink,
    AlertCircle,
    X
} from 'lucide-react'

interface Professional {
    id: string
    userId: string
    name: string | null
    email: string
    rut: string | null
    licenseNumber: string | null
    licensePdfUrl: string | null
    professionalType: string
    specialties: string[]
    createdAt: string
}

const professionalTypeLabels: Record<string, string> = {
    PSYCHOLOGIST: 'Psicólogo',
    PSYCHIATRIST: 'Psiquiatra',
    CLINICAL_PSYCHOLOGIST: 'Psicólogo Clínico',
    THERAPIST: 'Terapeuta',
    COUNSELOR: 'Consejero',
    OTHER: 'Otro',
}

export default function ValidacionesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [professionals, setProfessionals] = useState<Professional[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [sendingEmail, setSendingEmail] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/403')
        }
    }, [status, session, router])

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await fetch('/api/admin/pending-professionals')
                if (response.ok) {
                    const data = await response.json()
                    setProfessionals(data)
                }
            } catch (error) {
                console.error('Error fetching professionals:', error)
            } finally {
                setIsLoading(false)
            }
        }
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            fetchPending()
        }
    }, [status, session])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowRejectModal(false)
                setRejectionReason('')
            }
        }
        if (showRejectModal) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showRejectModal])

    const handleApprove = async (professionalId: string) => {
        setProcessing(professionalId)
        try {
            const response = await fetch('/api/admin/verify-professional', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ professionalId, action: 'approve' }),
            })
            if (response.ok) {
                setProfessionals(prev => prev.filter(p => p.id !== professionalId))
            }
        } catch (error) {
            console.error('Error approving professional:', error)
        } finally {
            setProcessing(null)
        }
    }

    const openRejectModal = (professional: Professional) => {
        setSelectedProfessional(professional)
        setShowRejectModal(true)
    }

    const handleReject = async () => {
        if (!selectedProfessional || !rejectionReason.trim()) return

        setSendingEmail(true)
        try {
            const response = await fetch('/api/admin/verify-professional', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professionalId: selectedProfessional.id,
                    action: 'reject',
                    rejectionReason: rejectionReason.trim(),
                }),
            })
            if (response.ok) {
                setProfessionals(prev => prev.filter(p => p.id !== selectedProfessional.id))
                setShowRejectModal(false)
                setSelectedProfessional(null)
                setRejectionReason('')
            }
        } catch (error) {
            console.error('Error rejecting professional:', error)
        } finally {
            setSendingEmail(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!session || session.user?.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Validación de Profesionales</h1>
                    <p className="text-gray-500">Revisa y valida solicitudes de profesionales</p>
                </div>
                {professionals.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {professionals.length} pendiente{professionals.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {professionals.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Todo al día 🎉</h2>
                    <p className="text-gray-500">No hay profesionales pendientes de validación</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {professionals.map((professional) => (
                                    <tr key={professional.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{professional.name || 'Sin nombre'}</p>
                                                {professional.specialties.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {professional.specialties.slice(0, 2).map((s) => (
                                                            <span key={s} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 font-mono text-sm">
                                            {professional.rut || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {professional.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                {professionalTypeLabels[professional.professionalType] || professional.professionalType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {formatDate(professional.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {professional.licensePdfUrl ? (
                                                <a
                                                    href={professional.licensePdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Ver PDF
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : professional.licenseNumber ? (
                                                <span className="text-gray-500 text-sm">
                                                    Lic: {professional.licenseNumber}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(professional.id)}
                                                    disabled={processing === professional.id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {processing === professional.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(professional)}
                                                    disabled={processing === professional.id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Rechazar profesional
                            </h2>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Estás a punto de rechazar la solicitud de:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="font-medium text-gray-900">{selectedProfessional?.name}</p>
                                <p className="text-sm text-gray-500">{selectedProfessional?.email}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo del rechazo <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ej: Documentación incompleta, título no válido, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Este motivo será enviado al profesional por email
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || sendingEmail}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {sendingEmail ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Rechazar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
