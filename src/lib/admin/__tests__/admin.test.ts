/** @jest-environment node */

import { chileDay, change, cronStatus, fillSeries, lastNDays, pct } from '@/lib/admin/series'
import { pageMeta, parseDate, parseEnum, parsePagination, parseSearch } from '@/lib/admin/query'
import { buildAlerts } from '@/lib/admin/metrics'
import { checkConfig, type SystemHealth } from '@/lib/admin/health'

jest.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique: jest.fn() } } }))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'

describe('series', () => {
    it('lastNDays devuelve N dias ascendentes terminando hoy (hora de Chile)', () => {
        const now = new Date('2026-11-27T12:00:00Z')
        const days = lastNDays(3, now)
        expect(days).toHaveLength(3)
        expect(days[2]).toBe(chileDay(now))
        expect(days[0] < days[1] && days[1] < days[2]).toBe(true)
    })

    it('chileDay usa la zona horaria de Chile, no UTC', () => {
        // 01:30 UTC del 27 sigue siendo 26 en Chile (UTC-3 en verano)
        expect(chileDay(new Date('2026-11-27T01:30:00Z'))).toBe('2026-11-26')
    })

    it('fillSeries completa con ceros los dias sin datos', () => {
        const out = fillSeries([{ day: '2026-11-26', n: 4 }], ['2026-11-25', '2026-11-26', '2026-11-27'])
        expect(out.map((p) => p.value)).toEqual([0, 4, 0])
    })

    it('pct y change manejan divisiones por cero', () => {
        expect(pct(1, 0)).toBeNull()
        expect(pct(1, 3)).toBe(33.3)
        expect(change(5, 0)).toBeNull()
        expect(change(15, 10)).toBe(50)
        expect(change(5, 10)).toBe(-50)
    })

    it('cronStatus: nunca, ok, atrasado y con error', () => {
        const now = new Date('2026-11-27T12:00:00Z')
        const minsAgo = (m: number) => new Date(now.getTime() - m * 60000)
        expect(cronStatus(null, now)).toBe('never')
        expect(cronStatus({ lastRunAt: minsAgo(5), lastStatus: 'ok' }, now)).toBe('ok')
        expect(cronStatus({ lastRunAt: minsAgo(5), lastStatus: 'error' }, now)).toBe('error')
        expect(cronStatus({ lastRunAt: minsAgo(30), lastStatus: 'ok' }, now)).toBe('late')
    })
})

describe('query', () => {
    it('parsePagination limita el tamano y la pagina minima', () => {
        const p = parsePagination(new URLSearchParams('page=0&pageSize=9999'), 25, 100)
        expect(p).toEqual({ page: 1, pageSize: 100, skip: 0 })
        expect(parsePagination(new URLSearchParams('page=3&pageSize=10')).skip).toBe(20)
    })

    it('parseEnum solo acepta valores permitidos', () => {
        const sp = new URLSearchParams('role=ADMIN&status=hack')
        expect(parseEnum(sp, 'role', ['ADMIN', 'PATIENT'] as const)).toBe('ADMIN')
        expect(parseEnum(sp, 'status', ['active', 'banned'] as const)).toBeNull()
    })

    it('parseSearch recorta y limita la longitud', () => {
        expect(parseSearch(new URLSearchParams('q=%20%20ana%20'))).toBe('ana')
        expect(parseSearch(new URLSearchParams('q=%20'))).toBeNull()
        expect(parseSearch(new URLSearchParams(`q=${'x'.repeat(200)}`))?.length).toBe(80)
    })

    it('parseDate valida el formato y pageMeta calcula paginas', () => {
        expect(parseDate(new URLSearchParams('from=2026-11-27'), 'from')).toBeInstanceOf(Date)
        expect(parseDate(new URLSearchParams('from=27/11/2026'), 'from')).toBeNull()
        expect(pageMeta(51, { page: 1, pageSize: 25, skip: 0 }).totalPages).toBe(3)
    })
})

const baseHealth: SystemHealth = {
    database: { ok: true, latencyMs: 3 },
    cron: { status: 'ok', lastRunAt: new Date().toISOString(), lastStatus: 'ok', lastResult: null, lastError: null, runCount: 5, expectedEveryMin: 10 },
    meet: { configured: true, connected: true, accountEmail: 'a@b.cl', connectedAt: null },
    invoices: { pending: 0, failed: 0, manualReview: 0 },
    config: [],
    waitlistMode: false,
}
const baseInput = {
    pendingVerification: 0,
    pendingFounders: 0,
    atRiskAppointments: 0,
    unreconfirmed24h: 0,
    verifiedWithoutAvailability: 0,
    verifiedProfessionals: 1,
    expiringSoonCount: 0,
    newTickets: 0,
    highPriorityOpenTickets: 0,
    health: baseHealth,
}

