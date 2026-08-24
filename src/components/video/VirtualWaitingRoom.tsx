'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Camera, CameraOff, Mic, MicOff, CheckCircle, Clock, 
  Video, ChevronRight, RefreshCw, Volume2, VolumeX, Loader2, Wifi
} from 'lucide-react'
import { useAppointmentRealtime } from '@/lib/hooks/useAppointmentRealtime'

interface WaitingRoomProps {
  appointmentId: string
  professionalName: string
  sessionTime: Date
  userId: string
  isProfessional: boolean
  onReady: () => void
}

enum WaitingRoomStatus {
  CHECK_IN = 'CHECK_IN',
  WAITING = 'WAITING',
  READY = 'READY',
  CONNECTING = 'CONNECTING',
}

export default function VirtualWaitingRoom({ 
  appointmentId, 
  professionalName, 
  sessionTime,
  userId,
  isProfessional,
  onReady 
}: WaitingRoomProps) {
  const [status, setStatus] = useState<WaitingRoomStatus>(WaitingRoomStatus.CHECK_IN)
  const [devices, setDevices] = useState({
    camera: false,
    microphone: false,
    speaker: false,
  })
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const [breathingExercise, setBreathingExercise] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [countdown, setCountdown] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>(0)
  const [connectionIssue, setConnectionIssue] = useState<'none' | 'disconnected' | 'reconnecting'>('none')

  // Hook de tiempo real para detectar cuando el otro participante se une
  const { 
    status: realtimeStatus,
    isOtherPartyPresent,
    amIPresent,
    setMyPresence,
    isConnected,
    connectionQuality,
  } = useAppointmentRealtime({
    appointmentId,
    role: isProfessional ? 'professional' : 'patient',
    onSessionStart: () => {
      // Cuando la sesión comienza (ambos presentes)
      if (status === WaitingRoomStatus.WAITING || status === WaitingRoomStatus.READY) {
        setStatus(WaitingRoomStatus.CONNECTING)
        setConnectionIssue('none')
      }
    },
    onOtherPartyDisconnected: () => {
      // El profesional se desconectó
      setConnectionIssue('disconnected')
    },
    onOtherPartyReconnected: () => {
      // El profesional se reconectó
      setConnectionIssue('none')
    },
  })

  // Estado para la sala de Daily.co
  const [videoRoom, setVideoRoom] = useState<{ roomUrl: string; token: string } | null>(null)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  // Auto-detect when other party joins - crear sala de video
  useEffect(() => {
    if (isOtherPartyPresent && status === WaitingRoomStatus.WAITING) {
      setStatus(WaitingRoomStatus.READY)
    }

    // Si ambos están presentes y tenemos статус READY, crear la sala
    if (isOtherPartyPresent && amIPresent && status === WaitingRoomStatus.READY && !videoRoom && !isCreatingRoom) {
      const createRoom = async () => {
        setIsCreatingRoom(true)
        try {
          const response = await fetch('/api/video/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId }),
          })
          
          if (response.ok) {
            const data = await response.json()
            setVideoRoom(data)
            // Navegar a la videollamada después de un delay
            setTimeout(() => {
              onReady()
            }, 2000)
          }
        } catch (error) {
          console.error('Error creating video room:', error)
        } finally {
          setIsCreatingRoom(false)
        }
      }
      
      createRoom()
    }
  }, [isOtherPartyPresent, amIPresent, status, videoRoom, isCreatingRoom, appointmentId, onReady])

  // Handler para marcar que el usuario completó el test y está listo
  const handleTestComplete = useCallback(async () => {
    await setMyPresence(true)
  }, [setMyPresence])

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = sessionTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown('00:00')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [sessionTime])

  // Breathing exercise
  useEffect(() => {
    if (!breathingExercise) return

    const cycle = () => {
      setBreathPhase('inhale')
      setTimeout(() => {
        setBreathPhase('hold')
        setTimeout(() => {
          setBreathPhase('exhale')
        }, 4000)
      }, 4000)
    }

    cycle()
    const interval = setInterval(cycle, 12000)
    return () => clearInterval(interval)
  }, [breathingExercise])

  // Initialize media devices
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Audio level monitoring
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser

        const updateAudioLevel = () => {
          if (!analyserRef.current) return
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average / 255)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
        updateAudioLevel()

        setDevices(prev => ({
          ...prev,
          camera: true,
          microphone: true,
          speaker: true,
        }))
      } catch (error) {
        console.error('Media error:', error)
      }
    }

    if (status === WaitingRoomStatus.CHECK_IN) {
      initMedia()
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [status])

  const handleContinueToWaiting = async () => {
    if (devices.camera && devices.microphone) {
      setStatus(WaitingRoomStatus.WAITING)
      // Marcar que el usuario está listo (test de cámara completado)
      await setMyPresence(true)
    }
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isMicOn
        setIsMicOn(!isMicOn)
      }
    }
  }

  const testSpeaker = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0FNJPl')
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const renderCheckIn = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Verifiquemos tu equipo
        </h2>
        <p className="text-gray-500">
          Asegúrate de que cámara y micrófono funcionen correctamente
        </p>
      </div>

      {/* Video Preview with Audio Level */}
      <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {isVideoOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <CameraOff className="w-16 h-16 mx-auto mb-2" />
              <p>Cámara apagada</p>
            </div>
          </div>
        )}

        {/* Audio Level Indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                style={{ width: `${isMicOn ? audioLevel * 100 : 0}%` }}
              />
            </div>
            <Mic className={`w-4 h-4 ${isMicOn ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {devices.camera && (
            <span className="px-3 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3" /> Cámara OK
            </span>
          )}
          {devices.microphone && (
            <span className="px-3 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Mic className="w-3 h-3" /> Mic OK
            </span>
          )}
        </div>
      </div>

      {/* Device Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all duration-200 ${
            isVideoOn 
              ? 'bg-slate-100 hover:bg-slate-200 shadow-md' 
              : 'bg-red-100 text-red-600'
          }`}
        >
          {isVideoOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleMic}
          className={`p-4 rounded-2xl transition-all duration-200 ${
            isMicOn 
              ? 'bg-slate-100 hover:bg-slate-200 shadow-md' 
              : 'bg-red-100 text-red-600'
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => { setIsSpeakerOn(!isSpeakerOn); testSpeaker() }}
          className={`p-4 rounded-2xl transition-all duration-200 ${
            isSpeakerOn 
              ? 'bg-slate-100 hover:bg-slate-200 shadow-md' 
              : 'bg-slate-200'
          }`}
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        <button
          onClick={() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop())
            }
            setDevices({ camera: false, microphone: false, speaker: false })
            setTimeout(handleContinueToWaiting, 500)
          }}
          className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 shadow-md transition-all duration-200"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinueToWaiting}
        disabled={!devices.camera || !devices.microphone}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar a la sala de espera
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )

  const renderWaiting = () => (
    <div className="space-y-8">
      {/* Connection Status Alert */}
      {connectionIssue === 'disconnected' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Wifi className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              El profesional tuvo un problema de conexión
            </p>
            <p className="text-sm text-amber-700">
              Estamos intentando reestablecer la sala. Por favor espera...
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Clock className="w-12 h-12 text-sky-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {connectionIssue === 'disconnected' ? 'Reconectando...' : 'En sala de espera'}
        </h2>
        <p className="text-gray-500">
          {connectionIssue === 'disconnected' 
            ? 'El profesional se está reconectando'
            : `Estamos avisando a ${professionalName} que ya estás listo`}
        </p>
      </div>

      {/* Countdown */}
      <div className="py-8 bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl">
        <p className="text-sm text-slate-500 mb-2 text-center">Tu sesión comienza en</p>
        <p className="text-5xl font-bold text-center font-mono bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
          {countdown}
        </p>
      </div>

      {/* Breathing Exercise */}
      <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-2xl p-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-gray-800">Ejercicio de respiración</h3>
          <p className="text-sm text-gray-500">¿Quieres relajarte mientras esperas?</p>
        </div>

        {!breathingExercise ? (
          <button
            onClick={() => setBreathingExercise(true)}
            className="w-full py-3 bg-white hover:bg-sky-50 text-sky-600 font-medium rounded-xl shadow-sm border border-sky-100 transition-all duration-200"
          >
            Iniciar ejercicio de respiración
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div 
              className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-1000 shadow-lg ${
                breathPhase === 'inhale' ? 'bg-sky-400 scale-110' :
                breathPhase === 'hold' ? 'bg-emerald-400 scale-110' :
                'bg-sky-300 scale-100'
              }`}
            >
              <span className="text-white font-semibold text-lg">
                {breathPhase === 'inhale' ? 'Inhala' :
                 breathPhase === 'hold' ? 'Mantén' : 'Exhala'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              4 segundos cada paso
            </p>
            <button
              onClick={() => setBreathingExercise(false)}
              className="mt-4 text-sm text-sky-600 hover:text-sky-800"
            >
              Detener ejercicio
            </button>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-gray-500">
          Conectado • {isMicOn ? 'Mic activo' : 'Mic mute'}
        </span>
      </div>
    </div>
  )

  const renderReady = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡{professionalName} ha entrado!
        </h2>
        <p className="text-gray-500">
          {isCreatingRoom 
            ? 'Preparando la sala de videollamada...'
            : videoRoom 
              ? 'Conectando a la sesión...'
              : 'Listo para comenzar'}
        </p>
      </div>

      {/* Video Preview */}
      <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden">
        {isVideoOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <CameraOff className="w-12 h-12 mx-auto mb-2" />
              <p>Cámara apagada</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? 'bg-slate-100' : 'bg-red-100 text-red-600'}`}
        >
          {isVideoOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${isMicOn ? 'bg-slate-100' : 'bg-red-100 text-red-600'}`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Enter Button */}
      <button
        onClick={onReady}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
      >
        <Video className="w-5 h-5" />
        Entrar a la sesión
      </button>
    </div>
  )

  const renderConnecting = () => (
    <div className="space-y-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">
        Conectando...
      </h2>
      <p className="text-gray-500">
        Por favor espera mientras establecemos la conexión
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { key: WaitingRoomStatus.CHECK_IN, label: 'Verificar' },
            { key: WaitingRoomStatus.WAITING, label: 'Esperar' },
            { key: WaitingRoomStatus.READY, label: 'Entrar' },
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${status === step.key 
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg' 
                  : Object.values(WaitingRoomStatus).indexOf(status) > index 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 text-slate-500'}
              `}>
                {Object.values(WaitingRoomStatus).indexOf(status) > index ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                  Object.values(WaitingRoomStatus).indexOf(status) > index 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
          {status === WaitingRoomStatus.CHECK_IN && renderCheckIn()}
          {status === WaitingRoomStatus.WAITING && renderWaiting()}
          {status === WaitingRoomStatus.READY && renderReady()}
          {status === WaitingRoomStatus.CONNECTING && renderConnecting()}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-400 mt-8">
          ¿Problemas? Contacta a soporte al +56 2 2123 4567
        </p>
      </div>
    </div>
  )
}
