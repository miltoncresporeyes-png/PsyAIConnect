type RateLimitEntry = {
    count: number
    resetAt: number
}

type RateLimitConfig = {
    limit: number
    windowMs: number
}

type RateLimitResult = {
    allowed: boolean
    remaining: number
    retryAfterSeconds: number
    resetAt: number
    limit: number
}

const globalStore = globalThis as typeof globalThis & {
    __psyRateLimitStore?: Map<string, RateLimitEntry>
}

const store = globalStore.__psyRateLimitStore ?? new Map<string, RateLimitEntry>()
if (!globalStore.__psyRateLimitStore) {
    globalStore.__psyRateLimitStore = store
}

function now() {
    return Date.now()
}

function cleanupExpiredEntries(currentTime: number) {
    store.forEach((entry, key) => {
        if (entry.resetAt <= currentTime) {
            store.delete(key)
        }
    })
}

export function getClientIp(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const candidate = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
    return candidate || 'unknown'
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const currentTime = now()

    if (store.size > 5000) {
        cleanupExpiredEntries(currentTime)
    }

    const existing = store.get(key)

    if (!existing || existing.resetAt <= currentTime) {
        const resetAt = currentTime + config.windowMs
        store.set(key, { count: 1, resetAt })
        return {
            allowed: true,
            remaining: Math.max(0, config.limit - 1),
            retryAfterSeconds: Math.ceil(config.windowMs / 1000),
            resetAt,
            limit: config.limit,
        }
    }

    existing.count += 1
    store.set(key, existing)

    const allowed = existing.count <= config.limit
    const remaining = Math.max(0, config.limit - existing.count)
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000))

    return {
        allowed,
        remaining,
        retryAfterSeconds,
        resetAt: existing.resetAt,
        limit: config.limit,
    }
}

export function createRateLimitHeaders(result: RateLimitResult) {
    return {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
        'Retry-After': String(result.retryAfterSeconds),
    }
}
