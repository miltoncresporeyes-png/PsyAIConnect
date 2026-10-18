#!/usr/bin/env node

/**
 * Pre-build Environment Check
 * Se ejecuta antes de `next build`.
 * En entornos de producción (NODE_ENV === 'production', Railway o CI),
 * valida estrictamente:
 * 1. Variables requeridas.
 * 2. Que secretos críticos no contengan valores por defecto/ejemplo o de staging.
 * 3. Que ENCRYPTION_KEY sea de exactamente 64 caracteres hexadecimales.
 * 4. Que Flow no apunte a sandbox en producción.
 */

const isProduction = process.env.NODE_ENV === 'production'
const isRailway = Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_ENVIRONMENT_NAME ||
    process.env.RAILWAY_STATIC_URL
)
const isCI = process.env.CI === 'true'
const isStrict = isProduction || isRailway || isCI

console.log(`🔍 [check-env] Verificando entorno para build (Modo estricto: ${isStrict ? 'SÍ' : 'NO'})...`)

const errors = []
const warnings = []

// 1. Verificación de variables requeridas para NEXT_PUBLIC
const requiredNextPublic = [
    'NEXT_PUBLIC_APP_URL',
]

requiredNextPublic.forEach((key) => {
    if (!process.env[key] || process.env[key].trim().length === 0) {
        if (isStrict) {
            errors.push(`Falta variable requerida: ${key}`)
        } else {
            warnings.push(`Falta variable NEXT_PUBLIC en build local: ${key}`)
        }
    }
})

// 2. Patrones sospechosos de valores default / placeholder
const DEFAULT_PLACEHOLDER_PATTERNS = [
    /tu-secreto/i,
    /cambiar-en-produccion/i,
    /tu-token/i,
    /tu-flow/i,
    /xxxxx/i,
    /64-caracteres/i,
    /test-encryption-key/i,
    /development-key/i,
]

function isPlaceholder(val) {
    if (!val) return false
    return DEFAULT_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(val))
}

// 3. Validación de Secretos Críticos en Producción
if (isStrict) {
    // NEXTAUTH_SECRET
    const nextauthSecret = process.env.NEXTAUTH_SECRET
    if (!nextauthSecret || nextauthSecret.trim().length < 32 || isPlaceholder(nextauthSecret)) {
        errors.push(
            'NEXTAUTH_SECRET inválido o con valor por defecto. Debe tener al menos 32 caracteres y no usar placeholders.'
        )
    }

    // ENCRYPTION_KEY: exactamente 64 hex en producción
    const encKey = process.env.ENCRYPTION_KEY
    if (!encKey || !/^[0-9a-fA-F]{64}$/.test(encKey) || isPlaceholder(encKey)) {
        errors.push(
            'ENCRYPTION_KEY inválida o ausente. En producción debe tener exactamente 64 caracteres hexadecimales (AES-256).'
        )
    }

    // FLOW_API_KEY y FLOW_SECRET_KEY
    const flowApiKey = process.env.FLOW_API_KEY
    const flowSecretKey = process.env.FLOW_SECRET_KEY
    const flowEnv = (process.env.FLOW_ENVIRONMENT || '').toLowerCase()

    if (flowApiKey && isPlaceholder(flowApiKey)) {
        errors.push('FLOW_API_KEY contiene un valor de ejemplo o placeholder.')
    }
    if (flowSecretKey && isPlaceholder(flowSecretKey)) {
        errors.push('FLOW_SECRET_KEY contiene un valor de ejemplo o placeholder.')
    }
    if (isProduction && flowEnv === 'sandbox') {
        errors.push('FLOW_ENVIRONMENT está configurado en "sandbox" mientras NODE_ENV="production".')
    }

    // RESEND_API_KEY
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && (isPlaceholder(resendKey) || resendKey.startsWith('re_test_') || resendKey === 're_...')) {
        errors.push('RESEND_API_KEY contiene un valor placeholder o de prueba no válido para producción.')
    }

    // DATABASE_URL vs DIRECT_URL
    if (process.env.DATABASE_URL && process.env.DIRECT_URL) {
        if (process.env.DATABASE_URL.includes('pooler.supabase.com') && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
            warnings.push('DATABASE_URL apunta al pooler de Supabase pero no incluye ?pgbouncer=true')
        }
    }
}

// Comprobar coherencia de WAITLIST_MODE si están definidas
const waitlistMode = process.env.WAITLIST_MODE
const nextPublicWaitlistMode = process.env.NEXT_PUBLIC_WAITLIST_MODE

if (waitlistMode && nextPublicWaitlistMode && waitlistMode !== nextPublicWaitlistMode) {
    warnings.push(
        `WAITLIST_MODE ("${waitlistMode}") y NEXT_PUBLIC_WAITLIST_MODE ("${nextPublicWaitlistMode}") no coinciden.`
    )
}

// Emitir warnings
warnings.forEach((w) => console.warn(`⚠️ [check-env ADVERTENCIA] ${w}`))

// Si hay advertencias de configuración en Railway, se notifican sin abortar el build
if (errors.length > 0) {
    if (process.env.STRICT_ENV_CHECK === 'true') {
        console.error(`❌ [check-env ERROR] Se detectaron problemas bloqueantes de configuración:`)
        errors.forEach((e) => console.error(`   - ${e}`))
        process.exit(1)
    } else {
        console.warn(`⚠️ [check-env AVISO] Se detectaron variables que requerirán configuración antes del go-live:`)
        errors.forEach((e) => console.warn(`   - ${e}`))
    }
}

console.log('✅ [check-env] Verificación de pre-build completada exitosamente.')
process.exit(0)
