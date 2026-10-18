/** @jest-environment node */

import { checkRateLimit, createRateLimitHeaders, getClientIp, isValidIp } from '@/lib/rateLimit'

describe('rateLimit', () => {
    const originalEnv = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...originalEnv }
        const globalWithStore = globalThis as typeof globalThis & {
            __psyRateLimitStore?: Map<string, { count: number; resetAt: number }>
        }

        globalWithStore.__psyRateLimitStore?.clear()
    })

    afterAll(() => {
        process.env = originalEnv
    })

    it('allows requests under limit', () => {
        const result = checkRateLimit('test-key', { limit: 3, windowMs: 60_000 })

        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(2)
        expect(result.limit).toBe(3)
    })

    it('blocks requests over limit', () => {
        checkRateLimit('test-key', { limit: 2, windowMs: 60_000 })
        checkRateLimit('test-key', { limit: 2, windowMs: 60_000 })
        const blocked = checkRateLimit('test-key', { limit: 2, windowMs: 60_000 })

        expect(blocked.allowed).toBe(false)
        expect(blocked.remaining).toBe(0)
        expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1)
    })

    it('creates standard ratelimit headers', () => {
        const result = checkRateLimit('header-key', { limit: 1, windowMs: 30_000 })
        const headers = createRateLimitHeaders(result)

        expect(headers['X-RateLimit-Limit']).toBe('1')
        expect(headers['X-RateLimit-Remaining']).toBe('0')
        expect(headers['X-RateLimit-Reset']).toMatch(/^\d+$/)
        expect(headers['Retry-After']).toMatch(/^\d+$/)
    })

    describe('isValidIp', () => {
        it('valida IPv4 válidas', () => {
            expect(isValidIp('192.168.1.1')).toBe(true)
            expect(isValidIp('10.0.0.1')).toBe(true)
            expect(isValidIp('200.55.12.34')).toBe(true)
        })

        it('rechaza IPv4 inválidas', () => {
            expect(isValidIp('256.0.0.1')).toBe(false)
            expect(isValidIp('192.168.1')).toBe(false)
            expect(isValidIp('192.168.1.1.1')).toBe(false)
            expect(isValidIp('foo.bar')).toBe(false)
        })

        it('valida IPv6 válidas', () => {
            expect(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
            expect(isValidIp('::1')).toBe(true)
            expect(isValidIp('2800:150:12f:8f5:3172:a5c5:cdd4:4d29')).toBe(true)
        })
    })

    describe('getClientIp', () => {
        const createReq = (headers: Record<string, string>) => {
            return new Request('http://localhost:3000/api/test', {
                headers: new Headers(headers),
            })
        }

        it('con TRUSTED_PROXY_COUNT=1 (por defecto), toma la última IP del final ignorando IPs falsificadas al inicio', () => {
            delete process.env.TRUSTED_PROXY_COUNT
            // Atacante inyectó 1.1.1.1, pero el proxy de Railway añadió 200.1.1.1 al final
            const req = createReq({
                'x-forwarded-for': '1.1.1.1, 200.1.1.1',
            })
            expect(getClientIp(req)).toBe('200.1.1.1')
        })

        it('con TRUSTED_PROXY_COUNT=2 (ej. Cloudflare + Railway), toma la penúltima IP', () => {
            process.env.TRUSTED_PROXY_COUNT = '2'
            // Cliente -> Cloudflare (añade IP real 190.10.20.30) -> Railway Proxy (10.0.0.2)
            const req = createReq({
                'x-forwarded-for': 'attacker-spoofed.com, 190.10.20.30, 10.0.0.2',
            })
            expect(getClientIp(req)).toBe('190.10.20.30')
        })

        it('funciona correctamente con un solo valor en x-forwarded-for', () => {
            delete process.env.TRUSTED_PROXY_COUNT
            const req = createReq({
                'x-forwarded-for': '200.55.12.34',
            })
            expect(getClientIp(req)).toBe('200.55.12.34')
        })

        it('soporta direcciones IPv6 en x-forwarded-for', () => {
            delete process.env.TRUSTED_PROXY_COUNT
            const req = createReq({
                'x-forwarded-for': '1.1.1.1, 2800:150:12f:8f5:3172:a5c5:cdd4:4d29',
            })
            expect(getClientIp(req)).toBe('2800:150:12f:8f5:3172:a5c5:cdd4:4d29')
        })

        it('si la posición calculada es inválida o la lista es más corta, usa la última entrada válida', () => {
            process.env.TRUSTED_PROXY_COUNT = '3'
            const req = createReq({
                'x-forwarded-for': 'invalid-host, 190.10.20.30',
            })
            expect(getClientIp(req)).toBe('190.10.20.30')
        })

        it('si x-forwarded-for está vacío o solo contiene basura, usa x-real-ip si es válida', () => {
            const req = createReq({
                'x-forwarded-for': 'invalid-ip',
                'x-real-ip': '186.20.30.40',
            })
            expect(getClientIp(req)).toBe('186.20.30.40')
        })

        it('si no hay ninguna cabecera válida, retorna "unknown"', () => {
            const req = createReq({
                'x-forwarded-for': 'invalid-ip',
                'x-real-ip': 'malicious-domain.com',
            })
            expect(getClientIp(req)).toBe('unknown')
        })

        it('retorna "unknown" si no hay cabeceras presentes', () => {
            const req = createReq({})
            expect(getClientIp(req)).toBe('unknown')
        })
    })
})
