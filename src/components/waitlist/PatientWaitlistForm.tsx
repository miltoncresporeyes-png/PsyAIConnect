'use client'

import { useState, useEffect } from 'react'
import { landingConfig } from '@/config/landing.config'
import { track } from '@/lib/track'
import { CheckCircle2, AlertCircle, Loader2, Share2 } from 'lucide-react'

export function PatientWaitlistForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [comuna, setComuna] = useState('')
    const [motivoCategoria, setMotivoCategoria] = useState<string>('')
    const [prevision, setPrevision] = useState<string>('FONASA')
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        if (!consentAccepted) {
            setErrorMessage('Debes aceptar los términos y el consentimiento informado.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/waitlist/patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    whatsapp: whatsapp || undefined,
                    comuna,
                    motivoCategoria: motivoCategoria || undefined,
                    prevision,
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
                setErrorMessage(data.error || 'Ocurrió un error al procesar tu solicitud.')
                return
            }

            setSuccessMessage(data.message || '¡Te has unido con éxito a la lista de espera!')
            track('form_paciente_enviado', { prevision, comuna })
        } catch {
            setErrorMessage('No pudimos conectar con el servidor. Revisa tu conexión a internet.')
        } finally {
            setLoading(false)
        }
    }

    const handleShareWhatsapp = () => {
        const text = encodeURIComponent(
            '¡Me acabo de anotar en la lista de espera de PsyDoctor! Una nueva forma de atenderse con psicólogos y psiquiatras habilitados en la Superintendencia de Salud con boleta para reembolso: https://psydoctor.cl'
        )
        track('click_whatsapp', { source: 'share_waitlist_success' })
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
    }

    if (successMessage) {
        return (
            <div className="rounded-2xl border border-pino/30 bg-niebla p-6 md:p-8 text-center text-tinta">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pino/10 text-pino">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold font-serif-warm text-tinta mb-2">
                    ¡Registro confirmado!
                </h3>
                <p className="text-tinta/80 mb-6 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                    {successMessage}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={handleShareWhatsapp}
                        className="inline-flex items-center gap-2 rounded-xl bg-pino px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#185752] transition-colors w-full sm:w-auto justify-center"
                    >
                        <Share2 className="h-4 w-4" aria-hidden="true" />
                        Compartir por WhatsApp
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSuccessMessage(null)
                            setName('')
                            setEmail('')
                            setWhatsapp('')
                            setComuna('')
                            setMotivoCategoria('')
                            setConsentAccepted(false)
                        }}
                        className="text-xs text-tinta/60 underline hover:text-tinta py-2"
                    >
                        Inscribir a otra persona
                    </button>
                </div>
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

            {/* Honeypot field (invisible to legitimate users) */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="patient-website">No llenar este campo</label>
                <input
                    id="patient-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteHoneypot}
                    onChange={(e) => setWebsiteHoneypot(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="patient-name" className="block text-sm font-semibold text-tinta mb-1.5">
                    Nombre completo <span className="text-pino">*</span>
                </label>
                <input
                    id="patient-name"
                    type="text"
                    required
                    autoComplete="name"
                    enterKeyHint="next"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Constanza Silva"
                    className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="patient-email" className="block text-sm font-semibold text-tinta mb-1.5">
                        Correo electrónico <span className="text-pino">*</span>
                    </label>
                    <input
                        id="patient-email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        enterKeyHint="next"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.cl"
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="patient-whatsapp" className="block text-sm font-semibold text-tinta mb-1.5">
                        WhatsApp (opcional)
                    </label>
                    <input
                        id="patient-whatsapp"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        enterKeyHint="next"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+56912345678"
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="patient-comuna" className="block text-sm font-semibold text-tinta mb-1.5">
                        Comuna de residencia <span className="text-pino">*</span>
                    </label>
                    <input
                        id="patient-comuna"
                        type="text"
                        required
                        autoComplete="address-level2"
                        enterKeyHint="next"
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        placeholder="Ej. Providencia, Valparaíso, Concepción..."
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-4 py-3 text-base sm:text-sm text-tinta placeholder:text-tinta/40 focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="patient-prevision" className="block text-sm font-semibold text-tinta mb-1.5">
                        Previsión de salud <span className="text-pino">*</span>
                    </label>
                    <select
                        id="patient-prevision"
                        value={prevision}
                        onChange={(e) => setPrevision(e.target.value)}
                        className="w-full min-h-[48px] rounded-xl border border-bruma bg-white px-3.5 py-3 text-base sm:text-sm text-tinta focus:border-pino focus:outline-none focus:ring-2 focus:ring-pino/20 shadow-2xs"
                    >
                        <option value="FONASA">Fonasa (Tramos B, C, D)</option>
                        <option value="ISAPRE">Isapre (Con reembolso)</option>
                        <option value="PARTICULAR">Particular</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="patient-motivo" className="block text-xs font-semibold text-tinta mb-1.5">
                    Motivo principal de consulta (opcional)
                </label>
                <select
                    id="patient-motivo"
                    value={motivoCategoria}
                    onChange={(e) => setMotivoCategoria(e.target.value)}
                    className="w-full rounded-xl border border-bruma bg-white px-3 py-2.5 text-sm text-tinta focus:border-pino focus:outline-none focus:ring-1 focus:ring-pino shadow-2xs"
                >
                    <option value="">Prefiero no especificar aún</option>
                    <option value="ANSIEDAD">Ansiedad o crisis de pánico</option>
                    <option value="ANIMO">Estado de ánimo o depresión</option>
                    <option value="ESTRES_LABORAL">Estrés laboral o burnout</option>
                    <option value="PAREJA">Terapia de pareja o familiar</option>
                    <option value="OTRO">Otro motivo personal</option>
                </select>
                <p className="text-[11px] text-tinta/50 mt-1">
                    Por tu privacidad, no registramos detalles clínicos en esta etapa preliminar.
                </p>
            </div>

            {/* Checkbox de consentimiento explícito no premarcado */}
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
                            términos y condiciones
                        </a>{' '}
                        y la{' '}
                        <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-pino underline font-medium hover:text-teal-800">
                            política de privacidad
                        </a>{' '}
                        para recibir aviso cuando se habilite la atención.
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
                        Inscribiendo...
                    </>
                ) : (
                    'Unirme a la lista de espera'
                )}
            </button>
        </form>
    )
}
