'use client'

import { useState, useEffect } from 'react'
import { landingConfig } from '@/config/landing.config'
import { track } from '@/lib/track'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const ESPECIALIDADES_SUGERIDAS = [
    'Terapia Cognitivo-Conductual (TCC)',
    'Psicoanálisis / Enfoque Psicodinámico',
    'Terapia Sistémica / Parejas',
    'Psicología Infantil y Adolescentes',
    'Trauma y EMDR',
    'Manejo de Ansiedad y Depresión',
    'Psiquiatría Adultos',
    'Trastornos de la Conducta Alimentaria',
]

export function ProfessionalWaitlistForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [profesion, setProfesion] = useState<'PSICOLOGO' | 'PSIQUIATRA'>('PSICOLOGO')
    const [registroSuperintendencia, setRegistroSuperintendencia] = useState('')
    const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>([])
    const [aniosExperiencia, setAniosExperiencia] = useState<number>(3)
    const [ciudad, setCiudad] = useState('')
    const [atiendeOnline, setAtiendeOnline] = useState(true)
    const [consentAccepted, setConsentAccepted] = useState(false)
    const [websiteHoneypot, setWebsiteHoneypot] = useState('')
    const [renderedAt, setRenderedAt] = useState<number>(0)

    const [utm, setUtm] = useState({
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        referrer: '',
    })

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)

    useEffect(() => {
        setRenderedAt(Date.now())
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            setUtm({
                utmSource: params.get('utm_source') || '',
                utmMedium: params.get('utm_medium') || '',
                utmCampaign: params.get('utm_campaign') || '',
                referrer: document.referrer || '',
            })
        }
    }, [])

    const toggleEspecialidad = (esp: string) => {
        setSelectedEspecialidades((prev) =>
            prev.includes(esp) ? prev.filter((item) => item !== esp) : [...prev, esp]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        if (selectedEspecialidades.length === 0) {
            setErrorMessage('Por favor selecciona al menos un área o especialidad de atención.')
            return
        }

        if (!consentAccepted) {
            setErrorMessage('Debes aceptar el consentimiento y términos para continuar.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/waitlist/professional', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    whatsapp,
                    profesion,
                    registroSuperintendencia,
                    especialidades: selectedEspecialidades,
                    aniosExperiencia: Number(aniosExperiencia),
                    ciudad,
                    atiendeOnline,
                    consentAccepted,
                    consentVersion: landingConfig.versionConsentimiento,
                    website: websiteHoneypot,
                    renderedAt,
                    utmSource: utm.utmSource,
                    utmMedium: utm.utmMedium,
                    utmCampaign: utm.utmCampaign,
                    referrer: utm.referrer,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setErrorMessage(data.error || 'Ocurrió un error al procesar tu postulación.')
                return
            }

            setIsAlreadySubscribed(Boolean(data.alreadySubscribed))
            setSuccessMessage(data.message || '¡Postulación recibida con éxito!')
            track('form_profesional_enviado', { profesion, ciudad })
        } catch {
            setErrorMessage('No pudimos conectar con el servidor. Revisa tu conexión a internet.')
        } finally {
            setLoading(false)
        }
    }

    if (successMessage) {
        if (isAlreadySubscribed) {
            return (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-6 md:p-8 text-center text-tinta">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                        <AlertCircle className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold font-serif-warm text-amber-950 mb-2">
                        Postulación registrada previamente
                    </h3>
                    <p className="text-amber-900/90 mb-6 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                        {successMessage}
                    </p>
                    <p className="text-xs text-amber-800/70">
                        Si necesitas actualizar tus datos o número de contacto, escríbenos directamente por WhatsApp.
                    </p>
                </div>
            )
        }

        return (
            <div className="rounded-2xl border border-pino/30 bg-niebla p-6 md:p-8 text-center text-tinta">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pino/10 text-pino">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold font-serif-warm text-tinta mb-2">
                    ¡Postulación enviada exitosamente!
                </h3>
                <p className="text-tinta/80 mb-6 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                    {successMessage}
                </p>
                <p className="text-xs text-tinta/60">
                    Nos comunicaremos a tu correo o WhatsApp para coordinar tu onboarding.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Honeypot anti-bot */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="pro-website">No llenar este campo</label>
                <input
                    id="pro-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteHoneypot}
                    onChange={(e) => setWebsiteHoneypot(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="pro-name" className="block text-sm font-semibold text-tinta mb-1.5">
                        Nombre y Apellidos <span className="text-pino">*</span>
                    </label>
                    <input
                        id="pro-name"
                        type="text"
                        required
                        autoComplete="name"
                        enterKeyHint="next"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Dr. Andrés Morales"
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="pro-email" className="block text-sm font-semibold text-tinta mb-1.5">
                        Correo profesional <span className="text-pino">*</span>
                    </label>
                    <input
                        id="pro-email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        enterKeyHint="next"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="consulta@doctor.cl"
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="pro-whatsapp" className="block text-sm font-semibold text-tinta mb-1.5">
                        WhatsApp de contacto <span className="text-pino">*</span>
                    </label>
                    <input
                        id="pro-whatsapp"
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        enterKeyHint="next"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+56912345678"
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="pro-profesion" className="block text-sm font-semibold text-tinta mb-1.5">
                        Profesión <span className="text-pino">*</span>
                    </label>
                    <select
                        id="pro-profesion"
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value as 'PSICOLOGO' | 'PSIQUIATRA')}
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-3.5 py-3 text-base sm:text-sm text-tinta focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs"
                    >
                        <option value="PSICOLOGO">Psicólogo / Psicóloga</option>
                        <option value="PSIQUIATRA">Médico Psiquiatra</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="pro-sis" className="block text-sm font-semibold text-tinta mb-1.5">
                        N° Registro SIS <span className="text-pino">*</span>
                    </label>
                    <input
                        id="pro-sis"
                        type="text"
                        required
                        enterKeyHint="next"
                        value={registroSuperintendencia}
                        onChange={(e) => setRegistroSuperintendencia(e.target.value)}
                        placeholder="Ej. 123456"
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="pro-ciudad" className="block text-sm font-semibold text-tinta mb-1.5">
                        Ciudad base <span className="text-pino">*</span>
                    </label>
                    <input
                        id="pro-ciudad"
                        type="text"
                        required
                        autoComplete="address-level2"
                        enterKeyHint="next"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        placeholder="Santiago, Viña del Mar, etc."
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="pro-experiencia" className="block text-xs font-semibold text-tinta mb-1.5">
                        Años de experiencia clínica <span className="text-pino">*</span>
                    </label>
                    <input
                        id="pro-experiencia"
                        type="number"
                        min={0}
                        max={60}
                        required
                        value={aniosExperiencia}
                        onChange={(e) => setAniosExperiencia(Number(e.target.value))}
                        className="w-full rounded-xl border border-bruma bg-white px-3.5 py-2.5 text-sm text-tinta focus:border-pino focus:outline-none focus:ring-1 focus:ring-pino shadow-2xs"
                    />
                </div>
            </div>

            <div>
                <span className="block text-xs font-semibold text-tinta mb-1.5">
                    Áreas de especialidad / enfoque <span className="text-pino">*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                    {ESPECIALIDADES_SUGERIDAS.map((esp) => {
                        const isSelected = selectedEspecialidades.includes(esp)
                        return (
                            <button
                                key={esp}
                                type="button"
                                onClick={() => toggleEspecialidad(esp)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                    isSelected
                                        ? 'bg-pino border-pino text-white font-medium shadow-2xs'
                                        : 'bg-niebla border-bruma text-tinta/75 hover:border-slate-300'
                                }`}
                            >
                                {esp}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2.5 text-xs text-tinta/80 cursor-pointer pt-1">
                    <input
                        type="checkbox"
                        checked={atiendeOnline}
                        onChange={(e) => setAtiendeOnline(e.target.checked)}
                        className="h-4 w-4 rounded border-bruma text-pino focus:ring-pino"
                    />
                    <span>Realizo atención por telemedicina (online)</span>
                </label>
            </div>

            {/* Consentimiento explícito no premarcado */}
            <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-tinta/80 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="h-4 w-4 rounded border-bruma text-pino focus:ring-pino mt-0.5"
                    />
                    <span>
                        Acepto los{' '}
                        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-pino underline font-medium hover:text-teal-800">
                            términos del programa fundadores
                        </a>{' '}
                        y la verificación de registro ante el Registro Nacional de Prestadores Individuales de Salud (SIS).
                    </span>
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pino px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#185752] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pino focus-visible:ring-offset-2 disabled:opacity-50 mt-3"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando postulación...
                    </>
                ) : (
                    'Postular al Programa de Fundadores'
                )}
            </button>
        </form>
    )
}