describe('buildAlerts', () => {
    it('sin problemas no hay alertas', () => {
        expect(buildAlerts(baseInput)).toEqual([])
    })

    it('cron atrasado y Meet desconectado con profesionales verificados son criticos y van primero', () => {
        const alerts = buildAlerts({
            ...baseInput,
            pendingVerification: 2,
            health: { ...baseHealth, cron: { ...baseHealth.cron, status: 'late' }, meet: { ...baseHealth.meet, connected: false } },
        })
        expect(alerts[0].severity).toBe('critical')
        expect(alerts.filter((a) => a.severity === 'critical').map((a) => a.id).sort()).toEqual(['cron-late', 'meet'])
        expect(alerts.some((a) => a.id === 'verify')).toBe(true)
    })

    it('Meet sin conectar es solo atencion si aun no hay profesionales verificados', () => {
        const alerts = buildAlerts({ ...baseInput, verifiedProfessionals: 0, health: { ...baseHealth, meet: { ...baseHealth.meet, connected: false } } })
        expect(alerts.find((a) => a.id === 'meet')?.severity).toBe('warning')
    })

    it('los tickets nuevos generan un aviso, y atencion si hay muchos o alguno es urgente', () => {
        expect(buildAlerts({ ...baseInput, newTickets: 2 }).find((a) => a.id === 'tickets')?.severity).toBe('info')
        expect(buildAlerts({ ...baseInput, newTickets: 5 }).find((a) => a.id === 'tickets')?.severity).toBe('warning')
        const urgent = buildAlerts({ ...baseInput, newTickets: 1, highPriorityOpenTickets: 1 }).find((a) => a.id === 'tickets')
        expect(urgent?.severity).toBe('warning')
        expect(urgent?.href).toBe('/admin/tickets?status=NEW')
        expect(buildAlerts(baseInput).some((a) => a.id === 'tickets')).toBe(false)
    })

    it('agrupa los ajustes de configuracion fallidos en una sola alerta', () => {
        const alerts = buildAlerts({
            ...baseInput,
            health: { ...baseHealth, config: [{ key: 'A', label: 'A', ok: false, detail: '' }, { key: 'B', label: 'B', ok: false, detail: '' }] },
        })
        expect(alerts.filter((a) => a.id === 'config')).toHaveLength(1)
    })
})

describe('checkConfig', () => {
    it('no expone valores secretos y valida su formato', () => {
        const checks = checkConfig({
            NEXTAUTH_URL: 'https://psydoctor.cl',
            NEXTAUTH_SECRET: 'x'.repeat(40),
            ENCRYPTION_KEY: 'a'.repeat(64),
            RESEND_API_KEY: 're_realsecretvalue123',
            GOOGLE_MEET_CLIENT_ID: 'id',
            GOOGLE_MEET_CLIENT_SECRET: 'secret',
            CRON_SECRET: 'c'.repeat(32),
        } as unknown as NodeJS.ProcessEnv)
        const serialized = JSON.stringify(checks)
        expect(serialized).not.toContain('realsecretvalue123')
        expect(serialized).not.toContain('x'.repeat(40))
        expect(serialized).not.toContain('c'.repeat(32))
        expect(checks.find((c) => c.key === 'NEXTAUTH_URL')?.detail).toBe('Dominio: psydoctor.cl')
        expect(checks.find((c) => c.key === 'CRON_SECRET')?.ok).toBe(true)
    })

    it('marca como revisar lo que falta o es invalido', () => {
        const checks = checkConfig({ NEXTAUTH_URL: 'http://ejemplo.com', ENCRYPTION_KEY: 'corta' } as unknown as NodeJS.ProcessEnv)
        for (const key of ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'ENCRYPTION_KEY', 'RESEND_API_KEY', 'GOOGLE_MEET', 'CRON_SECRET']) {
            expect(checks.find((c) => c.key === key)?.ok).toBe(false)
        }
    })
})

describe('requireAdmin', () => {
    const session = getServerSession as jest.Mock
    const findUnique = prisma.user.findUnique as jest.Mock
    beforeEach(() => jest.clearAllMocks())

    it('401 sin sesion', async () => {
        session.mockResolvedValue(null)
        const res = await requireAdmin()
        expect('error' in res && res.error.status).toBe(401)
    })

    it('403 si el rol en la base ya no es ADMIN, aunque el token diga lo contrario', async () => {
        session.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
        findUnique.mockResolvedValue({ id: 'u1', role: 'PATIENT', isActive: true, name: 'X', email: 'x@y.cl' })
        const res = await requireAdmin()
        expect('error' in res && res.error.status).toBe(403)
    })

    it('403 si el administrador fue desactivado', async () => {
        session.mockResolvedValue({ user: { id: 'u1' } })
        findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN', isActive: false, name: 'X', email: 'x@y.cl' })
        const res = await requireAdmin()
        expect('error' in res && res.error.status).toBe(403)
    })

    it('devuelve el contexto del administrador vigente', async () => {
        session.mockResolvedValue({ user: { id: 'u1' } })
        findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN', isActive: true, name: 'Ana', email: 'ana@psydoctor.cl' })
        const res = await requireAdmin()
        expect(res).toEqual({ adminId: 'u1', adminName: 'Ana', adminEmail: 'ana@psydoctor.cl' })
    })
})
