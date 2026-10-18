import { isIP } from 'net'

export type RateLimitEntry = {
    count: number
    resetAt: number
}

export type RateLimitConfig = {
    limit: number
    windowMs: number
}

export type RateLimitResult = {
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

export function isValidIp(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false
    const cleanIp = ip.trim()
    return isIP(cleanIp) !== 0
}

export function getClientIp(request: Request): string {
    const rawForwarded = request.headers.get('x-forwarded-for')
    if (rawForwarded) {
        const parts = rawForwarded
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p.length > 0)

        if (parts.length > 0) {
            const rawCount = process.env.TRUSTED_PROXY_COUNT
            const parsedCount = rawCount ? parseInt(rawCount, 10) : 1
            const trustedProxyCount = Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : 1

            const targetIndex = parts.length - trustedProxyCount
            const candidate = targetIndex >= 0 ? parts[targetIndex] : parts[0]

            if (isValidIp(candidate)) {
                return candidate
            }

            for (let i = parts.length - 1; i >= 0; i--) {
                if (isValidIp(parts[i])) {
                    return parts[i]
                }
            }
        }
    }

    const realIp = request.headers.get('x-real-ip')?.trim()
    if (realIp && isValidIp(realIp)) {
        return realIp
    }

    return 'unknown'
}

/**
 * Motor síncrono en memoria (local / fallback seguro)
 */
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

/**
 * Motor distribuido (Upstash Redis REST API) con fallback resiliente en memoria.
 * Se activa automáticamente cuando UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN están definidos.
 */
export async function checkRateLimitAsync(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!upstashUrl || !upstashToken) {
        return checkRateLimit(key, config)
    }

    try {
        const windowSec = Math.ceil(config.windowMs / 1000)
        const redisKey = `ratelimit:${key}`

        // Pipeline atómico INCR + EXPIRE si es nueva clave
        const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${upstashToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([
                ['INCR', redisKey],
                ['TTL', redisKey],
            ]),
            signal: AbortSignal.timeout(1500),
        })

        if (!pipelineRes.ok) {
            throw new Error(`Upstash response HTTP ${pipelineRes.status}`)
        }

        const data = await pipelineRes.json()
        const count = data[0]?.result ?? 1
        let ttl = data[1]?.result ?? windowSec

        if (ttl === -1) {
            // Asignar TTL si no lo tenía
            fetch(`${upstashUrl}/EXPIRE/${redisKey}/${windowSec}`, {
                headers: { Authorization: `Bearer ${upstashToken}` },
            }).catch(() => {})
            ttl = windowSec
        }

        const allowed = count <= config.limit
        const remaining = Math.max(0, config.limit - count)
        const retryAfterSeconds = Math.max(1, ttl)
        const resetAt = now() + retryAfterSeconds * 1000

        return {
            allowed,
            remaining,
            retryAfterSeconds,
            resetAt,
            limit: config.limit,
        }
    } catch (err) {
        // Fallback inmediato y silencioso al motor local en memoria
        return checkRateLimit(key, config)
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
