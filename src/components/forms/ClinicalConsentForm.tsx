'use client'

import { useState } from 'react'
import { Check, FileText, Shield, AlertCircle } from 'lucide-react'

interface ClinicalConsentFormProps {
    patientName: string
    professionalName: string
    onAccept: () => void
    onCancel: () => void
}

export function ClinicalConsentForm({
    patientName,
    professionalName,
    onAccept,
    onCancel
}: ClinicalConsentFormProps) {
    const [accepted, setAccepted] = useState(false)
    const [signature, setSignature] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!accepted || !signature.trim()) {
            alert('Debe aceptar el consentimiento y firmar para continuar')
            return
        }

        setIsSubmitting(true)
        try {
            // Log consent to database
            await fetch('/api/consent/clinical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    consentType: 'CLINICAL_CONSENT',
                    digitalSignature: signature,
                    acceptedAt: new Date().toISOString(),
                })
            })

            onAccept()
        } catch (error) {
            console.error('Error logging consent:', error)
            alert('Error al registrar el consentimiento. Por favor intente nuevamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
                {/* Header */}
                <div className="bg-primary-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6" />
                        <h2 className="text-2xl font-heading font-bold">
                            Consentimiento Informado para Atención Psicológica
                        </h2>
                    </div>
                    <p className="text-primary-100 text-sm">
                        Antes de iniciar su primera sesión con {professionalName}, por favor lea y acepte el siguiente consentimiento informado.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

                    {/* Introduction */}
                    <div className="prose prose-sm max-w-none">
                        <p>
                            Yo, <strong>{patientName}</strong>, declaro que he sido informado/a sobre los aspectos fundamentales del proceso terapéutico que iniciaré con <strong>{professionalName}</strong> a través de la plataforma PsyConnect, y otorgo mi consentimiento libre e informado para ello.
                        </p>
                    </div>

                    {/* Section 1 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-600" />
                            1. Naturaleza del Servicio Terapéutico
                        </h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• La psicoterapia es un proceso colaborativo orientado a promover el bienestar emocional y psicológico.</li>
                            <li>• Los resultados terapéuticos no pueden ser garantizados y dependen de múltiples factores, incluyendo mi compromiso activo.</li>
                            <li>• Comprendo que el profesional no puede prometer resultados específicos ni "curas" inmediatas.</li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">2. Confidencialidad y Secreto Profesional</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• Todo lo conversado en las sesiones está protegido por secreto profesional.</li>
                            <li>• El profesional solo podrá romper la confidencialidad en casos excepcionales establecidos por ley:</li>
                            <li className="ml-4">→ Riesgo vital inminente para mí o terceros</li>
                            <li className="ml-4">→ Sospecha fundada de abuso infantil</li>
                            <li className="ml-4">→ Orden judicial debidamente notificada</li>
                            <li>• Las notas clínicas están cifradas y solo el profesional tratante tiene acceso a ellas.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">3. Modalidad y Límites de la Telepsicología</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• Las sesiones online tienen las mismas garantías de confidencialidad que las presenciales.</li>
                            <li>• Es mi responsabilidad asegurar un lugar privado y conexión estable.</li>
                            <li>• La telepsicología <strong>NO es apropiada para emergencias psiquiátricas.</strong></li>
                            <li>• En caso de crisis, debo contactar inmediatamente:</li>
                            <li className="ml-4">→ Salud Responde: 600 360 7777 (24/7)</li>
                            <li className="ml-4">→ SAMU: 131</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">4. Grabación de Sesiones</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• Las sesiones <strong>NO se graban</strong> por defecto.</li>
                            <li>• Si el profesional o yo deseamos grabar por motivos clínicos o de supervisión, se solicitará consentimiento explícito previo.</li>
                            <li>• PsyConnect (la plataforma) NO graba, almacena ni accede al contenido de las videollamadas.</li>
                        </ul>
                    </div>

                    {/* Section 5 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">5. Pagos, Cancelaciones y Puntualidad</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• El pago debe realizarse previo a la sesión a través de la plataforma.</li>
                            <li>• Cancelaciones con más de 24 horas: reembolso del 100%.</li>
                            <li>• Cancelaciones con menos de 24 horas o inasistencias sin aviso: sin reembolso.</li>
                            <li>• Me comprometo a llegar puntual a las sesiones programadas.</li>
                        </ul>
                    </div>

                    {/* Section 6 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">6. Derechos del Paciente</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• Tengo derecho a solicitar información sobre mi diagnóstico, tratamiento y pronóstico.</li>
                            <li>• Puedo finalizar el proceso terapéutico en cualquier momento.</li>
                            <li>• Puedo solicitar derivación a otro profesional si lo estimo conveniente.</li>
                            <li>• Puedo presentar reclamos ante los organismos competentes (Superintendencia de Salud, Colegio ...Profesional).</li>
                        </ul>
                    </div>

                    {/* Section 7 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">7. Responsabilidades del Paciente</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• Me comprometo a participar activamente en el proceso terapéutico.</li>
                            <li>• Proporcionaré información veraz y relevante para mi tratamiento.</li>
                            <li>• Informaré al profesional sobre medicación o tratamientos paralelos.</li>
                            <li>• Mantendré respeto y conducta apropiada durante las sesiones.</li>
                        </ul>
                    </div>

                    {/* Section 8 */}
                    <div className="border-l-4 border-primary-200 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">8. Protección de Datos Personales</h3>
                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                            <li>• Mis datos personales y de salud serán tratados conforme a la Ley 19.628 de Chile.</li>
                            <li>• He leído y acepto la <a href="/privacidad" target="_blank" className="text-primary-600 underline">Política de Privacidad</a> de PsyConnect.</li>
                            <li>• Comprendo que las notas clínicas se conservarán por 15 años (normativa sanitaria).</li>
                        </ul>
                    </div>

                    {/* Warning Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-900">
                                <p className="font-semibold mb-1">Importante:</p>
                                <p>
                                    Este consentimiento es válido para todo el proceso terapéutico con {professionalName}. Puedo revocarlo en cualquier momento informando al profesional, lo cual implicará la finalización del tratamiento.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Acceptance */}
                <div className="bg-gray-50 p-6 rounded-b-xl border-t border-gray-200">
                    {/* Checkbox */}
                    <label className="flex items-start gap-3 mb-4 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex-1 text-sm">
                            <span className="font-semibold text-gray-900">
                                He leído, comprendido y acepto todos los puntos del presente Consentimiento Informado.
                            </span>
                            <p className="text-gray-600 mt-1">
                                Declaro que he tenido oportunidad de hacer preguntas y que todas mis dudas han sido resueltas satisfactoriamente.
                            </p>
                        </div>
                    </label>

                    {/* Digital Signature */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Firma Digital (escriba su nombre completo)
                        </label>
                        <input
                            type="text"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Escriba su nombre completo como firma"
                            className="input w-full italic"
                            disabled={!accepted}
                        />
                    </div>

                    {/* Meta info */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                        <p>• Fecha y hora: {new Date().toLocaleString('es-CL')}</p>
                        <p>• Paciente: {patientName}</p>
                        <p>• Profesional: {professionalName}</p>
                        <p>• Este consentimiento quedará registrado de forma segura en su historial clínico.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="btn-secondary flex-1"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!accepted || !signature.trim() || isSubmitting}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                'Registrando...'
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Aceptar y Continuar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
