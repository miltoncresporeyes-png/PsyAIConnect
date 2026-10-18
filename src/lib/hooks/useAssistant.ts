'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isCrisis?: boolean
}

interface UseAssistantOptions {
  sessionId?: string
  onCrisisDetected?: (message: ChatMessage) => void
}

export function useAssistant(options: UseAssistantOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(
    options.sessionId ?? null,
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            sessionId,
          }),
          signal: abortControllerRef.current.signal,
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.code === 'MISSING_API_KEY') {
            throw new Error(
              'El asistente no está configurado. Agrega OPENAI_API_KEY a .env.local',
            )
          }
          throw new Error(data.error ?? 'Error desconocido')
        }

        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId)
          try {
            localStorage.setItem('psyai_session', data.sessionId)
          } catch {}
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          isCrisis: data.isCrisis,
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (data.isCrisis && options.onCrisisDetected) {
          options.onCrisisDetected(assistantMessage)
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        const message =
          err instanceof Error ? err.message : 'Error al enviar mensaje'
        setError(message)
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, sessionId, options],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    messagesEndRef,
    inputRef,
  }
}
