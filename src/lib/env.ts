import { z } from 'zod'

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // NextAuth
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

    // Encryption (optional in development)
    ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be 64 hex characters').optional(),

    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

// Validate environment variables on server startup
export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`)
            console.error('❌ Invalid environment variables:\n' + missingVars.join('\n'))

            // In development, don't crash - just warn
            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️ Running with incomplete environment in development mode')
                return process.env as unknown as Env
            }

            throw new Error('Invalid environment variables')
        }
        throw error
    }
}

// Get validated env (cached)
let cachedEnv: Env | null = null

export function getEnv(): Env {
    if (!cachedEnv) {
        cachedEnv = validateEnv()
    }
    return cachedEnv
}
