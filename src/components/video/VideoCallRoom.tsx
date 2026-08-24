'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { Loader2, Mic, MicOff, Video, VideoOff, Phone, Monitor, MessageSquare } from 'lucide-react'

interface VideoCallRoomProps {
  roomUrl: string
  token?: string
  userName: string
  onLeave?: () => void
}

export default function VideoCallRoom({ 
  roomUrl, 
  token, 
  userName, 
  onLeave 
}: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callFrameRef = useRef<ReturnType<typeof DailyIframe.createFrame> | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const leaveCall = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.leave()
      callFrameRef.current.destroy()
      callFrameRef.current = null
    }
    onLeave?.()
  }, [onLeave])

  useEffect(() => {
    if (!containerRef.current || !roomUrl) return

    const initCall = async () => {
      try {
        const callFrame = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        })

        callFrameRef.current = callFrame

        callFrame.on('joined-meeting', () => {
          setIsLoading(false)
        })

        callFrame.on('left-meeting', () => {
          leaveCall()
        })

        callFrame.on('error', (event) => {
          console.error('Daily.co error:', event)
          setError('Error al conectar con la sala de videollamada')
          setIsLoading(false)
        })

        await callFrame.join({
          url: roomUrl,
          token: token,
          userName: userName,
        })
      } catch (err) {
        console.error('Error joining call:', err)
        setError(err instanceof Error ? err.message : 'Error al unirse a la llamada')
        setIsLoading(false)
      }
    }

    initCall()

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave()
        callFrameRef.current.destroy()
      }
    }
  }, [roomUrl, token, userName, leaveCall])

  const toggleMute = () => {
    if (callFrameRef.current) {
      const currentState = callFrameRef.current.localAudio()
      callFrameRef.current.setLocalAudio(!currentState)
      setIsMuted(!currentState)
    }
  }

  const toggleVideo = () => {
    if (callFrameRef.current) {
      const currentState = callFrameRef.current.localVideo()
      callFrameRef.current.setLocalVideo(!currentState)
      setIsVideoOff(!currentState)
    }
  }

  const toggleScreenShare = async () => {
    if (callFrameRef.current) {
      try {
        await callFrameRef.current.startScreenShare()
      } catch {
        console.log('Screen share cancelled or not supported')
      }
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-xl p-6 text-white">
        <div className="text-red-400 mb-4">
          <Phone className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error de conexión</h3>
        <p className="text-gray-400 text-center mb-4">{error}</p>
        <button
          onClick={onLeave}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="flex flex-col items-center text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p>Conectando a la sala...</p>
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex-1 min-h-[400px]" />

      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title={isMuted ? 'Activar micrófono' : 'Silenciar'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoOff 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title={isVideoOff ? 'Activar cámara' : 'Apagar cámara'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          title="Compartir pantalla"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={leaveCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Finalizar llamada"
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </button>
      </div>
    </div>
  )
}
