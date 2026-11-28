'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Bug, CheckCircle2, HelpCircle, Lightbulb, Loader2, MessageSquare, Send } from 'lucide-react'
import {
    MESSAGE_MAX,
    SENSITIVE_DATA_NOTICE,
    SUBJECT_MAX,
    TICKET_TYPES,
    TICKET_TYPE_HINTS,
    TICKET_TYPE_LABELS,
    type TicketTypeValue,
} from '@/lib/tickets'

const TYPE_ICONS: Record<TicketTypeValue, typeof Bug> = {
    PROBLEM: Bug,
    SUGGESTION: Lightbulb,
    QUESTION: HelpCircle,
    OTHER: MessageSquare,
}

interface Props {
    /** Se llama al enviar con exito (el widget lo usa para cerrar el dialogo mas tarde). */
    onSent?: (number: number) => void
    initialType?: TicketTypeValue
    /** Ruta desde la que se abrio el formulario; por defecto la pagina actual. */
    pagePath?: string
}

/** Formulario de feedback: problema, sugerencia o consulta. Sirve con o sin sesion iniciada. */
export function FeedbackForm({ onSent, initialType = 'PROBLEM', pagePath }: Props) {
    const { data: session, status } = useSession()
    const loggedIn = status === 'authenticated' && Boolean(session?.user)

    const [type, setType] = useState<TicketTypeValue>(initialType)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [website, setWebsite] = useState('') // campo trampa (bots)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const [sentNumber, setSentNumber] = useState<number | null>(null)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSending(true)
        try {
            const res = await fetch('/api/soporte/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    subject,
                    message,
                    ...(loggedIn ? {} : { email, name }),
                    pageUrl: pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
                    website,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'No pudimos enviar tu mensaje. Inténtalo de nuevo.')
            const number = typeof data.number === 'number' ? data.number : 0
            setSentNumber(number)
            onSent?.(number)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No pudimos enviar tu mensaje.')
        } finally {
            setSending(false)
        }
    }

    if (sentNumber !== null) {
        return (
            <div className="py-6 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
                <h3 className="mt-3 text-lg font-semibold text-slate-900">¡Gracias por escribirnos!</h3>
                <p className="mt-1 text-sm text-slate-600">
                    {sentNumber > 0 ? `Tu mensaje quedó registrado como el ticket #${sentNumber}. ` : 'Tu mensaje quedó registrado. '}
                    Lo revisaremos pronto.
                </p>
                {loggedIn && (
                    <Link href="/soporte" className="mt-4 inline-block text-sm font-medium text-teal-800 hover:underline">
                        Ver el estado de mis solicitudes
                    </Link>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={submit} className="space-y-4" noValidate>
            <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">¿Qué quieres contarnos?</legend>
                <div className="grid grid-cols-2 gap-2">
                    {TICKET_TYPES.map((t) => {
                        const Icon = TYPE_ICONS[t]
                        const selected = type === t
                        return (
                            <label
                                key={t}
                                className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-left transition ${
                                    selected ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input type="radio" name="ticket-type" value={t} checked={selected} onChange={() => setType(t)} className="sr-only" />
                                <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${selected ? 'text-teal-700' : 'text-slate-400'}`} aria-hidden />
                                <span>
                                    <span className="block text-sm font-semibold text-slate-900">{TICKET_TYPE_LABELS[t]}</span>
                                    <span className="block text-xs text-slate-500">{TICKET_TYPE_HINTS[t]}</span>
                                </span>
                            </label>
                        )
                    })}
                </div>
            </fieldset>

            <div>
                <label htmlFor="ticket-subject" className="mb-1 block text-sm font-medium text-slate-700">Asunto</label>
                <input
                    id="ticket-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={SUBJECT_MAX}
                    required
                    placeholder="Ej: No puedo ver mi próxima cita"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
            </div>

            <div>
                <label htmlFor="ticket-message" className="mb-1 block text-sm font-medium text-slate-700">Cuéntanos con detalle</label>
                <textarea
                    id="ticket-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={MESSAGE_MAX}
                    required
                    rows={5}
                    placeholder="¿Qué intentabas hacer? ¿Qué pasó? Si es una sugerencia, ¿cómo te gustaría que funcionara?"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <p className="mt-1 text-right text-xs text-slate-400 tabular-nums">{message.length}/{MESSAGE_MAX}</p>
            </div>

            {!loggedIn && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ticket-email" className="mb-1 block text-sm font-medium text-slate-700">Tu correo</label>
                        <input
                            id="ticket-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="tu@correo.cl"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="ticket-name" className="mb-1 block text-sm font-medium text-slate-700">Tu nombre <span className="font-normal text-slate-400">(opcional)</span></label>
                        <input
                            id="ticket-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={80}
                            autoComplete="name"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                    </div>
                </div>
            )}

            {/* Campo trampa: oculto para personas, los bots suelen rellenarlo */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                <label>
                    No completar este campo
                    <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
            </div>

            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden />
                {SENSITIVE_DATA_NOTICE}
            </p>

            {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:opacity-60"
            >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                Enviar mensaje
            </button>
        </form>
    )
}

export default FeedbackForm
