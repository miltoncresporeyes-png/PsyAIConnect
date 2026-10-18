import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { getWaitlistBlockedResponse } from '@/lib/waitlistGuard'
import {
  ASSISTANT_CONFIG,
  buildSystemPrompt,
  containsCrisisKeywords,
  isPotentialPromptInjection,
  INJECTION_WARNING_MESSAGE,
  CRISIS_MESSAGE,
  HUMAN_HANDOVER,
  FALLBACK_MESSAGE,
} from '@/lib/assistant/config'

/**
 * Almacenamiento en memoria de las sesiones de chat
 * En producción usar Redis o una base de datos
 */
const conversationStore = new Map<
  string,
  Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>
>()

function cleanupExpiredSessions() {
  const now = Date.now()
  const expirationMs = ASSISTANT_CONFIG.sessionExpirationMinutes * 60 * 1000
  conversationStore.forEach((messages, sessionId) => {
    const oldest = messages[0]?.timestamp ?? 0
    if (now - oldest > expirationMs) {
      conversationStore.delete(sessionId)
    }
  })
}

setInterval(cleanupExpiredSessions, 5 * 60 * 1000)

export async function POST(req: NextRequest) {
  const blocked = getWaitlistBlockedResponse()
  if (blocked) return blocked

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const clientIp = getClientIp(req)
    const rateLimitResult = checkRateLimit(`assistant:${clientIp}`, {
      limit: 30,
      windowMs: 60 * 1000,
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Espera un momento.' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await req.json()
    const { message, sessionId: existingSessionId } = body as {
      message: string
      sessionId?: string
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API de OpenAI no configurada. Agrega OPENAI_API_KEY a tu archivo .env.local',
          code: 'MISSING_API_KEY',
        },
        { status: 503 },
      )
    }

    // Feature flag: ENABLE_PSYAI
    if (process.env.ENABLE_PSYAI === 'false') {
      return NextResponse.json(
        {
          reply: 'El orientador virtual PsyAI se encuentra temporalmente en mantenimiento programado. Puedes agendar directamente con nuestros profesionales o escribir a contacto@psydoctor.cl.',
          sessionId: existingSessionId || 'disabled',
          isCrisis: false,
        },
        { status: 200 }
      )
    }

    const sessionId = existingSessionId ?? uuidv4()

    let history = conversationStore.get(sessionId) ?? []

    const isCrisis = containsCrisisKeywords(message)
    const isInjection = isPotentialPromptInjection(message)
    let assistantMessage: string

    if (isCrisis) {
      // Disallow further interaction in normal flow, immediately return emergency lines
      assistantMessage = CRISIS_MESSAGE
    } else if (isInjection) {
      assistantMessage = INJECTION_WARNING_MESSAGE
    } else if (
      message.toLowerCase().includes('hablar con') ||
      message.toLowerCase().includes('ejecutivo') ||
      message.toLowerCase().includes('humano') ||
      message.toLowerCase().includes('persona real')
    ) {
      assistantMessage = HUMAN_HANDOVER
    } else {
      const openai = new OpenAI({ apiKey })

      const systemPrompt = buildSystemPrompt()

      const messagesOpenAI: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-ASSISTANT_CONFIG.maxHistoryMessages).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: message },
      ]

      const completion = await openai.chat.completions.create({
        model: ASSISTANT_CONFIG.model,
        messages: messagesOpenAI,
        max_tokens: ASSISTANT_CONFIG.maxTokens,
        temperature: ASSISTANT_CONFIG.temperature,
      })

      assistantMessage =
        completion.choices[0]?.message?.content ?? FALLBACK_MESSAGE
    }

    history.push({ role: 'user', content: message, timestamp: Date.now() })
    history.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: Date.now(),
    })

    if (history.length > ASSISTANT_CONFIG.maxHistoryMessages * 2) {
      history = history.slice(-ASSISTANT_CONFIG.maxHistoryMessages * 2)
    }

    conversationStore.set(sessionId, history)

    return NextResponse.json({
      reply: assistantMessage,
      sessionId,
      isCrisis,
    })
  } catch (error) {
    console.error('[PsyAI Assistant]', error)

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('auth')) {
        return NextResponse.json(
          { error: 'Credenciales de OpenAI inválidas. Revisa tu OPENAI_API_KEY.', code: 'AUTH_ERROR' },
          { status: 401 },
        )
      }
      if (error.message.includes('rate')) {
        return NextResponse.json(
          { error: 'Límite de uso alcanzado. Espera un momento e intenta de nuevo.', code: 'RATE_LIMIT' },
          { status: 429 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del asistente. Intenta de nuevo.' },
      { status: 500 },
    )
  }
}
