type Severity = 'INFO' | 'WARN' | 'ERROR'

interface EventPayload {
  severity: Severity
  event: string
  route?: string
  requestId?: string
  context?: Record<string, unknown>
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Unknown error'
}

export function getRequestId(request: Request): string {
  const fromHeader = request.headers.get('x-request-id')
  if (fromHeader && fromHeader.trim().length > 0) {
    return fromHeader.trim()
  }

  return crypto.randomUUID()
}

export function logEvent(payload: EventPayload) {
  const log = {
    ts: new Date().toISOString(),
    ...payload,
  }

  if (payload.severity === 'ERROR') {
    console.error(JSON.stringify(log))
    return
  }

  if (payload.severity === 'WARN') {
    console.warn(JSON.stringify(log))
    return
  }

  console.info(JSON.stringify(log))
}

async function notifyOps(payload: EventPayload) {
  const webhook = process.env.OPS_ALERT_WEBHOOK_URL
  if (!webhook) {
    return
  }

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${payload.severity}] ${payload.event}`,
        payload,
      }),
    })
  } catch {
    // no-op: observability must not break business flow
  }
}

export async function captureApiError(
  route: string,
  error: unknown,
  requestId: string,
  context?: Record<string, unknown>
) {
  const event: EventPayload = {
    severity: 'ERROR',
    event: 'api_error',
    route,
    requestId,
    context: {
      ...context,
      error: toErrorMessage(error),
    },
  }

  logEvent(event)

  if (process.env.NODE_ENV === 'production') {
    await notifyOps(event)
  }
}
