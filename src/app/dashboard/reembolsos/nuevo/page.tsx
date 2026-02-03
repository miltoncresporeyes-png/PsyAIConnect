/**
 * New Reimbursement Request Page
 * 
 * Simplified wizard for creating reimbursement requests
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import IsapreGuide from '@/components/reimbursement/IsapreGuide'
import type { IsapreGuide as IsapreGuideType } from '@/lib/isapreGuides'

interface EligibleSession {
    id: string
    date: string
    professional: {
        name: string
    }
    duration: number
    invoice: {
        number: string
        brutAmount: number
        netAmount: number
    }
}

export default function NewReimbursementPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Step 1: Session Selection
    const [sessions, setSessions] = useState<EligibleSession[]>([])
    const [selectedSessions, setSelectedSessions] = useState<string[]>([])

    // Step 2: Validation
    const [hasMedicalReferral, setHasMedicalReferral] = useState<boolean | null>(null)

    // Step 3: Kit Generation
    const [requestId, setRequestId] = useState<string | null>(null)
    const [kitUrl, setKitUrl] = useState<string | null>(null)

    // Step 4: Guide
    const [guide, setGuide] = useState<IsapreGuideType | null>(null)

    useEffect(() => {
        loadEligibleSessions()
    }, [])

    const loadEligibleSessions = async () => {
        try {
            const res = await fetch('/api/reembolsos/eligible-sessions')
            if (res.ok) {
                const data = await res.json()
                setSessions(data.sessions)
            }
        } catch (error) {
            console.error('Error loading sessions:', error)
        }
    }

    const handleCreateRequest = async () => {
        setLoading(true)
        try {
            console.log('Creating request with:', {
                appointmentIds: selectedSessions,
                hasMedicalReferral: hasMedicalReferral || false
            })

            const res = await fetch('/api/reembolsos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentIds: selectedSessions,
                    hasMedicalReferral: hasMedicalReferral || false
                })
            })

            console.log('Response status:', res.status)
            const data = await res.json()
            console.log('Response data:', data)

            if (res.ok) {
                setRequestId(data.id)

                // Load guide for patient's Isapre
                if (data.isapreName) {
                    const isapreSlug = data.isapreName.toLowerCase().split(' ')[1] // Simple slug extraction
                    const guideRes = await fetch(`/api/reembolsos/guide/${isapreSlug}`)
                    if (guideRes.ok) {
                        const guideData = await guideRes.json()
                        setGuide(guideData)
                    }
                }

                setStep(3)
            } else {
                console.error('Error response:', data)
                alert(`Error al crear solicitud: ${data.error || 'Error desconocido'}`)
            }
        } catch (error) {
            console.error('Error creating request:', error)
            alert('Error al crear solicitud. Por favor verifica la consola.')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateKit = async () => {
        if (!requestId) return

        setLoading(true)
        try {
            const res = await fetch(`/api/reembolsos/${requestId}/generate-kit`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()

                // Actualizar estado
                setKitUrl(data.kitUrl)

                // Convertir base64 a Blob para forzar descarga correcta
                try {
                    // El string base64 viene como "data:application/pdf;base64,....."
                    const base64Data = data.kitUrl.split(',')[1]
                    const byteCharacters = atob(base64Data)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    const blob = new Blob([byteArray], { type: 'application/pdf' })

                    // Crear URL del Blob
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    // Usar el nombre del archivo del backend o uno por defecto con fecha
                    const filename = data.filename || `kit-reembolso-${new Date().getTime()}.pdf`
                    link.setAttribute('download', filename)
                    document.body.appendChild(link)
                    link.click()

                    // Limpieza
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                } catch (e) {
                    console.error('Error downloading blob:', e)
                    // Fallback al método anterior si falla la conversión
                    const link = document.createElement('a')
                    link.href = data.kitUrl
                    link.download = data.filename || 'kit-reembolso.pdf'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                }

                setStep(4)
            } else {
                const errorData = await res.json()
                console.error('Error generating kit:', errorData)
                alert(`Error al generar kit: ${errorData.error || 'Error desconocido'}`)
            }
        } catch (error) {
            console.error('Error generating kit:', error)
            alert('Error al generar kit de reembolso')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsSubmitted = async () => {
        if (!requestId) return

        try {
            await fetch(`/api/reembolsos/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PENDING' })
            })

            router.push('/dashboard/reembolsos')
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const totalAmount = sessions
        .filter(s => selectedSessions.includes(s.id))
        .reduce((sum, s) => sum + s.invoice.brutAmount, 0)

    const estimatedReimbursement = Math.round(totalAmount * 0.55)

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${i <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {i < step ? <CheckCircle2 className="w-6 h-6" /> : i}
                            </div>
                            {i < 4 && (
                                <div className={`flex-1 h-1 mx-2 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Seleccionar</span>
                    <span>Validar</span>
                    <span>Generar Kit</span>
                    <span>Instrucciones</span>
                </div>
            </div>

            {/* Step 1: Session Selection */}
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Selecciona las sesiones</h1>
                        <p className="text-gray-600">Marca las sesiones que quieres incluir en tu solicitud de reembolso</p>
                    </div>

                    <div className="space-y-3">
                        {sessions.map(session => (
                            <label
                                key={session.id}
                                className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-300 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSessions.includes(session.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedSessions([...selectedSessions, session.id])
                                        } else {
                                            setSelectedSessions(selectedSessions.filter(id => id !== session.id))
                                        }
                                    }}
                                    className="w-5 h-5 text-indigo-600"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900">
                                            {new Date(session.date).toLocaleDateString('es-CL')} - {session.professional.name}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(session.invoice.brutAmount)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Boleta: {session.invoice.number} • {session.duration} min
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    {selectedSessions.length > 0 && (
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-700">Total seleccionado:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Reembolso estimado (~55%):</span>
                                <span className="text-xl font-bold text-green-600">{formatCurrency(estimatedReimbursement)}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Link
                            href="/dashboard/reembolsos"
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancelar
                        </Link>
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedSessions.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Continuar
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Validation */}
            {step === 2 && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Validación de Requisitos</h1>
                        <p className="text-gray-600">Verifica que cuentas con los documentos necesarios</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-green-900">Boletas de Honorarios Electrónicas</p>
                                <p className="text-sm text-green-700">Ya las tenemos listas para ti</p>
                            </div>
                        </div>

                        <div className="p-4 border-2 border-gray-200 rounded-lg">
                            <p className="font-medium text-gray-900 mb-3">¿Tienes una derivación o interconsulta médica?</p>
                            <p className="text-sm text-gray-600 mb-4">
                                Es una orden médica que indica "Evaluación Psicológica" o "Psicoterapia". Algunas Isapres la requieren.
                            </p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300">
                                    <input
                                        type="radio"
                                        name="referral"
                                        checked={hasMedicalReferral === true}
                                        onChange={() => setHasMedicalReferral(true)}
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <span>Sí, la tengo</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300">
                                    <input
                                        type="radio"
                                        name="referral"
                                        checked={hasMedicalReferral === false}
                                        onChange={() => setHasMedicalReferral(false)}
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <span>No la tengo / No estoy seguro/a</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver
                        </button>
                        <button
                            onClick={handleCreateRequest}
                            disabled={hasMedicalReferral === null || loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Creando...' : 'Continuar'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Kit Generation */}
            {step === 3 && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">📦 Tu Kit de Reembolso</h1>
                        <p className="text-gray-600">Genera el PDF con todos los documentos necesarios</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Kit de Reembolso</h3>
                        <p className="text-gray-600 mb-6">
                            Incluye boletas de honorarios, certificado de asistencia y resumen de sesiones
                        </p>
                        <button
                            onClick={handleGenerateKit}
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {loading ? 'Generando...' : 'Generar Kit Completo'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Guide */}
            {step === 4 && guide && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">📋 Cómo solicitar tu reembolso</h1>
                        <p className="text-gray-600">Sigue estas instrucciones para tramitar tu reembolso</p>
                    </div>

                    {kitUrl && (
                        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <h3 className="font-semibold text-green-900">Kit generado exitosamente</h3>
                            </div>
                            <a
                                href={kitUrl}
                                download
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <Download className="w-5 h-5" />
                                Descargar Kit de Reembolso
                            </a>
                        </div>
                    )}

                    <IsapreGuide guide={guide} onMarkAsSubmitted={handleMarkAsSubmitted} />
                </div>
            )}
        </div>
    )
}
