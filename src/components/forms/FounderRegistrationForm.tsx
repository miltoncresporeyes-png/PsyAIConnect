'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export function FounderRegistrationForm() {
    const [nombreCompleto, setNombreCompleto] = useState('')
    const [rut, setRut] = useState('')
    const [profesion, setProfesion] = useState<'psicologo' | 'psiquiatra'>('psicologo')
    const [registroSuperintendencia, setRegistroSuperintendencia] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [modalidadAtencion, setModalidadAtencion] = useState<'online' | 'presencial' | 'ambas'>('online')
    const [comunaRegion, setComunaRegion] = useState('')
    const [declaracionAceptada, setDeclaracionAceptada] = useState(false)
    const [website, setWebsite] = useState('') // Honeypot anti-bot

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        if (!declaracionAceptada) {
            setErrorMessage('Debes declarar que tu inscripción está vigente y aceptar los Términos del Programa Fundadores, los Términos de Uso y la Política de Privacidad.')
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('/api/fundadores/postular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreCompleto,
                    rut,
                    profesion,
                    registroSuperintendencia,
                    email,
                    telefono,
                    modalidadAtencion,
                    comunaRegion,
                    declaracionVigente: declaracionAceptada,
                    versionTerminos: '1.0',
                    website,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Ocurrió un error al procesar tu postulación.')
            }

            setIsSuccess(true)
            setSuccessMessage(
                data.message ||
                'Recibimos tu postulación. Verificaremos tu inscripción en el Registro de la Superintendencia de Salud y te escribiremos en un plazo estimado de 3 a 5 días hábiles.'
            )
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al enviar postulación')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8 text-center animate-fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-800 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                    ¡Postulación Recibida con Éxito!
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed max-w-md mx-auto mb-6">
                    {successMessage}
                </p>
                <div className="rounded-xl bg-white border border-teal-100 p-4 text-xs text-slate-600 max-w-md mx-auto mb-6 text-left">
                    <p className="font-semibold text-slate-800 mb-1">Pasos siguientes:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Validación de antecedentes ante la Superintendencia de Salud.</li>
                        <li>Tu postulación permanece en estado <strong>pendiente</strong>. Ningún perfil es publicado automáticamente.</li>
                        <li>Te avisaremos a <strong>{email}</strong> con los resultados de la verificación.</li>
                    </ul>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 transition"
                >
                    Volver al inicio
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Aviso obligatorio de postulación a fundadores */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/90 p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-teal-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-teal-950">
                    <p className="font-semibold mb-0.5">
                        Estás postulando al Programa Profesionales Fundadores.
                    </p>
                    <p className="text-teal-900/85">
                        Beneficio de 12 meses sin costo de suscripción para los primeros 20 fundadores. Todos los datos son verificados manualmente en el Registro Nacional de Prestadores Individuales.
                    </p>
                </div>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Honeypot anti-bot oculto */}
            <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
            />

            <div>
                <label htmlFor="founder-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre completo <span className="text-teal-700">*</span>
                </label>
                <input
                    id="founder-name"
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej. Constanza Silva Morales"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-rut" className="block text-xs font-semibold text-slate-700 mb-1">
                        RUT <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-rut"
                        type="text"
                        required
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        placeholder="12.345.678-9"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                    />
                </div>

                <div>
                    <label htmlFor="founder-profesion" className="block text-xs font-semibold text-slate-700 mb-1">
                        Profesión <span className="text-teal-700">*</span>
                    </label>
                    <select
                        id="founder-profesion"
                        required
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value as 'psicologo' | 'psiquiatra')}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                    >
                        <option value="psicologo">Psicólogo/a</option>
                        <option value="psiquiatra">Psiquiatra</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="founder-registro" className="block text-xs font-semibold text-slate-700 mb-1">
                    N° de inscripción en el Registro Nacional de Prestadores Individuales <span className="text-teal-700">*</span>
                </label>
                <input
                    id="founder-registro"
                    type="text"
                    required
                    value={registroSuperintendencia}
                    onChange={(e) => setRegistroSuperintendencia(e.target.value)}
                    placeholder="Ej. 123456"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                    Emitido por la Superintendencia de Salud de Chile.
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-email" className="block text-xs font-semibold text-slate-700 mb-1">
                        Correo electrónico <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@consulta.cl"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                    />
                </div>

                <div>
                    <label htmlFor="founder-telefono" className="block text-xs font-semibold text-slate-700 mb-1">
                        Teléfono / WhatsApp <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-telefono"
                        type="tel"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-modalidad" className="block text-xs font-semibold text-slate-700 mb-1">
                        Modalidad de atención <span className="text-teal-700">*</span>
                    </label>
                    <select
                        id="founder-modalidad"
                        required
                        value={modalidadAtencion}
                        onChange={(e) => setModalidadAtencion(e.target.value as 'online' | 'presencial' | 'ambas')}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                    >
                        <option value="online">Online</option>
                        <option value="presencial">Presencial</option>
                        <option value="ambas">Ambas (online y presencial)</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="founder-comuna" className="block text-xs font-semibold text-slate-700 mb-1">
                        Comuna o Región <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-comuna"
                        type="text"
                        required
                        value={comunaRegion}
                        onChange={(e) => setComunaRegion(e.target.value)}
                        placeholder="Ej. Providencia / Metropolitana"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition"
                    />
                </div>
            </div>

            {/* Checkbox obligatorio sin marcar por defecto */}
            <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        required
                        checked={declaracionAceptada}
                        onChange={(e) => setDeclaracionAceptada(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed select-none">
                        Declaro que mi inscripción en el Registro es vigente y que he leído y acepto los{' '}
                        <Link href="/fundadores" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                            Términos del Programa Fundadores (/fundadores)
                        </Link>, los{' '}
                        <Link href="/terminos" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                            Términos de Uso
                        </Link>{' '}y la{' '}
                        <Link href="/privacidad" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                            Política de Privacidad
                        </Link>.
                    </span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Enviando postulación...</span>
                    </>
                ) : (
                    <span>Enviar postulación a Profesional Fundador</span>
                )}
            </button>
        </form>
    )
}
