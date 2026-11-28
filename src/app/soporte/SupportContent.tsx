'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FeedbackForm } from '@/components/support/FeedbackForm'
import {
    TICKET_STATUS_LABELS,
    TICKET_TYPE_LABELS,
    type TicketStatusValue,
    type TicketTypeValue,
} from '@/lib/tickets'

interface MyTicket {
    id: string
    number: number
    type: TicketTypeValue
    status: TicketStatusValue
    subject: string
    message: string
    adminResponse: string | null
    respondedAt: string | null
    createdAt: string
}

const STATUS_STYLES: Record<TicketStatusValue, string> = {
    NEW: 'bg-sky-50 text-sky-800 border-sky-200',
    IN_REVIEW: 'bg-amber-50 text-amber-900 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    DISCARDED: 'bg-slate-100 text-slate-600 border-slate-200',
}

function fmt(value: string) {
    return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function SupportContent() {
    const { status } = useSession()
    const loggedIn = status === 'authenticated'
    const [tickets, setTickets] = useState<MyTicket[]>([])
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/soporte/tickets')
            if (res.ok) setTickets((await res.json()).tickets ?? [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (loggedIn) load()
    }, [loggedIn, load])

    return (
        <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Escríbenos</h2>
                <p className="mb-4 mt-1 text-sm text-slate-500">
                    Cuéntanos un problema, una idea o una duda. Leemos todos los mensajes.
                </p>
                <FeedbackForm pagePath="/soporte" onSent={() => loggedIn && load()} />
            </section>

            {loggedIn && (
                <section aria-labelledby="mis-solicitudes">
                    <h2 id="mis-solicitudes" className="mb-3 text-lg font-semibold text-slate-900">Mis solicitudes</h2>
                    {loading && tickets.length === 0 ? (
                        <p className="text-sm text-slate-500">Cargando…</p>
                    ) : tickets.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                            Aún no has enviado mensajes.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {tickets.map((t) => (
                                <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500">#{t.number}</span>
                                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                                            {TICKET_STATUS_LABELS[t.status]}
                                        </span>
                                        <span className="text-xs text-slate-500">{TICKET_TYPE_LABELS[t.type]} · {fmt(t.createdAt)}</span>
                                    </div>
                                    <p className="mt-1.5 text-sm font-medium text-slate-900">{t.subject}</p>
                                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-slate-600">{t.message}</p>
                                    {t.adminResponse && (
                                        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
                                            <p className="text-xs font-semibold text-teal-900">Respuesta del equipo{t.respondedAt ? ` · ${fmt(t.respondedAt)}` : ''}</p>
                                            <p className="mt-0.5 whitespace-pre-line text-sm text-teal-950">{t.adminResponse}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    )
}
