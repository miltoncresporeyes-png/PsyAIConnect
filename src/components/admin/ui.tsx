'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react'
import { formatNumber, shortDay } from '@/components/admin/format'

/* ───────────────────────── Estructura ───────────────────────── */

export function Card({ title, subtitle, action, children, className = '' }: {
    title?: string
    subtitle?: string
    action?: ReactNode
    children: ReactNode
    className?: string
}) {
    return (
        <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
            {(title || action) && (
                <header className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
                        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                    </div>
                    {action}
                </header>
            )}
            {children}
        </section>
    )
}

export function Spinner() {
    return (
        <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-slate-400" aria-label="Cargando" />
        </div>
    )
}

export function ErrorBox({ message }: { message: string }) {
    return (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
        </div>
    )
}

/* ───────────────────────── KPI ───────────────────────── */

export function KpiCard({ label, value, hint, delta, href }: {
    label: string
    value: string
    hint?: string
    /** Variacion porcentual respecto al periodo anterior (positivo = mejora). */
    delta?: number | null
    href?: string
}) {
    const body = (
        <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
            <div className="mt-1 flex items-center gap-2 text-xs">
                {delta != null && (
                    <span className={`inline-flex items-center gap-0.5 font-medium ${delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
                        {Math.abs(delta).toLocaleString('es-CL')} %
                        <span className="sr-only">{delta >= 0 ? ' más' : ' menos'} que el periodo anterior</span>
                    </span>
                )}
                {hint && <span className="text-slate-500">{hint}</span>}
            </div>
        </div>
    )
    return href ? <Link href={href} className="block h-full">{body}</Link> : body
}

/* ───────────────────────── Estados y alertas ───────────────────────── */

const PILL_STYLES = {
    ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warn: 'bg-amber-50 text-amber-900 border-amber-200',
    bad: 'bg-red-50 text-red-800 border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
} as const

export type PillTone = keyof typeof PILL_STYLES

/** Estado con icono + texto (nunca solo color). */
export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
    const Icon = tone === 'ok' ? CheckCircle2 : tone === 'bad' ? AlertCircle : tone === 'warn' ? AlertTriangle : tone === 'info' ? Info : null
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${PILL_STYLES[tone]}`}>
            {Icon && <Icon className="h-3 w-3" aria-hidden />}
            {children}
        </span>
    )
}

export interface AlertItem {
    id: string
    severity: 'critical' | 'warning' | 'info'
    title: string
    detail: string
    href?: string
}

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
    if (alerts.length === 0) {
        return (
            <p className="flex items-center gap-2 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Todo en orden: no hay alertas activas.
            </p>
        )
    }
    const tone = { critical: 'border-red-200 bg-red-50', warning: 'border-amber-200 bg-amber-50', info: 'border-sky-200 bg-sky-50' }
    const label = { critical: 'Crítico', warning: 'Atención', info: 'Aviso' }
    return (
        <ul className="space-y-2">
            {alerts.map((a) => {
                const row = (
                    <div className={`rounded-xl border px-3 py-2.5 ${tone[a.severity]}`}>
                        <p className="text-sm font-medium text-slate-900">
                            <span className="mr-2 text-[10px] font-bold uppercase tracking-wide text-slate-600">{label[a.severity]}</span>
                            {a.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">{a.detail}</p>
                    </div>
                )
                return <li key={a.id}>{a.href ? <Link href={a.href} className="block hover:opacity-90">{row}</Link> : row}</li>
            })}
        </ul>
    )
}

/* ───────────────────────── Gráficos (SVG, sin dependencias) ───────────────────────── */

// Paleta categórica de referencia (claro): slot 1 azul, slot 2 naranja.
export const CHART_COLORS = { s1: '#2a78d6', s2: '#eb6834' }

export interface ChartSeries {
    name: string
    color: string
    points: { date: string; value: number }[]
}

function niceMax(max: number): number {
    if (max <= 4) return 4
    const pow = Math.pow(10, Math.floor(Math.log10(max)))
    const n = max / pow
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

/**
 * Lineas de tendencia diaria. Una o dos series, un solo eje, grilla recesiva, lineas de 2 px,
 * leyenda con >= 2 series, hover con cursor + tooltip y tabla de datos alternativa.
 */
export function LineChart({ series, height = 200, ariaLabel }: { series: ChartSeries[]; height?: number; ariaLabel: string }) {
    const W = 640
    const H = height
    const pad = { l: 34, r: 12, t: 10, b: 24 }
    const n = series[0]?.points.length ?? 0
    const max = niceMax(Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value))))
    const [hover, setHover] = useState<number | null>(null)
    const ref = useRef<SVGSVGElement>(null)

    const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r))
    const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
    const ticks = [0, max / 2, max]
    const paths = useMemo(
        () => series.map((s) => s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [series, max, height]
    )
    const total = series.map((s) => s.points.reduce((a, p) => a + p.value, 0))

    const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect || n === 0) return
        const px = ((e.clientX - rect.left) / rect.width) * W
        const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1))
        setHover(Math.max(0, Math.min(n - 1, i)))
    }

    return (
        <div>
            {series.length >= 2 && (
                <ul className="mb-2 flex flex-wrap gap-4 text-xs text-slate-600">
                    {series.map((s, idx) => (
                        <li key={s.name} className="flex items-center gap-1.5">
                            <span aria-hidden className="inline-block h-0.5 w-4 rounded" style={{ background: s.color }} />
                            {s.name} <span className="font-medium text-slate-900 tabular-nums">({formatNumber(total[idx])})</span>
                        </li>
                    ))}
                </ul>
            )}
            <div className="relative">
                <svg
                    ref={ref}
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full"
                    role="img"
                    aria-label={ariaLabel}
                    onMouseMove={onMove}
                    onMouseLeave={() => setHover(null)}
                >
                    {ticks.map((t) => (
                        <g key={t}>
                            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e7e5e4" strokeWidth={1} />
                            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="#78716c">
                                {formatNumber(Math.round(t))}
                            </text>
                        </g>
                    ))}
                    {n > 0 && [0, Math.floor((n - 1) / 2), n - 1].map((i) => (
                        <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={10} fill="#78716c">
                            {shortDay(series[0].points[i].date)}
                        </text>
                    ))}
                    {series.map((s, idx) => (
                        <path key={s.name} d={paths[idx]} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    ))}
                    {hover != null && (
                        <g pointerEvents="none">
                            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#a8a29e" strokeWidth={1} />
                            {series.map((s) => (
                                <circle key={s.name} cx={x(hover)} cy={y(s.points[hover].value)} r={4} fill={s.color} stroke="#ffffff" strokeWidth={2} />
                            ))}
                        </g>
                    )}
                </svg>
                {hover != null && (
                    <div
                        className="pointer-events-none absolute top-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md"
                        style={{ left: `${(x(hover) / W) * 100}%`, transform: hover > n / 2 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)' }}
                    >
                        <p className="font-medium text-slate-900">{shortDay(series[0].points[hover].date)}</p>
                        {series.map((s) => (
                            <p key={s.name} className="flex items-center gap-1.5 text-slate-600">
                                <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                                {s.name}: <span className="font-medium text-slate-900 tabular-nums">{formatNumber(s.points[hover].value)}</span>
                            </p>
                        ))}
                    </div>
                )}
            </div>
            <details className="mt-2 text-xs text-slate-500">
                <summary className="cursor-pointer select-none hover:text-slate-700">Ver datos en tabla</summary>
                <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-2 py-1 font-medium">Día</th>
                                {series.map((s) => <th key={s.name} className="px-2 py-1 font-medium">{s.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {series[0]?.points.map((p, i) => (
                                <tr key={p.date} className="border-t border-slate-100">
                                    <td className="px-2 py-1">{shortDay(p.date)}</td>
                                    {series.map((s) => <td key={s.name} className="px-2 py-1 tabular-nums">{s.points[i].value}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    )
}

/** Barras horizontales de un solo tono (embudo, distribuciones). El primer valor es la base del porcentaje. */
export function BarList({ rows, base, color = CHART_COLORS.s1, showPercent = true }: {
    rows: { label: string; value: number; hint?: string }[]
    base?: number
    color?: string
    showPercent?: boolean
}) {
    const top = base ?? Math.max(1, ...rows.map((r) => r.value))
    return (
        <ul className="space-y-3">
            {rows.map((r) => {
                const w = top > 0 ? Math.max(r.value > 0 ? 2 : 0, (r.value / top) * 100) : 0
                return (
                    <li key={r.label}>
                        <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                            <span className="text-slate-700">{r.label}{r.hint && <span className="ml-1 text-slate-400">{r.hint}</span>}</span>
                            <span className="font-medium text-slate-900 tabular-nums">
                                {formatNumber(r.value)}
                                {showPercent && top > 0 && <span className="ml-1.5 font-normal text-slate-500">{Math.round((r.value / top) * 100)} %</span>}
                            </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-r-md rounded-l-sm bg-slate-100">
                            <div className="h-full rounded-r-md" style={{ width: `${w}%`, background: color }} />
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

/* ───────────────────────── Tablas y filtros ───────────────────────── */

export function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
    return (
        <nav className="flex items-center justify-between pt-3 text-xs text-slate-600" aria-label="Paginación">
            <span>{formatNumber(total)} resultado{total === 1 ? '' : 's'}</span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPage(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2.5 sm:px-2.5 sm:py-1.5 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Anterior
                </button>
                <span className="tabular-nums">Página {page} de {totalPages}</span>
                <button
                    type="button"
                    onClick={() => onPage(page + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2.5 sm:px-2.5 sm:py-1.5 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Siguiente <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
            </div>
        </nav>
    )
}

export function SelectFilter({ label, value, onChange, options }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
}) {
    return (
        <label className="flex flex-col gap-1 text-xs text-slate-500">
            {label}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 sm:py-1.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    )
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-500 min-w-[200px]">
            Buscar
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 sm:py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
        </label>
    )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
    return <th className={`whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-slate-500 ${className}`}>{children}</th>
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
    return <td className={`px-3 py-2.5 text-sm text-slate-800 ${className}`}>{children}</td>
}

/** Debounce simple para campos de busqueda. */
export function useDebounced<T>(value: T, ms = 300): T {
    const [v, setV] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setV(value), ms)
        return () => clearTimeout(timer)
    }, [value, ms])
    return v
}
