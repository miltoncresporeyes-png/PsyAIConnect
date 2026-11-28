'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Mail, Save } from 'lucide-react'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pill, Spinner, type PillTone } from '@/components/admin/ui'
import { formatDateTime } from '@/components/admin/format'
import {
    NOTES_MAX,
    RESPONSE_MAX,
    TICKET_PRIORITIES,
    TICKET_PRIORITY_LABELS,
    TICKET_STATUSES,
    TICKET_STATUS_LABELS,
    TICKET_TYPE_LABELS,
    type TicketPriorityValue,
    type TicketStatusValue,
    type TicketTypeValue,
} from '@/lib/tickets'

interface TicketDetail {
    id: string
    number: number
    type: TicketTypeValue
    status: TicketStatusValue
    priority: TicketPriorityValue
    subject: string
    message: string
    contactName: string | null
    contactEmail: string | null
    userRole: string | null
    pageUrl: string | null
    userAgent: string | null
    adminNotes: string | null
    adminResponse: string | null
    respondedAt: string | null
    resolvedAt: string | null
    createdAt: string
    user: { id: string; name: string | null; email: string; role: string; isActive: boolean } | null
}

const STATUS_TONE: Record<TicketStatusValue, PillTone> = { NEW: 'info', IN_REVIEW: 'warn', RESOLVED: 'ok', DISCARDED: 'neutral' }

export default function AdminTicketDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { data, error, loading, reload } = useAdminData<TicketDetail>(id ? `/api/admin/tickets/${id}` : null)

    const [status, setStatus] = useState<TicketStatusValue>('NEW')
    const [priority, setPriority] = useState<TicketPriorityValue>('NORMAL')
    const [response, setResponse] = useState('')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

    // Sincroniza el formulario con el ticket cargado
    useEffect(() => {
        if (!data) return
        setStatus(data.status)
        setPriority(data.priority)
        setResponse(data.adminResponse ?? '')
        setNotes(data.adminNotes ?? '')
    }, [data])

    if (loading && !data) return <Spinner />
    if (error && !data) return <ErrorBox message={error} />
    if (!data) return null

    const dirty =
        status !== data.status || priority !== data.priority || response !== (data.adminResponse ?? '') || notes !== (data.adminNotes ?? '')

    const save = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/admin/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    priority,
                    adminResponse: response.trim() === '' ? null : response,
                    adminNotes: notes.trim() === '' ? null : notes,
                }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error || 'No se pudo guardar')
            setMessage({ type: 'ok', text: 'Cambios guardados' })
            reload()
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar' })
        } finally {
            setSaving(false)
        }
    }

    const sender = data.user?.name || data.contactName || data.contactEmail || 'Anónimo'

    return (
        <div className="space-y-4">
            <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Tickets
            </Link>

            <header>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500">#{data.number}</span>
                    <Pill tone={STATUS_TONE[data.status]}>{TICKET_STATUS_LABELS[data.status]}</Pill>
                    <Pill tone="neutral">{TICKET_TYPE_LABELS[data.type]}</Pill>
                    {data.priority === 'HIGH' && <Pill tone="bad">Prioridad alta</Pill>}
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">{data.subject}</h1>
                <p className="text-sm text-slate-500">Recibido el {formatDateTime(data.createdAt)}</p>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card title="Mensaje">
                        {/* React escapa el texto: no se interpreta HTML del usuario */}
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">{data.message}</p>
                    </Card>

                    <Card title="Respuesta al usuario" subtitle="La ve la persona en su página de soporte. No se envía por correo.">
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            maxLength={RESPONSE_MAX}
                            rows={5}
                            aria-label="Respuesta al usuario"
                            placeholder="Escribe una respuesta clara y breve…"
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
                        />
                        {data.respondedAt && <p className="mt-1 text-xs text-slate-500">Última respuesta: {formatDateTime(data.respondedAt)}</p>}
                        {!data.user && (
                            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                Esta persona no tiene sesión: no verá la respuesta en la plataforma. Contáctala por correo.
                            </p>
                        )}
                    </Card>

                    <Card title="Notas internas" subtitle="Solo las ven los administradores">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={NOTES_MAX}
                            rows={3}
                            aria-label="Notas internas"
                            placeholder="Contexto, pasos de reproducción, enlace al trabajo relacionado…"
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none"
                        />
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card title="Gestión">
                        <div className="space-y-3">
                            <label className="flex flex-col gap-1 text-xs text-slate-500">
                                Estado
                                <select value={status} onChange={(e) => setStatus(e.target.value as TicketStatusValue)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900">
                                    {TICKET_STATUSES.map((s) => <option key={s} value={s}>{TICKET_STATUS_LABELS[s]}</option>)}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1 text-xs text-slate-500">
                                Prioridad
                                <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriorityValue)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900">
                                    {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{TICKET_PRIORITY_LABELS[p]}</option>)}
                                </select>
                            </label>
                            <button
                                type="button"
                                onClick={save}
                                disabled={saving || !dirty}
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" aria-hidden /> {saving ? 'Guardando…' : 'Guardar cambios'}
                            </button>
                            {message && (
                                <p role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-xs ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </p>
                            )}
                            {data.resolvedAt && <p className="text-xs text-slate-500">Cerrado el {formatDateTime(data.resolvedAt)}</p>}
                        </div>
                    </Card>

                    <Card title="Quién escribe">
                        <dl className="space-y-2 text-sm">
                            <div><dt className="text-xs text-slate-500">Nombre</dt><dd className="font-medium text-slate-900">{sender}</dd></div>
                            <div>
                                <dt className="text-xs text-slate-500">Correo</dt>
                                <dd>
                                    {data.contactEmail ? (
                                        <a href={`mailto:${data.contactEmail}?subject=${encodeURIComponent(`Re: ${data.subject} (ticket #${data.number})`)}`} className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                                            <Mail className="h-3.5 w-3.5" aria-hidden /> {data.contactEmail}
                                        </a>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div><dt className="text-xs text-slate-500">Tipo de visitante</dt><dd className="font-medium text-slate-900">{data.userRole === 'PROFESSIONAL' ? 'Profesional' : data.userRole === 'PATIENT' ? 'Paciente' : 'Sin sesión'}</dd></div>
                            {data.user && (
                                <div>
                                    <dt className="text-xs text-slate-500">Cuenta</dt>
                                    <dd><Link href={`/admin/users/${data.user.id}`} className="font-medium text-blue-700 hover:underline">Ver usuario</Link>{!data.user.isActive && <span className="ml-2"><Pill tone="bad">Desactivado</Pill></span>}</dd>
                                </div>
                            )}
                        </dl>
                    </Card>

                    <Card title="Contexto técnico">
                        <dl className="space-y-2 text-xs">
                            <div><dt className="text-slate-500">Página de origen</dt><dd className="break-all font-mono text-slate-800">{data.pageUrl || '—'}</dd></div>
                            <div><dt className="text-slate-500">Navegador</dt><dd className="break-words text-slate-800">{data.userAgent || '—'}</dd></div>
                        </dl>
                    </Card>
                </div>
            </div>
        </div>
    )
}
