import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function hasEnv(name: string): boolean {
  const value = process.env[name]
  return Boolean(value && value.trim().length > 0)
}

export async function GET() {
  const checks = {
    database: false,
    authConfig: hasEnv('NEXTAUTH_SECRET') && hasEnv('NEXTAUTH_URL'),
    emailConfig: hasEnv('RESEND_API_KEY') || process.env.NODE_ENV !== 'production',
    alertingConfig: hasEnv('OPS_ALERT_WEBHOOK_URL'),
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {
    checks.database = false
  }

  const ok = checks.database && checks.authConfig && checks.emailConfig

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
