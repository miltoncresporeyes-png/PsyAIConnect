'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import {
    Loader2, ChevronLeft, Calendar, Clock, FileText,
    Plus, Save, Lock, Eye, EyeOff, Video, MapPin, ClipboardList
} from 'lucide-react'

interface Props {
    params: { id: string }
}

interface PatientData {
    patient: {
        id: string
        name: string
        email: string
        image: string | null
    }
    appointments: {
        id: string
        scheduledAt: string
        duration: number
        modality: string
        status: string
        consultationReason?: string
        hasNote: boolean
        hasIndicaciones: boolean
        note?: {
            content: string
            createdAt: string
        }
        indicaciones?: {
            content: string
            createdAt: string
        }
    }[]
    stats: {
        totalAppointments: number
        completedAppointments: number
        totalSpent: number
    }
}

export default function PatientDetailPage({ params }: Props) {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [data, setData] = useState<PatientData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // Note editing
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [editingIndicacionesId, setEditingIndicacionesId] = useState<string | null>(null)
    const [noteContent, setNoteContent] = useState('')
    const [indicacionesContent, setIndicacionesContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [showNotes, setShowNotes] = useState<Record<string, boolean>>({})
    const [showIndicaciones, setShowIndicaciones] = useState<Record<string, boolean>>({})

    const fetchPatientData = useCallback(async () => {
        try {
            const response = await fetch(`/api/profesional/pacientes/${params.id}`)
            if (!response.ok) {
                throw new Error('Paciente no encontrado')
            }
            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar')
        } finally {
            setIsLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchPatientData()
        }
    }, [status, router, params.id, fetchPatientData])

    const handleSaveNote = async (appointmentId: string) => {
        if (!noteContent.trim()) return

        setIsSaving(true)
        try {
            const response = await fetch('/api/notas-clinicas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    content: noteContent,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al guardar nota')
            }

            await fetchPatientData()
            setEditingNoteId(null)
            setNoteContent('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveIndicaciones = async (appointmentId: string) => {
        if (!indicacionesContent.trim()) return

        setIsSaving(true)
        try {
            const response = await fetch('/api/notas-clinicas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    indicaciones: indicacionesContent,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al guardar indicaciones')
            }

            await fetchPatientData()
            setEditingIndicacionesId(null)
            setIndicacionesContent('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar')
        } finally {
            setIsSaving(false)
        }
    }

    const toggleNoteVisibility = (aptId: string) => {
        setShowNotes(prev => ({ ...prev, [aptId]: !prev[aptId] }))
    }

    const toggleIndicacionesVisibility = (aptId: string) => {
        setShowIndicaciones(prev => ({ ...prev, [aptId]: !prev[aptId] }))
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    if (error && !data) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Link href="/dashboard/pacientes" className="btn-primary">
                            Volver a pacientes
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    if (!data) return null

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        {/* Back */}
                        <Link
                            href="/dashboard/pacientes"
                            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Volver a pacientes
                        </Link>

                        {/* Patient Header */}
                        <div className="card p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center overflow-hidden relative">
                                    {data.patient.image ? (
                                        <Image
                                            src={data.patient.image}
                                            alt={data.patient.name}
                                            width={64}
                                            height={64}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary-600">
                                            {data.patient.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-heading font-bold text-gray-900">
                                        {data.patient.name}
                                    </h1>
                                    <p className="text-gray-500">{data.patient.email}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {data.stats.totalAppointments}
                                    </p>
                                    <p className="text-sm text-gray-500">Sesiones totales</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {data.stats.completedAppointments}
                                    </p>
                                    <p className="text-sm text-gray-500">Completadas</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatPrice(data.stats.totalSpent)}
                                    </p>
                                    <p className="text-sm text-gray-500">Total pagado</p>
                                </div>
                            </div>
                        </div>

                        {/* Appointments with Notes */}
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Historial de sesiones
                        </h2>

                        <div className="space-y-4">
                            {data.appointments.map(apt => {
                                const aptDate = new Date(apt.scheduledAt)
                                const isEditingNote = editingNoteId === apt.id
                                const isEditingIndicaciones = editingIndicacionesId === apt.id
                                const isNoteVisible = showNotes[apt.id]
                                const isIndicacionesVisible = showIndicaciones[apt.id]

                                return (
                                    <div key={apt.id} className="card p-6">
                                        {/* Appointment Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {aptDate.toLocaleDateString('es-CL', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {aptDate.toLocaleTimeString('es-CL', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    {apt.modality === 'ONLINE' ? (
                                                        <Video className="w-4 h-4" />
                                                    ) : (
                                                        <MapPin className="w-4 h-4" />
                                                    )}
                                                </span>
                                            </div>
                                            <span className={`badge ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {apt.status === 'COMPLETED' ? 'Completada' :
                                                    apt.status === 'CONFIRMED' ? 'Confirmada' : apt.status}
                                            </span>
                                        </div>

                                        {/* Consultation Reason */}
                                        {apt.consultationReason && (
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                                                <p className="text-gray-500 text-xs mb-1">Motivo de consulta</p>
                                                <p className="text-gray-700">{apt.consultationReason}</p>
                                            </div>
                                        )}

                                        {/* Clinical Note */}
                                        <div className="border-t border-gray-100 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Nota clínica
                                                    </span>
                                                </div>

                                                {apt.hasNote && apt.note && !isEditingNote && (
                                                    <button
                                                        onClick={() => toggleNoteVisibility(apt.id)}
                                                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                                    >
                                                        {isNoteVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        {isNoteVisible ? 'Ocultar' : 'Ver'}
                                                    </button>
                                                )}
                                            </div>

                                            {isEditingNote ? (
                                                <div>
                                                    <textarea
                                                        value={noteContent}
                                                        onChange={(e) => setNoteContent(e.target.value)}
                                                        className="input min-h-[120px] text-sm"
                                                        placeholder="Escribe tus notas de la sesión... Solo tú podrás verlas."
                                                    />
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => handleSaveNote(apt.id)}
                                                            disabled={isSaving}
                                                            className="btn-primary text-sm flex items-center gap-2"
                                                        >
                                                            {isSaving ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Save className="w-4 h-4" />
                                                            )}
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingNoteId(null)
                                                                setNoteContent('')
                                                            }}
                                                            className="btn-secondary text-sm"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : apt.hasNote && apt.note ? (
                                                isNoteVisible && (
                                                    <div className="bg-yellow-50 rounded-lg p-4 text-sm">
                                                        <p className="text-gray-700 whitespace-pre-line">
                                                            {apt.note.content}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            Guardada: {new Date(apt.note.createdAt).toLocaleDateString('es-CL')}
                                                        </p>
                                                    </div>
                                                )
                                            ) : apt.status === 'COMPLETED' ? (
                                                <button
                                                    onClick={() => setEditingNoteId(apt.id)}
                                                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Agregar nota
                                                </button>
                                            ) : (
                                                <p className="text-sm text-gray-400">
                                                    Podrás agregar notas después de la sesión
                                                </p>
                                            )}
                                        </div>

                                        {/* Indicaciones (Treatment Instructions) */}
                                        <div className="border-t border-gray-100 pt-4 mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardList className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Indicaciones de tratamiento
                                                    </span>
                                                </div>

                                                {apt.hasIndicaciones && apt.indicaciones && !isEditingIndicaciones && (
                                                    <button
                                                        onClick={() => toggleIndicacionesVisibility(apt.id)}
                                                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                                    >
                                                        {isIndicacionesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        {isIndicacionesVisible ? 'Ocultar' : 'Ver'}
                                                    </button>
                                                )}
                                            </div>

                                            {isEditingIndicaciones ? (
                                                <div>
                                                    <textarea
                                                        value={indicacionesContent}
                                                        onChange={(e) => setIndicacionesContent(e.target.value)}
                                                        className="input min-h-[120px] text-sm"
                                                        placeholder="Indicaciones para el paciente: ejercicios, tareas, recomendaciones, seguimiento..."
                                                    />
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => handleSaveIndicaciones(apt.id)}
                                                            disabled={isSaving}
                                                            className="btn-primary text-sm flex items-center gap-2"
                                                        >
                                                            {isSaving ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Save className="w-4 h-4" />
                                                            )}
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingIndicacionesId(null)
                                                                setIndicacionesContent('')
                                                            }}
                                                            className="btn-secondary text-sm"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : apt.hasIndicaciones && apt.indicaciones ? (
                                                isIndicacionesVisible && (
                                                    <div className="bg-blue-50 rounded-lg p-4 text-sm">
                                                        <p className="text-gray-700 whitespace-pre-line">
                                                            {apt.indicaciones.content}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            Guardada: {new Date(apt.indicaciones.createdAt).toLocaleDateString('es-CL')}
                                                        </p>
                                                    </div>
                                                )
                                            ) : apt.status === 'COMPLETED' ? (
                                                <button
                                                    onClick={() => setEditingIndicacionesId(apt.id)}
                                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Agregar indicaciones
                                                </button>
                                            ) : (
                                                <p className="text-sm text-gray-400">
                                                    Podrás agregar indicaciones después de la sesión
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
