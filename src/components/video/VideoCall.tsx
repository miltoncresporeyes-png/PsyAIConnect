'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { 
  Mic, MicOff, Video, VideoOff, Phone, Monitor, 
  MessageSquare, Settings, Maximize2, Minimize2, Loader2
} from 'lucide-react'

interface VideoCallProps {
  roomUrl: string
  token?: string
  userName: string
  userRole: 'patient' | 'professional'
  appointmentId: string
  onLeave?: () => void
  onSessionEnd?: (duration: number) => void
}

export default function VideoCall({
  roomUrl,
  token,
  userName,
  userRole,
  appointmentId,
  onLeave,
  onSessionEnd,
}: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callFrameRef = useRef<ReturnType<typeof DailyIframe.createFrame> | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [participants, setParticipants] = useState<number>(0)
  const [sessionStartTime] = useState<number>(Date.now())

  const leaveCall = useCallback(async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave()
      callFrameRef.current.destroy()
      callFrameRef.current = null
    }
    
    // Calculate session duration
    const duration = Math.round((Date.now() - sessionStartTime) / 1000 / 60) // minutes
    
    onSessionEnd?.(duration)
    onLeave?.()
  }, [onLeave, onSessionEnd, sessionStartTime])

  useEffect(() => {
    if (!containerRef.current || !roomUrl) return

    const initCall = async () => {
      try {
        const callFrame = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '0',
          },
          showLeaveButton: false,
          showFullscreenButton: false,
        })

        callFrameRef.current = callFrame

        // Event listeners
        callFrame.on('joined-meeting', () => {
          setIsLoading(false)
          updateParticipants()
        })

        callFrame.on('left-meeting', () => {
          leaveCall()
        })

        callFrame.on('participant-joined', () => {
          updateParticipants()
        })

        callFrame.on('participant-left', () => {
          updateParticipants()
        })

        callFrame.on('error', (event: any) => {
          console.error('Daily.co error:', event)
          setError('Error de conexión. Por favor, intenta de nuevo.')
          setIsLoading(false)
        })

        // Join the call
        await callFrame.join({
          url: roomUrl,
          token: token,
          userName: userName,
        })

        // Get initial participant count
        const updateParticipants = () => {
          const participants = callFrame.participants()
          setParticipants(Object.keys(participants).length)
        }
      } catch (err) {
        console.error('Error joining call:', err)
        setError(err instanceof Error ? err.message : 'Error al conectar')
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
  }, [roomUrl, token, userName])

  const updateParticipants = () => {
    if (callFrameRef.current) {
      const participants = callFrameRef.current.participants()
      setParticipants(Object.keys(participants).length)
    }
  }

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
    if (!callFrameRef.current) return

    try {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare()
        setIsScreenSharing(false)
      } else {
        await callFrameRef.current.startScreenShare()
        setIsScreenSharing(true)
      }
    } catch (err) {
      console.error('Screen share error:', err)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
        <div className="text-red-400 mb-4">
          <Video className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error de conexión</h3>
        <p className="text-gray-400 text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={onLeave}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium"
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main Video Area */}
      <div ref={containerRef} className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="flex flex-col items-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Conectando a la sesión...</p>
            </div>
          </div>
        )}

        {/* Participant Count Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {participants} {participants === 1 ? 'participante' : 'participantes'}
          </div>
        </div>

        {/* Session Duration */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm">
            <span className="font-mono">
              {Math.floor((Date.now() - sessionStartTime) / 60000)}:
              {String(Math.floor(((Date.now() - sessionStartTime) % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isMuted ? 'Activar micrófono' : 'Silenciar'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Video */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoOff 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isVideoOff ? 'Activar cámara' : 'Apagar cámara'}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
            >
              <Monitor className="w-6 h-6" />
            </button>
          </div>

          {/* Center - Leave Button */}
          <button
            onClick={leaveCall}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold flex items-center gap-2 transition-colors"
          >
            <Phone className="w-5 h-5 rotate-[135deg]" />
            Finalizar llamada
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Chat (placeholder) */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-4 rounded-full transition-colors ${
                showChat 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Chat"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-20 w-80 bg-gray-800 border-l border-gray-700 p-4 z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Chat</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
              ×
            </button>
          </div>
          <div className="text-gray-400 text-sm text-center py-8">
            El chat está disponible pronto
          </div>
        </div>
      )}
    </div>
  )
}
