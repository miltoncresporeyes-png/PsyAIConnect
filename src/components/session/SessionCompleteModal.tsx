'use client'

import { useState, useEffect } from 'react'
import { 
    Loader2, Check, AlertCircle, X, 
    Receipt, FileCheck, CreditCard, 
    Download, ArrowRight, Sparkles, PartyPopper
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface SessionCompleteModalProps {
    appointmentId: string
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    initialOptions?: SessionOptions
}

interface SessionOptions {
    emitInvoice: boolean
    generateRecipe: boolean
    recipeContent?: string
    generateCertificate: boolean
    certificateContent?: string
    diagnosis?: string
}

interface SessionResult {
    success: boolean
    clinicalNote?: {
        contentHash: string
        signedAt: string
    }
    documents?: {
        recipe?: { filename: string; pdfBase64: string }
        certificate?: { filename: string; pdfBase64: string }
        invoice?: { invoiceNumber: string; queueId: string }
    }
    steps?: { step: string; success: boolean; message?: string }[]
}

type ModalState = 'confirmation' | 'loading' | 'success' | 'error'

export default function SessionCompleteModal({
    appointmentId,
    isOpen,
    onClose,
    onSuccess,
    initialOptions,
}: SessionCompleteModalProps) {
    const [state, setState] = useState<ModalState>('confirmation')
    const [options, setOptions] = useState<SessionOptions>({
        emitInvoice: true,
        generateRecipe: false,
        generateCertificate: false,
        ...initialOptions,
    })
    const [result, setResult] = useState<SessionResult | null>(null)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            setState('confirmation')
            setResult(null)
            setError('')
            setOptions({
                emitInvoice: true,
                generateRecipe: false,
                generateCertificate: false,
                ...initialOptions,
            })
        }
    }, [isOpen, initialOptions])

    const handleSubmit = async () => {
        setState('loading')
        setError('')

        try {
            const response = await fetch('/api/notes/session-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    ...options,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al completar sesión')
            }

            setResult(data)
            setState('success')
            
            // Trigger confetti
            triggerConfetti()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
            setState('error')
        }
    }

    const triggerConfetti = () => {
        const duration = 3000
        const end = Date.now() + duration

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#10B981', '#3B82F6', '#F59E0B'],
            })
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#10B981', '#3B82F6', '#F59E0B'],
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }
        frame()
    }

    const downloadPDF = (pdfBase64: string, filename: string) => {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${pdfBase64}`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDashboard = () => {
        onSuccess?.()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                    {state === 'confirmation' && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Finalizar Sesión</h2>
                                <p className="text-emerald-100 text-sm">Resumen de acciones a realizar</p>
                            </div>
                        </div>
                    )}
                    {state === 'loading' && (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <div>
                                <h2 className="text-xl font-bold">Procesando...</h2>
                                <p className="text-emerald-100 text-sm">Esto puede tomar unos segundos</p>
                            </div>
                        </div>
                    )}
                    {state === 'success' && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <PartyPopper className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">¡Sesión Completada!</h2>
                                <p className="text-emerald-100 text-sm">Todo listo</p>
                            </div>
                        </div>
                    )}
                    {state === 'error' && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/30 rounded-lg">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Error</h2>
                                <p className="text-red-100 text-sm">Algo salió mal</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Confirmation State */}
                    {state === 'confirmation' && (
                        <>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Resumen de acciones
                                </h3>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    <li>• Se cerrará la ficha clínica con firma digital</li>
                                    {options.emitInvoice && <li>• Se emitirá boleta electrónica de honorarios</li>}
                                    {options.generateRecipe && <li>• Se generará receta médica en PDF</li>}
                                    {options.generateCertificate && <li>• Se generará certificado médico en PDF</li>}
                                </ul>
                            </div>

                            <div className="space-y-4 mb-6">
                                <label className="flex items-start gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={options.emitInvoice}
                                        onChange={(e) => setOptions(prev => ({ ...prev, emitInvoice: e.target.checked }))}
                                        className="mt-1 w-4 h-4 text-emerald-600 rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                            Emitir Boleta Electrónica
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Se generará boleta de honorarios para el paciente
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={options.generateRecipe}
                                        onChange={(e) => setOptions(prev => ({ ...prev, generateRecipe: e.target.checked }))}
                                        className="mt-1 w-4 h-4 text-purple-600 rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <Receipt className="w-4 h-4 text-purple-600" />
                                            Generar Receta Médica
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            PDF con medicamentos recetados
                                        </div>
                                    </div>
                                </label>

                                {options.generateRecipe && (
                                    <textarea
                                        value={options.recipeContent || ''}
                                        onChange={(e) => setOptions(prev => ({ ...prev, recipeContent: e.target.value }))}
                                        placeholder="Medicamentos:&#10;- Sertralina 50mg - 1 comprimido al día&#10;- Lorazepam 1mg - Si requiere"
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono ml-7"
                                    />
                                )}

                                <label className="flex items-start gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={options.generateCertificate}
                                        onChange={(e) => setOptions(prev => ({ ...prev, generateCertificate: e.target.checked }))}
                                        className="mt-1 w-4 h-4 text-emerald-600 rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <FileCheck className="w-4 h-4 text-emerald-600" />
                                            Generar Certificado
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Certificado de atención médica
                                        </div>
                                    </div>
                                </label>

                                {options.generateCertificate && (
                                    <div className="space-y-2 ml-7">
                                        <input
                                            type="text"
                                            value={options.diagnosis || ''}
                                            onChange={(e) => setOptions(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            placeholder="Diagnóstico principal"
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                        <textarea
                                            value={options.certificateContent || ''}
                                            onChange={(e) => setOptions(prev => ({ ...prev, certificateContent: e.target.value }))}
                                            placeholder="Contenido del certificado..."
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Confirmar y Finalizar
                                </button>
                            </div>
                        </>
                    )}

                    {/* Loading State */}
                    {state === 'loading' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 relative">
                                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Procesando tu solicitud
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {options.emitInvoice && 'Emitiendo boleta electrónica...'}
                                {options.generateRecipe && 'Generando receta médica...'}
                                {options.generateCertificate && 'Generando certificado...'}
                            </p>

                            <div className="space-y-2 text-sm text-gray-400">
                                {result?.steps?.map((step, i) => (
                                    <div key={i} className="flex items-center justify-center gap-2">
                                        {step.success ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        <span>{step.step.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {state === 'success' && (
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                ¡Sesión Finalizada!
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Todos los documentos han sido generados correctamente
                            </p>

                            <div className="space-y-3 mb-6">
                                {result?.clinicalNote && (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                                        <Check className="w-5 h-5 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-700">
                                            Ficha clínica firmada y archivada
                                        </span>
                                    </div>
                                )}
                                {result?.documents?.invoice && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700">
                                            Boleta: {result.documents.invoice.invoiceNumber}
                                        </span>
                                    </div>
                                )}
                                {result?.documents?.recipe && (
                                    <button
                                        onClick={() => downloadPDF(
                                            result.documents!.recipe!.pdfBase64,
                                            result.documents!.recipe!.filename
                                        )}
                                        className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                                    >
                                        <Receipt className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-700 flex-1 text-left">
                                            Descargar Receta
                                        </span>
                                        <Download className="w-4 h-4 text-purple-600" />
                                    </button>
                                )}
                                {result?.documents?.certificate && (
                                    <button
                                        onClick={() => downloadPDF(
                                            result.documents!.certificate!.pdfBase64,
                                            result.documents!.certificate!.filename
                                        )}
                                        className="w-full flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                                    >
                                        <FileCheck className="w-5 h-5 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-700 flex-1 text-left">
                                            Descargar Certificado
                                        </span>
                                        <Download className="w-4 h-4 text-emerald-600" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleDashboard}
                                className="w-full px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                Ir al Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Error State */}
                    {state === 'error' && (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Error al completar sesión
                            </h3>
                            <p className="text-red-600 mb-6 bg-red-50 p-3 rounded-lg text-sm">
                                {error}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => setState('confirmation')}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
