'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { analyticsEvents } from '@/lib/analytics'
import { formatRut, isValidRut } from '@/lib/rut'
import { COMUNAS_POR_REGION } from '@/lib/comunas-chile'

const REGIONES = Object.keys(COMUNAS_POR_REGION)

const RUT_ERROR = 'El RUT no es válido. Revisa el número y el dígito verificador.'

const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition'
const labelClass = 'block text-[13px] font-semibold text-slate-700 mb-1'

export function FounderRegistrationForm() {
    const [nombreCompleto, setNombreCompleto] = useState('')
    const [rut, setRut] = useState('')
    const [rutError, setRutError] = useState('')
    const [profesion, setProfesion] = useState<'psicologo' | 'psiquiatra'>('psicologo')
    const [registroSuperintendencia, setRegistroSuperintendencia] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [modalidadAtencion, setModalidadAtencion] = useState<'online' | 'presencial' | 'ambas'>('online')
    const [region, setRegion] = useState('')
    const [comuna, setComuna] = useState('')
    const [descripcionConsulta, setDescripcionConsulta] = useState('')
    const [declaracionAceptada, setDeclaracionAceptada] = useState(false)
    const [website, setWebsite] = useState('') // Honeypot anti-bot

    const { data: session } = useSession()
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const googleEmail = session?.user?.email ?? ''

    // Si la persona ya se identificó con Google, precargamos nombre y correo.
    useEffect(() => {
        if (session?.user?.email) {
            setEmail((prev) => prev || session.user!.email!)
            setNombreCompleto((prev) => prev || session.user?.name || '')
        }
    }, [session])

    const handleGoogle = async () => {
        setIsGoogleLoading(true)
        await signIn('google', { callbackUrl: '/registro?programa=fundador' })
    }

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const handleRutChange = (value: string) => {
        // Solo dígitos, K, puntos y guion. El formato final se aplica al salir del campo.
        setRut(value.replace(/[^0-9kK.-]/g, '').slice(0, 12))
        if (rutError) setRutError('')
    }

    const handleRutBlur = () => {
        if (!rut.trim()) return
        const formatted = formatRut(rut)
        setRut(formatted)
        setRutError(isValidRut(formatted) ? '' : RUT_ERROR)
    }

    const handleRegionChange = (value: string) => {
        setRegion(value)
        setComuna('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        if (telefono.length !== 8) {
            setErrorMessage('Ingresa los 8 dígitos de tu celular (después del +56 9).')
            return
        }

        if (!isValidRut(rut)) {
            setRutError(RUT_ERROR)
            setErrorMessage('Revisa el RUT ingresado.')
            document.getElementById('founder-rut')?.focus()
            return
        }

        if (!region || !comuna) {
            setErrorMessage('Selecciona tu región y tu comuna.')
            return
        }

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
                    rut: formatRut(rut),
                    profesion,
                    registroSuperintendencia,
                    email,
                    telefono: `+569${telefono}`,
                    modalidadAtencion,
                    region,
                    comuna,
                    descripcionConsulta,
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
            analyticsEvents.professionalRegistration('form_founder')
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
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-left">
            <div className="rounded-xl border border-teal-200 bg-teal-50/90 px-4 py-3 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-teal-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-[13px] text-teal-950 leading-snug">
                    <span className="font-semibold">Postulas al Programa Profesionales Fundadores.</span>{' '}
                    12 meses sin costo para los primeros 20 fundadores. Verificamos manualmente tus datos en el Registro Nacional de Prestadores Individuales.
                </p>
            </div>

            {errorMessage && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs sm:text-[13px] text-red-700 flex items-start gap-2">
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

            {googleEmail ? (
                <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
                    Identificado con Google como <strong>{googleEmail}</strong>. Completa el resto de los datos para postular.
                </p>
            ) : (
                <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                    {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    Continuar con Google
                </button>
            )}

            <div>
                <label htmlFor="founder-name" className={labelClass}>
                    Nombre completo <span className="text-teal-700">*</span>
                </label>
                <input
                    id="founder-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej. Constanza Silva Morales"
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-rut" className={labelClass}>
                        RUT <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-rut"
                        type="text"
                        required
                        autoComplete="off"
                        value={rut}
                        onChange={(e) => handleRutChange(e.target.value)}
                        onBlur={handleRutBlur}
                        aria-invalid={rutError ? true : undefined}
                        aria-describedby={rutError ? 'founder-rut-error' : undefined}
                        placeholder="12.345.678-9"
                        className={`${inputClass} ${rutError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    {rutError && (
                        <span id="founder-rut-error" className="text-[11px] text-red-600 mt-1 block">
                            {rutError}
                        </span>
                    )}
                </div>

                <div>
                    <label htmlFor="founder-profesion" className={labelClass}>
                        Profesión <span className="text-teal-700">*</span>
                    </label>
                    <select
                        id="founder-profesion"
                        required
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value as 'psicologo' | 'psiquiatra')}
                        className={inputClass}
                    >
                        <option value="psicologo">Psicólogo/a</option>
                        <option value="psiquiatra">Psiquiatra</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-registro" className={labelClass}>
                        N° de inscripción en el Registro <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-registro"
                        type="text"
                        required
                        value={registroSuperintendencia}
                        onChange={(e) => setRegistroSuperintendencia(e.target.value)}
                        placeholder="Ej. 123456"
                        className={inputClass}
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                        Superintendencia de Salud.
                    </span>
                </div>

                <div>
                    <label htmlFor="founder-modalidad" className={labelClass}>
                        Modalidad de atención <span className="text-teal-700">*</span>
                    </label>
                    <select
                        id="founder-modalidad"
                        required
                        value={modalidadAtencion}
                        onChange={(e) => setModalidadAtencion(e.target.value as 'online' | 'presencial' | 'ambas')}
                        className={inputClass}
                    >
                        <option value="online">Online</option>
                        <option value="presencial">Presencial</option>
                        <option value="ambas">Ambas (online y presencial)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-email" className={labelClass}>
                        Correo electrónico <span className="text-teal-700">*</span>
                    </label>
                    <input
                        id="founder-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@consulta.cl"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="founder-telefono" className={labelClass}>
                        Teléfono / WhatsApp <span className="text-teal-700">*</span>
                    </label>
                    <div className="flex items-stretch rounded-xl border border-slate-300 bg-white focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20 transition">
                        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-l-xl bg-slate-50 px-3 text-sm font-medium text-slate-600 border-r border-slate-300 select-none">
                            <svg viewBox="0 0 30 20" className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm ring-1 ring-slate-200" role="img" aria-label="Chile">
                                <rect width="30" height="20" fill="#fff" />
                                <rect y="10" width="30" height="10" fill="#D52B1E" />
                                <rect width="10" height="10" fill="#0039A6" />
                                <polygon fill="#fff" points="5,1.6 5.9,4.2 8.6,4.2 6.4,5.8 7.2,8.4 5,6.8 2.8,8.4 3.6,5.8 1.4,4.2 4.1,4.2" />
                            </svg>
                            +56 9
                        </span>
                        <input
                            id="founder-telefono"
                            type="tel"
                            inputMode="numeric"
                            required
                            autoComplete="tel-national"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            placeholder="1234 5678"
                            maxLength={8}
                            className="min-w-0 w-full rounded-r-xl bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label htmlFor="founder-region" className={labelClass}>
                        Región <span className="text-teal-700">*</span>
                    </label>
                    <select
                        id="founder-region"
                        required
                        value={region}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className={inputClass}
                    >
                        <option value="" disabled>Selecciona tu región</option>
                        {REGIONES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="founder-comuna" className={labelClass}>
                        Comuna <span className="text-teal-700">*</span>
                    </label>
                    <select
                        id="founder-comuna"
                        required
                        value={comuna}
                        disabled={!region}
                        onChange={(e) => setComuna(e.target.value)}
                        className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
                    >
                        <option value="" disabled>
                            {region ? 'Selecciona tu comuna' : 'Primero elige la región'}
                        </option>
                        {(COMUNAS_POR_REGION[region] ?? []).map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="founder-descripcion" className={labelClass}>
                    Breve descripción de tu consulta <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                    id="founder-descripcion"
                    rows={2}
                    maxLength={500}
                    value={descripcionConsulta}
                    onChange={(e) => setDescripcionConsulta(e.target.value)}
                    placeholder="Ej. Atención de adultos en enfoque cognitivo conductual, terapia de pareja..."
                    className={`${inputClass} resize-none`}
                />
            </div>

            {/* Declaración obligatoria, sin marcar por defecto */}
            <label
                htmlFor="founder-declaracion"
                className={`flex items-start gap-3.5 rounded-xl border-2 p-4 cursor-pointer transition ${
                    declaracionAceptada
                        ? 'border-teal-600 bg-teal-50/70'
                        : 'border-slate-300 bg-white hover:border-teal-400'
                }`}
            >
                <input
                    id="founder-declaracion"
                    type="checkbox"
                    required
                    checked={declaracionAceptada}
                    onChange={(e) => setDeclaracionAceptada(e.target.checked)}
                    className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-md border-2 border-slate-400 text-teal-700 accent-teal-700 focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
                />
                <span className="text-[13px] text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Declaro que mi inscripción en el Registro es vigente</span>{' '}
                    y que he leído y acepto los{' '}
                    <Link href="/fundadores" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                        Términos del Programa Fundadores
                    </Link>, los{' '}
                    <Link href="/terminos" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                        Términos de Uso
                    </Link>{' '}y la{' '}
                    <Link href="/privacidad" target="_blank" className="font-semibold text-teal-800 underline hover:text-teal-900">
                        Política de Privacidad
                    </Link>.
                </span>
            </label>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 transition disabled:opacity-50"
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
