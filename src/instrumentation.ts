/**
 * Next.js Instrumentation Hook
 * Se ejecuta al iniciar el runtime del servidor Node.js (y no durante next build)
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { validateEnv } = await import('@/lib/env')
        validateEnv()
    }
}
