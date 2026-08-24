import { checkRateLimit, createRateLimitHeaders } from '@/lib/rateLimit'

describe('rateLimit', () => {
    beforeEach(() => {
        const globalWithStore = globalThis as typeof globalThis & {
            __psyRateLimitStore?: Map<string, { count: number; resetAt: number }>
        }

        globalWithStore.__psyRateLimitStore?.clear()
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
})
