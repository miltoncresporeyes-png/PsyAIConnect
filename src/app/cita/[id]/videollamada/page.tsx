'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import VirtualWaitingRoom from '@/components/video/VirtualWaitingRoom'
import VideoCall from '@/components/video/VideoCall'
import ClinicalNoteEditor from '@/components/notes/ClinicalNoteEditor'
import SessionCompleteModal from '@/components/session/SessionCompleteModal'
import { Loader2, Calendar, User, AlertCircle, ArrowLeft, Play, PhoneOff } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

function VideoSessionContent({ id }: { id: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<{ roomUrl: string; token: string } | null>(null)
  const [inWaitingRoom, setInWaitingRoom] = useState(true)
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)

  const isProfessional = appointment?.professional?.userId === session?.user?.id
  const hasVideoLink = appointment?.videoLink && sessionStarted

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function loadAppointment() {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/citas?id=${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar la cita')
        }

        const apt = Array.isArray(data) ? data[0] : data
        
        if (!apt) {
          throw new Error('Cita no encontrada')
        }

        if (apt.patientId !== session.user.id && apt.professional?.userId !== session.user.id) {
          throw new Error('No tienes acceso a esta cita')
        }

        setAppointment(apt)

        // Si la sesión ya está en progreso, obtener datos de video
        if (apt.videoLink && apt.attendanceStatus === 'EN_SESION') {
          const videoResponse = await fetch('/api/video/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId: id }),
          })

          if (videoResponse.ok) {
            const videoInfo = await videoResponse.json()
            setVideoData(videoInfo)
            setSessionStarted(true)
            setInWaitingRoom(false)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      loadAppointment()
    }
  }, [session, id])

  // Polling para detectar cuando el profesional inicia la sesión
  useEffect(() => {
    if (!appointment || !sessionStarted) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/citas?id=${id}`)
        const data = await response.json()
        
        if (response.ok && Array.isArray(data) && data[0]) {
          const apt = data[0]
          
          if (apt.videoLink && apt.attendanceStatus === 'EN_SESION' && !videoData) {
            const videoResponse = await fetch('/api/video/room', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ appointmentId: id }),
            })

            if (videoResponse.ok) {
              const videoInfo = await videoResponse.json()
              setVideoData(videoInfo)
            }
          }
        }
      } catch (err) {
        console.error('Error polling:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [appointment, sessionStarted, videoData, id])

  const handleStartSession = async () => {
    setIsStartingSession(true)
    
    try {
      // Llamar al endpoint para iniciar sesión
      const response = await fetch(`/api/appointment/${id}/start-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      const data = await response.json()
      setVideoData({ roomUrl: data.roomUrl, token: data.token })
      setSessionStarted(true)
      setIsTransitioning(true)
      
      // Transición suave
      setTimeout(() => {
        setInWaitingRoom(false)
        setIsTransitioning(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsStartingSession(false)
    }
  }

  const handleWaitingRoomReady = async () => {
    setInWaitingRoom(false)
    setSessionStarted(true)
    setIsTransitioning(true)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500)
  }

  const handleSessionEnd = async () => {
    try {
      await fetch('/api/appointment/waiting-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: id,
          action: 'end_session',
        }),
      })
    } catch (err) {
      console.error('Error ending session:', err)
    }
    
    router.push('/dashboard/citas')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full btn-primary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (!appointment) return null

  const isOnline = appointment.modality === 'ONLINE'
  const isConfirmed = appointment.status === 'CONFIRMED'
  const isPast = new Date(appointment.scheduledAt) < new Date()

  if (!isOnline || !isConfirmed || isPast) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cita no disponible
          </h2>
          <p className="text-gray-500 mb-6">
            {isPast 
              ? 'Esta cita ya pasó' 
              : 'La cita debe ser online y confirmada para acceder a la videollamada'}
          </p>
          <button
            onClick={() => router.push('/dashboard/citas')}
            className="btn-primary"
          >
            Volver a mis citas
          </button>
        </div>
      </div>
    )
  }

  // Si ya está en sesión, mostrar VideoCall o Modo Consulta (pantalla dividida)
  if (!inWaitingRoom && (videoData || hasVideoLink)) {
    const finalVideoData = videoData || { roomUrl: appointment.videoLink, token: '' }
    
    // Modo Consulta: Pantalla dividida para profesionales (60% video, 40% notas)
    if (isProfessional) {
      return (
        <div className={`h-screen flex flex-col transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* Header with Finish Session Button */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSessionEnd}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <div className="h-4 w-px bg-gray-600"></div>
              <span className="text-white font-medium text-sm">
                Sesión con {appointment.patient?.name || 'Paciente'}
              </span>
            </div>
            <button
              onClick={() => setShowFinishModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              Finalizar Sesión
            </button>
          </div>
          
          <div className="flex-1 flex">
            <div className="w-3/5 h-full">
              <VideoCall
                roomUrl={finalVideoData.roomUrl}
                token={finalVideoData.token}
                userName={session?.user?.name || session?.user?.email || 'Usuario'}
                userRole="professional"
                appointmentId={id}
                onLeave={handleSessionEnd}
                onSessionEnd={(duration) => {
                  console.log(`Sesión duró ${duration} minutos`)
                }}
              />
            </div>
            <div className="w-2/5 h-full border-l border-gray-300">
              <ClinicalNoteEditor
                appointmentId={id}
                professionalId={appointment.professionalId}
                isProfessional={true}
                onFinalize={() => {
                  console.log('Nota finalizada')
                }}
              />
            </div>
          </div>

          <SessionCompleteModal
            appointmentId={id}
            isOpen={showFinishModal}
            onClose={() => setShowFinishModal(false)}
            onSuccess={() => router.push('/dashboard')}
          />
        </div>
      )
    }

    // Modo normal para pacientes
    return (
      <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <VideoCall
          roomUrl={finalVideoData.roomUrl}
          token={finalVideoData.token}
          userName={session?.user?.name || session?.user?.email || 'Usuario'}
          userRole="patient"
          appointmentId={id}
          onLeave={handleSessionEnd}
          onSessionEnd={(duration) => {
            console.log(`Sesión duró ${duration} minutos`)
          }}
        />
      </div>
    )
  }

  // Sala de espera
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 py-8 px-4 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push('/dashboard/citas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis citas
        </button>

        {/* Botón destacado para profesional */}
        {isProfessional && !sessionStarted && (
          <div className="mb-6">
            <button
              onClick={handleStartSession}
              disabled={isStartingSession}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
            >
              {isStartingSession ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Iniciar Sesión Médica
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Solo el profesional puede iniciar la sesión
            </p>
          </div>
        )}

        <VirtualWaitingRoom
          appointmentId={id}
          professionalName={appointment.professional?.user?.name || 'Profesional'}
          sessionTime={new Date(appointment.scheduledAt)}
          userId={session?.user?.id || ''}
          isProfessional={isProfessional}
          onReady={handleWaitingRoomReady}
        />
      </div>
    </div>
  )
}

export default function VideoSessionPage({ params }: PageProps) {
  const { id } = use(params)
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <VideoSessionContent id={id} />
    </Suspense>
  )
}
