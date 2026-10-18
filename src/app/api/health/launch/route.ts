import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptClinicalNote, decryptClinicalNote } from '@/lib/encryption'

export const dynamic = 'force-dynamic'

function hasEnv(name: string): boolean {
  const value = process.env[name]
  return Boolean(value && value.trim().length > 0)
}

async function sendAlert(message: string, details: Record<string, unknown>) {
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'P1',
        title: 'Health Check Degraded - PsyAI',
        message,
        details,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error('Failed to dispatch alert webhook:', err)
  }
}

export async function GET() {
  const checks = {
    database: false,
    encryption: false,
    authConfig: hasEnv('NEXTAUTH_SECRET') && hasEnv('NEXTAUTH_URL'),
    emailConfig: hasEnv('RESEND_API_KEY') || process.env.NODE_ENV !== 'production',
    alertingConfig: hasEnv('OPS_ALERT_WEBHOOK_URL'),
  }

  // 1. Verify Database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {
    checks.database = false
  }

  // 2. Verify Encryption (round-trip test)
  try {
    const testPlaintext = 'health-check-entropy-test-' + Date.now()
    const encrypted = encryptClinicalNote(testPlaintext)
    const decrypted = decryptClinicalNote(encrypted)
    checks.encryption = decrypted.content === testPlaintext
  } catch {
    checks.encryption = false
  }

  const ok = checks.database && checks.encryption && checks.authConfig && checks.emailConfig

  if (!ok && process.env.NODE_ENV === 'production') {
    await sendAlert('Health check degraded on PsyAI production', checks)
  }

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      environment: process.env.NODE_ENV || 'unknown',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  )
}
