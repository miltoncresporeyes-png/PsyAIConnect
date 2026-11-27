'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2, AlertCircle, CheckCircle2, CalendarClock, PauseCircle, UserX } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { BackToDashboard } from '@/components/ui/BackToDashboard'
import {
    ANNUAL_MONTHS,
    PLANS,
    PLAN_ORDER,
    annualSavings,
    cyclePrice,
    quoteSubscription,
    type BillingMonths,
    type PlanTier,
} from '@/lib/plans'

interface SubscriptionData {
    tier: PlanTier
    ends: string | null
    expired: boolean
    cancelledAt: string | null
    paymentsEnabled: boolean
    orders: Array<{
        id: string
        kind: 'RENEW' | 'UPGRADE'
        fromTier: PlanTier
        toTier: PlanTier
        months: number
        amount: number
        status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
        createdAt: string
        paidAt: string | null
    }>
}

const clp = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : null

const STATUS_LABEL = { PENDING: 'Pendiente', PAID: 'Pagado', FAILED: 'Fallido', CANCELLED: 'Cancelado' } as const

function SuscripcionContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pago = searchParams?.get('pago')

    const [data, setData] = useState<SubscriptionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState<string | null>(null)
    const [cycle, setCycle] = useState<BillingMonths>(1)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/profesional/suscripcion', { cache: 'no-store' })
            if (res.ok) setData(await res.json())
            else setMessage({ type: 'error', text: 'No pudimos cargar tu suscripción.' })
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión.' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login')
        if (status === 'authenticated') {
            if (session?.user?.role !== 'PROFESSIONAL') router.replace('/dashboard')
            else void load()
        }
    }, [status, session, router, load])

    useEffect(() => {
        if (pago === 'ok') setMessage({ type: 'ok', text: 'Recibimos tu pago. Tu plan se activa en cuanto Mercado Pago lo confirme (suele ser inmediato).' })
        if (pago === 'pendiente') setMessage({ type: 'ok', text: 'Tu pago quedó pendiente. Te avisaremos cuando se acredite.' })
        if (pago === 'error') setMessage({ type: 'error', text: 'El pago no se completó. Puedes intentarlo de nuevo.' })
    }, [pago])

    const post = async (body: Record<string, unknown>, key: string) => {
        setBusy(key)
        setMessage(null)
        try {
            const res = await fetch('/api/profesional/suscripcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) {
                setMessage({ type: 'error', text: json.error || 'No se pudo completar la acción.' })
                return
            }
            if (json.checkoutUrl) {
                window.location.href = json.checkoutUrl
                return
            }
            setMessage({ type: 'ok', text: json.message || 'Listo.' })
            await load()
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión.' })
        } finally {
            setBusy(null)
        }
    }

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
        )
    }

    const current = PLANS[data.tier]
    const ends = data.ends ? new Date(data.ends) : null
    const isPaid = data.tier !== 'STARTER'
    const daysLeft = ends ? Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86400000)) : null
    const cancelled = Boolean(data.cancelledAt)

    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="mx-auto max-w-5xl">
                    <BackToDashboard />
                    <h1 className="mt-4 text-2xl font-bold text-slate-900">Mi plan y suscripción</h1>
                    <p className="text-sm text-slate-600 mb-6">
                        Renueva, escala de plan o gestiona tu suscripción. Lo que ves aquí es lo mismo que publicamos en{' '}
                        <Link href="/planes" className="text-teal-700 underline">Planes</Link>.
                    </p>

                    {message && (
                        <div
                            role="alert"
                            className={`mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                                message.type === 'ok'
                                    ? 'border-teal-200 bg-teal-50 text-teal-900'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                        >
                            {message.type === 'ok' ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {data.expired && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Tu plan de pago venció y tu cuenta volvió al Plan Inicial. Renueva para recuperar sus beneficios.
                        </div>
                    )}

                    {/* Plan actual */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 mb-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Plan actual</p>
                                <h2 className="text-2xl font-extrabold text-slate-900">{current.shortName}</h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {isPaid
                                        ? `${current.priceLabel} ${current.periodLabel}`
                                        : 'Sin costo mientras dure tu período del Programa Fundadores.'}
                                </p>
                            </div>
                            {isPaid && ends && (
                                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                                        <CalendarClock className="h-4 w-4 text-teal-700" />
                                        {cancelled ? 'Termina' : 'Se renueva hasta'} el {fmtDate(data.ends)}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {daysLeft} {daysLeft === 1 ? 'día restante' : 'días restantes'}
                                        {cancelled && ' · renovación cancelada'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                            {current.features.map((f) => (
                                <li key={f.text} className="flex items-start gap-2 text-sm text-slate-700">
                                    <Check className="h-4 w-4 mt-0.5 text-teal-600 flex-shrink-0" />
                                    <span>
                                        {f.text}
                                        {f.status === 'soon' && (
                                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                                Próximamente
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Renovar / escalar */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Renovar o escalar</h2>
                    <div
                        role="radiogroup"
                        aria-label="Ciclo de cobro"
                        className="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
                    >
                        {([1, ANNUAL_MONTHS] as BillingMonths[]).map((m) => (
                            <button
                                key={m}
                                type="button"
                                role="radio"
                                aria-checked={cycle === m}
                                onClick={() => setCycle(m)}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    cycle === m ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {m === 1 ? 'Mensual' : 'Anual'}
                                {m === ANNUAL_MONTHS && (
                                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                        12 meses, pagas 10
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    {!data.paymentsEnabled && (
                        <p className="mb-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                            Los pagos en línea de suscripción aún no están habilitados en este entorno.
                        </p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 mb-8">
                        {PLAN_ORDER.filter((t) => t !== 'STARTER').map((tier) => {
                            const plan = PLANS[tier]
                            const quote = quoteSubscription({
                                currentTier: data.tier,
                                currentEnds: ends,
                                targetTier: tier,
                                months: cycle,
                            })
                            const isCurrent = data.tier === tier
                            const label = quote
                                ? isCurrent
                                    ? `Renovar ${cycle === 1 ? '1 mes' : '12 meses'} · ${clp(quote.amount)}`
                                    : `Escalar a ${plan.shortName} · ${clp(quote.amount)}`
                                : 'Disponible al terminar tu período'
                            return (
                                <div key={tier} className={`rounded-2xl border p-5 bg-white ${isCurrent ? 'border-teal-400 ring-1 ring-teal-200' : 'border-slate-200'}`}>
                                    <div className="flex items-baseline justify-between">
                                        <h3 className="text-lg font-bold text-slate-900">{plan.shortName}</h3>
                                        <span className="text-sm font-semibold text-slate-700">
                                            {cycle === 1
                                                ? `${plan.priceLabel} ${plan.periodLabel}`
                                                : `${clp(cyclePrice(tier, cycle))} / año`}
                                        </span>
                                    </div>
                                    {cycle === ANNUAL_MONTHS && (
                                        <p className="text-xs font-semibold text-emerald-700 mt-1">
                                            Ahorras {clp(annualSavings(tier))}: 2 meses gratis
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-600 mt-1 mb-3">{plan.description}</p>
                                    {quote && quote.credit > 0 && (
                                        <p className="text-xs text-teal-800 mb-3">
                                            Incluye un crédito de {clp(quote.credit)} por el tiempo no usado de tu plan actual.
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        disabled={!quote || !data.paymentsEnabled || busy !== null}
                                        onClick={() => post({ action: 'checkout', tier, months: cycle }, tier)}
                                        className="w-full rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-500 transition inline-flex items-center justify-center gap-2"
                                    >
                                        {busy === tier && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {label}
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* Suspender / baja */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Pausar o dar de baja</h2>
                    <div className="grid gap-4 md:grid-cols-3 mb-8">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h3 className="font-bold text-slate-900 mb-1">Cancelar renovación</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Tu plan no se renovará. Conservas sus beneficios hasta la fecha de término.
                            </p>
                            {cancelled ? (
                                <button
                                    type="button"
                                    disabled={busy !== null}
                                    onClick={() => post({ action: 'reactivate' }, 'reactivate')}
                                    className="w-full rounded-xl border border-teal-300 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                                >
                                    Reactivar renovación
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={!isPaid || busy !== null}
                                    onClick={() => {
                                        if (window.confirm('¿Cancelar la renovación de tu plan? Mantienes los beneficios hasta su término.')) {
                                            void post({ action: 'cancel' }, 'cancel')
                                        }
                                    }}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
                                >
                                    {isPaid ? 'Cancelar renovación' : 'No aplica a tu plan'}
                                </button>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <PauseCircle className="h-4 w-4 text-amber-600" /> Pausar mi agenda
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Suspende temporalmente tu perfil y agenda (vacaciones, descanso). Puedes reactivar cuando quieras.
                            </p>
                            <Link href="/dashboard/cuenta" className="block w-full rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                Ir a pausar
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-white p-5">
                            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <UserX className="h-4 w-4 text-red-600" /> Dar de baja mi cuenta
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Elimina tu cuenta y datos según la ley. Esta acción es definitiva.
                            </p>
                            <Link href="/dashboard/cuenta" className="block w-full rounded-xl border border-red-300 px-4 py-2 text-center text-sm font-semibold text-red-700 hover:bg-red-50">
                                Ir a dar de baja
                            </Link>
                        </div>
                    </div>

                    {/* Historial */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Historial de cobros</h2>
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        {data.orders.length === 0 ? (
                            <p className="p-5 text-sm text-slate-500">Aún no tienes cobros de suscripción.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {data.orders.map((o) => (
                                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                                        <span className="text-slate-800">
                                            {o.kind === 'UPGRADE' ? 'Cambio a' : 'Renovación'} {PLANS[o.toTier].shortName} · {o.months} {o.months === 1 ? 'mes' : 'meses'}
                                        </span>
                                        <span className="text-slate-500">{fmtDate(o.createdAt)}</span>
                                        <span className="font-semibold text-slate-800">{clp(o.amount)}</span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{STATUS_LABEL[o.status]}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default function SuscripcionPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
                </div>
            }
        >
            <SuscripcionContent />
        </Suspense>
    )
}
