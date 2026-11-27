'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { PageContainer, PageHeader } from '../../../components/layout/shell'

interface Status {
    configured: boolean
    connected: boolean
    accountEmail: string | null
    connectedAt: string | null
}

export default function AdminSalasPage() {
    const params = useSearchParams()
    const [status, setStatus] = useState<Status | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)

    const load = useCallback(async () => {
        const res = await fetch('/api/admin/google-meet/status')
        if (res.ok) setStatus(await res.json())
        setLoading(false)
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const disconnect = async () => {
        if (!confirm('¿Desconectar la cuenta de Google? Las citas nuevas no podrán crear su sala de Meet hasta volver a conectarla.')) return
        setBusy(true)
        await fetch('/api/admin/google-meet/status', { method: 'DELETE' })
        await load()
        setBusy(false)
    }

    const error = params?.get('error')
    const ok = params?.get('ok')

    return (
        <PageContainer variant="dashboard" size="medium">
            <PageHeader
                title="Salas de videollamada"
                description="Cada cita recibe su propia sala de Google Meet, creada con la cuenta de Google de PsyDoctor."
            />

            {ok && (
                <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Cuenta de Google conectada correctamente.
                </div>
            )}
            {error && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    No se pudo conectar la cuenta de Google: {error}
                </div>
            )}

            <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center text-sky-700">
                        <Video className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Cuenta de Google para Meet</h2>
                </div>

                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                ) : !status?.configured ? (
                    <div className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Faltan las variables <code>GOOGLE_MEET_CLIENT_ID</code> y <code>GOOGLE_MEET_CLIENT_SECRET</code> en el
                        servidor.
                    </div>
                ) : status.connected ? (
                    <div>
                        <p className="flex items-center gap-2 text-sm text-emerald-800">
                            <CheckCircle2 className="w-4 h-4" />
                            Conectada{status.accountEmail ? ` como ${status.accountEmail}` : ''}
                            {status.connectedAt ? ` · desde el ${new Date(status.connectedAt).toLocaleDateString('es-CL')}` : ''}
                        </p>
                        <div className="mt-4 flex gap-3">
                            <a
                                href="/api/admin/google-meet/connect"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Reconectar
                            </a>
                            <button
                                type="button"
                                onClick={disconnect}
                                disabled={busy}
                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Desconectar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-slate-600 mb-4">
                            Aún no hay una cuenta conectada. Autoriza la cuenta de Google que creará las salas de Meet de las
                            citas online.
                        </p>
                        <a href="/api/admin/google-meet/connect" className="btn-primary inline-block">
                            Conectar cuenta de Google
                        </a>
                    </div>
                )}
            </div>

            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                Las salas se crean con acceso abierto y un enlace único por cita. Solo se entrega al paciente y al profesional,
                dentro de la ventana de la cita (desde 15 minutos antes).
            </p>
        </PageContainer>
    )
}
