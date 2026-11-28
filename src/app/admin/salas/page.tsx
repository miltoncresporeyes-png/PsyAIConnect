'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminData } from '@/components/admin/useAdminData'
import { Card, ErrorBox, Pill, Spinner } from '@/components/admin/ui'
import { formatDate } from '@/components/admin/format'

interface MeetStatus {
    configured: boolean
    connected: boolean
    accountEmail: string | null
    connectedAt: string | null
}

const BTN = 'inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 text-sm font-medium sm:min-h-0 sm:py-2'

function SalasInner() {
    const params = useSearchParams()
    const { data: status, error, loading, reload } = useAdminData<MeetStatus>('/api/admin/google-meet/status')
    const [busy, setBusy] = useState(false)

    const disconnect = async () => {
        if (!window.confirm('¿Desconectar la cuenta de Google? Las citas nuevas no podrán crear su sala de Meet hasta volver a conectarla.')) return
        setBusy(true)
        await fetch('/api/admin/google-meet/status', { method: 'DELETE' })
        reload()
        setBusy(false)
    }

    const oauthError = params?.get('error')
    const oauthOk = params?.get('ok')

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl font-semibold text-slate-900">Salas de video</h1>
                <p className="text-sm text-slate-500">Cada cita recibe su propia sala de Google Meet, creada con la cuenta de Google de PsyDoctor.</p>
            </header>

            {oauthOk && (
                <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Cuenta de Google conectada correctamente.
                </p>
            )}
            {oauthError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    No se pudo conectar la cuenta de Google: {oauthError}
                </p>
            )}
            {error && <ErrorBox message={error} />}

            <Card title="Cuenta de Google para Meet">
                {loading && !status ? (
                    <Spinner />
                ) : !status?.configured ? (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Faltan las variables <code>GOOGLE_MEET_CLIENT_ID</code> y <code>GOOGLE_MEET_CLIENT_SECRET</code> en el servidor.
                    </p>
                ) : status.connected ? (
                    <div className="space-y-3">
                        <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                            <Pill tone="ok">Conectada</Pill>
                            {status.accountEmail ?? ''}
                            {status.connectedAt ? <span className="text-slate-500">· desde el {formatDate(status.connectedAt)}</span> : null}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a href="/api/admin/google-meet/connect" className={`${BTN} border border-slate-200 text-slate-700 hover:bg-slate-50`}>
                                Reconectar
                            </a>
                            <button
                                type="button"
                                onClick={disconnect}
                                disabled={busy}
                                className={`${BTN} border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50`}
                            >
                                Desconectar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-600">
                            Aún no hay una cuenta conectada. Autoriza la cuenta de Google que creará las salas de Meet de las citas online.
                        </p>
                        <a href="/api/admin/google-meet/connect" className={`${BTN} bg-slate-900 text-white hover:bg-slate-800`}>
                            Conectar cuenta de Google
                        </a>
                    </div>
                )}
            </Card>

            <p className="text-xs leading-relaxed text-slate-500">
                Las salas se crean con acceso abierto y un enlace único por cita. Solo se entrega al paciente y al profesional, dentro de la
                ventana de la cita (desde 15 minutos antes).
            </p>
        </div>
    )
}

export default function AdminSalasPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <SalasInner />
        </Suspense>
    )
}
