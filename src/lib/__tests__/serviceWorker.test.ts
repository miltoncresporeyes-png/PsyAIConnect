/** @jest-environment node */
import fs from 'fs'
import path from 'path'
import vm from 'vm'

const root = path.resolve(__dirname, '../../..')
const swSource = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8')

function loadSw(fetchImpl: () => Promise<any>) {
    const listeners: Record<string, (e: any) => void> = {}
    const cache = { match: jest.fn(async (r: any) => (typeof r === 'string' ? { offline: true } : undefined)), put: jest.fn(), addAll: jest.fn() }
    const ctx: any = {
        self: { location: { origin: 'https://psydoctor.cl' }, addEventListener: (t: string, f: any) => (listeners[t] = f), skipWaiting: jest.fn(), clients: { claim: jest.fn() } },
        caches: { open: async () => cache, match: cache.match, keys: async () => [], delete: jest.fn() },
        fetch: fetchImpl,
        URL,
        Promise,
    }
    vm.runInNewContext(swSource, ctx)
    return { listeners, cache }
}

function fire(listeners: any, url: string, opts: { method?: string; mode?: string } = {}) {
    const respondWith = jest.fn()
    listeners.fetch({ request: { url, method: opts.method ?? 'GET', mode: opts.mode ?? 'cors' }, respondWith })
    return respondWith
}

describe('service worker', () => {
    it('no intercepta /api ni páginas privadas que no sean navegación', () => {
        const { listeners } = loadSw(async () => ({ ok: true, clone: () => ({}) }))
        expect(fire(listeners, 'https://psydoctor.cl/api/appointments')).not.toHaveBeenCalled()
        expect(fire(listeners, 'https://psydoctor.cl/dashboard')).not.toHaveBeenCalled()
        expect(fire(listeners, 'https://psydoctor.cl/api/x', { method: 'POST' })).not.toHaveBeenCalled()
        expect(fire(listeners, 'https://otro.com/_next/static/a.js')).not.toHaveBeenCalled()
    })

    it('navegación: va a la red y cae a offline si falla', async () => {
        const { listeners } = loadSw(() => Promise.reject(new Error('offline')))
        const spy = fire(listeners, 'https://psydoctor.cl/dashboard', { mode: 'navigate' })
        expect(spy).toHaveBeenCalled()
        await expect(spy.mock.calls[0][0]).resolves.toEqual({ offline: true })
    })

    it('estáticos públicos usan caché', () => {
        const { listeners } = loadSw(async () => ({ ok: true, clone: () => ({}) }))
        expect(fire(listeners, 'https://psydoctor.cl/_next/static/chunk.js')).toHaveBeenCalled()
    })
})

describe('PWA assets', () => {
    it('los íconos y la página offline existen', () => {
        for (const f of ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'offline.html']) {
            expect(fs.existsSync(path.join(root, 'public', f))).toBe(true)
        }
    })

    it('el manifest referencia solo íconos existentes', async () => {
        const manifest = (await import('@/app/manifest')).default()
        expect(manifest.display).toBe('standalone')
        for (const icon of manifest.icons ?? []) {
            expect(fs.existsSync(path.join(root, 'public', icon.src))).toBe(true)
        }
        expect(manifest.icons?.some((i) => i.purpose === 'maskable')).toBe(true)
    })
})
