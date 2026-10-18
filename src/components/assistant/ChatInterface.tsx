'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  MessageCircle,
  Send,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { useAssistant, ChatMessage } from '@/lib/hooks/useAssistant'
import { WELCOME_MESSAGES } from '@/lib/assistant/config'

interface ChatInterfaceProps {
  variant?: 'button' | 'embedded'
  className?: string
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isCrisis = message.isCrisis

  return (
    <div
      className={`flex gap-2 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
          isUser
            ? 'bg-teal-600 text-white'
            : isCrisis
              ? 'bg-red-100 text-red-600 border border-red-200'
              : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
        }`}
      >
        {isUser ? 'Tú' : isCrisis ? '!' : 'AI'}
      </div>
      <div
        className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-teal-600 text-white rounded-tr-none'
            : isCrisis
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
        }`}
      >
        {message.content.split('\n').map((line, i) => {
          if (line.startsWith('📞') || line.startsWith('🚨') || line.startsWith('💬') || line.startsWith('📱') || line.startsWith('🌐') || line.startsWith('✅') || line.startsWith('📧')) {
            return (
              <p key={i} className="mb-1">
                {line.startsWith('📞') && <span className="mr-1">📞</span>}
                {line.startsWith('🚨') && <span className="mr-1">🚨</span>}
                {line.startsWith('💬') && <span className="mr-1">💬</span>}
                {line.startsWith('📱') && <span className="mr-1">📱</span>}
                {line.startsWith('🌐') && <span className="mr-1">🌐</span>}
                {line.startsWith('✅') && <span className="mr-1">✅</span>}
                {line.startsWith('📧') && <span className="mr-1">📧</span>}
                {line.replace(/^[^\s]+\s/, '')}
              </p>
            )
          }
          if (line.startsWith('- ')) {
            return (
              <p key={i} className="mb-1 pl-2">
                • {line.slice(2)}
              </p>
            )
          }
          if (line.match(/^\d+\./)) {
            return (
              <p key={i} className="mb-1 font-medium">
                {line}
              </p>
            )
          }
          if (line.trim() === '') return <br key={i} />
          return (
            <p key={i} className="mb-1 last:mb-0">
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}

function QuickReplyButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-white border border-teal-200 text-teal-700 rounded-full text-xs font-medium hover:bg-teal-50 active:scale-[0.97] transition-all whitespace-nowrap"
    >
      {label}
    </button>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 max-w-[85%] self-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
        AI
      </div>
      <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function WelcomeScreen({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex gap-2 max-w-[85%] self-start">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
          AI
        </div>
        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800">
          {WELCOME_MESSAGES.greeting}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        {WELCOME_MESSAGES.quickReplies.map((qr) => (
          <QuickReplyButton
            key={qr.value}
            label={qr.label}
            onClick={() => onSendMessage(qr.value)}
          />
        ))}
      </div>
    </div>
  )
}

export function ChatInterface({ variant = 'button', className = '' }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    messagesEndRef,
  } = useAssistant()

  const hasMessages = messages.length > 0

  const handleSend = useCallback(
    (text?: string) => {
      const toSend = (text ?? inputValue).trim()
      if (!toSend) return
      setInputValue('')
      sendMessage(toSend)
      inputRef.current?.focus()
    },
    [inputValue, sendMessage],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    clearMessages()
    setInputValue('')
  }

  const openChat = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  if (variant === 'embedded') {
    return (
      <div className={`flex flex-col bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden ${className}`}>
        <ChatWindow
          isOpen={true}
          onClose={() => {}}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          hasMessages={hasMessages}
          isLoading={isLoading}
          error={error}
          messages={messages}
          onReset={handleReset}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
        />
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end ${className}`}>
      {isOpen && (
        <div className="mb-4 w-[380px] max-w-[calc(100vw-2rem)]">
          <ChatWindow
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            hasMessages={hasMessages}
            isLoading={isLoading}
            error={error}
            messages={messages}
            onReset={handleReset}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
          />
        </div>
      )}

      <button
        onClick={isOpen ? () => setIsOpen(false) : openChat}
        className="group p-4 bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 flex items-center justify-center relative"
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente PsyAI'}
      >
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 border-2 border-white" />
          </span>
        )}
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </button>
    </div>
  )
}

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  inputValue: string
  setInputValue: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: (text?: string) => void
  hasMessages: boolean
  isLoading: boolean
  error: string | null
  messages: ChatMessage[]
  onReset: () => void
  messagesEndRef: React.RefObject<HTMLDivElement>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

function ChatWindow({
  isOpen,
  onClose,
  inputValue,
  setInputValue,
  onKeyDown,
  onSend,
  hasMessages,
  isLoading,
  error,
  messages,
  onReset,
  messagesEndRef,
  inputRef,
}: ChatWindowProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transform transition-all duration-300 origin-bottom-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-sm">
              AI
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm leading-none">PsyAI</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-teal-200" />
              <span className="text-xs text-teal-100">Asistente de PsyDoctor · 24/7</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              onClick={onReset}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              title="Nueva conversación"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
            aria-label="Cerrar chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Crisis alert banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span className="text-xs text-amber-800">
          En emergencias, llama a{' '}
          <strong className="font-semibold">600 360 7777</strong> (Salud Responde, 24/7)
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 min-h-[300px] max-h-[420px] flex flex-col gap-3">
        {!hasMessages && !isLoading && <WelcomeScreen onSendMessage={onSend} />}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="flex gap-2 max-w-[85%] self-start">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-2xl rounded-tl-none">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end flex-shrink-0">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe tu mensaje..."
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all max-h-32 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
        </div>
        <button
          onClick={() => onSend()}
          disabled={!inputValue.trim() || isLoading}
          className="flex-shrink-0 p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors active:scale-95"
          aria-label="Enviar mensaje"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
