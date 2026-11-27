'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout/shell'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import ImmediateHelpModal from '@/components/dashboard/ImmediateHelpModal'
import {
  MessageSquare,
  AlertTriangle,
  Send,
  Loader2,
  ArrowLeft,
  Flag,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react'

interface ChatListItem {
  key: string
  conversationId: string | null
  professionalId?: string
  patientId?: string
  name: string
  image: string | null
  lastMessageAt: string | null
  preview: string | null
  unread: number
  canSend: boolean
}

interface ChatMessage {
  id: string
  mine: boolean
  body: string
  createdAt: string
  readAt: string | null
  reported: boolean
}

const MAX_LENGTH = 2000
const POLL_MS = 8000

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function MensajesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ChatListItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [active, setActive] = useState<ChatListItem | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [canSend, setCanSend] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [crisis, setCrisis] = useState(false)
  const [threadLoading, setThreadLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const lastSeen = useRef<string | null>(null)

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/mensajes', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.conversations)
      }
    } catch {
      /* se reintenta en el siguiente ciclo */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated') void loadList()
  }, [status, router, loadList])

  const loadThread = useCallback(async (conversationId: string, incremental: boolean) => {
    const after = incremental && lastSeen.current ? `?after=${encodeURIComponent(lastSeen.current)}` : ''
    try {
      const res = await fetch(`/api/mensajes/${conversationId}${after}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setCanSend(data.canSend)
      const incoming: ChatMessage[] = data.messages
      if (incoming.length > 0) {
        lastSeen.current = incoming[incoming.length - 1].createdAt
        setMessages((prev) => (incremental ? [...prev, ...incoming.filter((m) => !prev.some((p) => p.id === m.id))] : incoming))
      } else if (!incremental) {
        setMessages([])
        lastSeen.current = null
      }
    } catch {
      /* ignora errores transitorios del polling */
    }
  }, [])

  // Polling mientras hay una conversacion abierta y la pestaña esta visible.
  useEffect(() => {
    if (!activeId) return
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadThread(activeId, true)
        void loadList()
      }
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [activeId, loadThread, loadList])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async (item: ChatListItem) => {
    setError('')
    setCrisis(false)
    setActive(item)
    setThreadLoading(true)
    lastSeen.current = null
    setMessages([])
    try {
      let conversationId = item.conversationId
      if (!conversationId) {
        const res = await fetch('/api/mensajes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.professionalId ? { professionalId: item.professionalId } : { patientId: item.patientId }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error || 'No pudimos abrir el chat.')
          setActive(null)
          return
        }
        conversationId = data.conversationId as string
        void loadList()
      }
      setActiveId(conversationId)
      await loadThread(conversationId, false)
      void loadList()
    } finally {
      setThreadLoading(false)
    }
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeId || !draft.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/mensajes/${activeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'No pudimos enviar el mensaje.')
        return
      }
      if (data.crisis) setCrisis(true)
      setDraft('')
      await loadThread(activeId, true)
      void loadList()
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const report = async (messageId: string) => {
    if (!activeId) return
    const reason = window.prompt('¿Por qué quieres reportar este mensaje?')
    if (!reason) return
    const res = await fetch(`/api/mensajes/${activeId}/reportar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, reason }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reported: true } : m)))
      window.alert(data.message || 'Reporte enviado.')
    } else {
      window.alert(data.error || 'No pudimos enviar el reporte.')
    }
  }

  const isPatient = session?.user?.role === 'PATIENT'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    )
  }

  const showThread = active != null

  return (
    <>
      <Header />
      <PageContainer variant="dashboard" size="wide">
        <div className="flex items-center justify-between mb-4">
          <BackToDashboard />
          <ImmediateHelpModal />
        </div>

        <PageHeader
          title="Mensajes"
          description="Canal seguro dentro de PsyDoctor para coordinar con tu cita confirmada"
        />

        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl mb-4 text-xs text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold mb-1">Los mensajes no son para emergencias.</p>
            <p className="text-amber-900/90 leading-relaxed">
              Si necesitas ayuda urgente, llama al <strong>*4141</strong> (24/7) o usa el botón de ayuda inmediata.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {isPatient ? 'Aún no tienes un chat activo' : 'Aún no tienes conversaciones'}
            </h3>
            <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              El chat se activa cuando hay una cita confirmada entre paciente y profesional.
            </p>
            {isPatient && (
              <Link
                href="/buscar"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white transition"
              >
                Encontrar apoyo
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-[300px_1fr] gap-4 min-h-[480px]">
            {/* Lista */}
            <aside className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${showThread ? 'hidden md:block' : ''}`}>
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => openChat(item)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${active?.key === item.key ? 'bg-teal-50/60' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">{item.name}</span>
                        {item.unread > 0 && (
                          <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white">{item.unread}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.preview ?? (item.canSend ? 'Inicia la conversación' : 'Sin mensajes')}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Conversacion */}
            <section className={`bg-white rounded-2xl border border-slate-200 flex flex-col ${showThread ? '' : 'hidden md:flex'}`}>
              {!active ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-slate-500">
                  Selecciona una conversación para comenzar.
                </div>
              ) : (
                <>
                  <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActive(null)
                        setActiveId(null)
                      }}
                      className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                      aria-label="Volver a la lista"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{active.name}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-teal-600" /> Mensajes cifrados · no compartas correos, teléfonos ni enlaces
                      </p>
                    </div>
                  </header>

                  {crisis && (
                    <div role="alert" className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 flex items-start gap-2">
                      <HeartPulse className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>
                        Si estás pasando por un momento muy difícil, no estás solo/a. Llama ahora al <strong>*4141</strong> (24/7),
                        al <strong>600 360 7777</strong> o al <strong>131</strong> (SAMU).
                      </p>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[420px]">
                    {threadLoading && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
                      </div>
                    )}
                    {!threadLoading && messages.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-6">Aún no hay mensajes. Escribe el primero.</p>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.mine ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <div className={`mt-1 flex items-center gap-2 text-[10px] ${m.mine ? 'text-teal-100' : 'text-slate-400'}`}>
                            <span>{fmtTime(m.createdAt)}</span>
                            {m.mine && m.readAt && <span>· leído</span>}
                            {!m.mine && !m.reported && (
                              <button type="button" onClick={() => report(m.id)} className="inline-flex items-center gap-0.5 hover:text-slate-600" title="Reportar mensaje">
                                <Flag className="h-3 w-3" /> Reportar
                              </button>
                            )}
                            {!m.mine && m.reported && <span>· reportado</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {error && (
                    <p role="alert" className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}

                  {canSend ? (
                    <form onSubmit={send} className="border-t border-slate-100 p-3 flex items-end gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            void send(e as unknown as React.FormEvent)
                          }
                        }}
                        rows={2}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                      />
                      <button
                        type="submit"
                        disabled={sending || !draft.trim()}
                        className="rounded-xl bg-teal-800 p-3 text-white hover:bg-teal-900 disabled:bg-slate-300 transition"
                        aria-label="Enviar mensaje"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  ) : (
                    <p className="border-t border-slate-100 p-3 text-center text-xs text-slate-500">
                      Este chat está en modo de solo lectura: no hay una cita vigente entre ambos.
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  )
}
