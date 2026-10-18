import { z } from 'zod'

/**
 * Esquema de validación estricto de variables de entorno para Railway / Producción
 */
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Requeridas siempre
    DATABASE_URL: z.string({ required_error: 'DATABASE_URL es requerida' }).min(1),
    DIRECT_URL: z.string({ required_error: 'DIRECT_URL es requerida' }).min(1),
    NEXTAUTH_SECRET: z
        .string({ required_error: 'NEXTAUTH_SECRET es requerida' })
        .min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres'),
    NEXTAUTH_URL: z
        .string({ required_error: 'NEXTAUTH_URL es requerida' })
        .url('NEXTAUTH_URL debe ser una URL válida')
        .refine(
            (val) => process.env.NODE_ENV !== 'production' || val.startsWith('https://'),
            'NEXTAUTH_URL debe usar HTTPS en producción'
        ),
    NEXT_PUBLIC_APP_URL: z
        .string({ required_error: 'NEXT_PUBLIC_APP_URL es requerida' })
        .url('NEXT_PUBLIC_APP_URL debe ser una URL válida')
        .refine(
            (val) => process.env.NODE_ENV !== 'production' || val.startsWith('https://'),
            'NEXT_PUBLIC_APP_URL debe usar HTTPS en producción'
        ),
    ENCRYPTION_KEY: z
        .string({ required_error: 'ENCRYPTION_KEY es requerida' })
        .length(64, 'ENCRYPTION_KEY debe tener exactamente 64 caracteres hexadecimales (32 bytes)')
        .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY debe contener solo caracteres hexadecimales válidos'),
    CLINICAL_HASH_SECRET: z
        .string({ required_error: 'CLINICAL_HASH_SECRET es requerida' })
        .min(32, 'CLINICAL_HASH_SECRET debe tener al menos 32 caracteres'),
    RESEND_API_KEY: z.string({ required_error: 'RESEND_API_KEY es requerida' }).min(1),
    EMAIL_FROM: z.string({ required_error: 'EMAIL_FROM es requerida' }).min(1),

    // Flags de lista de espera
    WAITLIST_MODE: z.string().optional(),
    NEXT_PUBLIC_WAITLIST_MODE: z.string().optional(),

    // Requeridas solo si NO está en modo lista de espera
    FLOW_API_KEY: z.string().optional(),
    FLOW_SECRET_KEY: z.string().optional(),
    DAILY_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    SII_WEBHOOK_SECRET: z.string().optional(),
    SII_WEBHOOK_URL: z.string().optional(),

    // Opcionales
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    OPS_ALERT_WEBHOOK_URL: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

    // Seed de desarrollo (peligrosa si se deja en prod)
    SEED_API_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Valida las variables de entorno en el arranque del servidor (runtime).
 * Si hay variables ausentes o inválidas en producción, arroja un error listando
 * EXCLUSIVAMENTE los nombres de las variables sin imprimir valores.
 */
export function validateEnv(): Env {
    const isProduction = process.env.NODE_ENV === 'production'
    const isWaitlist = process.env.WAITLIST_MODE === 'true'

    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
        const missingOrInvalid = parsed.error.issues.map((issue) => {
            const field = issue.path.join('.')
            return `${field}: ${issue.message}`
        })

        if (isProduction) {
            console.error('❌ [FATAL] Error en validación de variables de entorno (Producción):')
            missingOrInvalid.forEach((err) => console.error(`  - ${err}`))
            throw new Error(
                `Configuración de entorno inválida en producción. Variables con problemas: ${parsed.error.issues
                    .map((i) => i.path.join('.'))
                    .join(', ')}`
            )
        } else {
            console.warn('⚠️ [WARN] Variables de entorno incompletas o inválidas (Modo no-producción):')
            missingOrInvalid.forEach((err) => console.warn(`  - ${err}`))
            return process.env as unknown as Env
        }
    }

    const env = parsed.data

    // 1. Verificación condicional: Si no es modo lista de espera, validar variables operativas completas
    if (!isWaitlist && isProduction) {
        const requiredForMarketplace = [
            'FLOW_API_KEY',
            'FLOW_SECRET_KEY',
            'DAILY_API_KEY',
            'OPENAI_API_KEY',
            'SII_WEBHOOK_SECRET',
            'SII_WEBHOOK_URL',
        ] as const

        const missingMarketplace = requiredForMarketplace.filter((key) => !process.env[key]?.trim())
        if (missingMarketplace.length > 0) {
            console.error(
                `❌ [FATAL] WAITLIST_MODE no es "true", por lo que se requieren para producción: ${missingMarketplace.join(', ')}`
            )
            throw new Error(`Variables requeridas faltantes: ${missingMarketplace.join(', ')}`)
        }
    }

    // 2. Advertencia si SEED_API_KEY está presente en producción
    if (isProduction && env.SEED_API_KEY) {
        console.warn('⚠️ [ALERTA DE SEGURIDAD] SEED_API_KEY está configurada en producción. Recomendado eliminarla del entorno.')
    }

    // 3. Advertencia si WAITLIST_MODE y NEXT_PUBLIC_WAITLIST_MODE difieren
    if (env.WAITLIST_MODE !== env.NEXT_PUBLIC_WAITLIST_MODE) {
        console.warn(
            `⚠️ [ALERTA DE CONFIGURACIÓN] WAITLIST_MODE ("${env.WAITLIST_MODE}") y NEXT_PUBLIC_WAITLIST_MODE ("${env.NEXT_PUBLIC_WAITLIST_MODE}") no coinciden. La UI de cliente y los redirects de servidor podrían desalinearse.`
        )
    }

    // 4. Advertencias de opcionales no configuradas en producción
    if (isProduction) {
        const optionalWarnings: [string, boolean][] = [
            ['GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET', Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)],
            ['OPS_ALERT_WEBHOOK_URL', Boolean(env.OPS_ALERT_WEBHOOK_URL)],
            ['NEXT_PUBLIC_SENTRY_DSN', Boolean(env.NEXT_PUBLIC_SENTRY_DSN)],
            ['NEXT_PUBLIC_SUPABASE_URL', Boolean(env.NEXT_PUBLIC_SUPABASE_URL)],
        ]

        optionalWarnings.forEach(([name, present]) => {
            if (!present) {
                console.info(`ℹ️ [INFO] Variable opcional no configurada: ${name}`)
            }
        })
    }

    return env
}
