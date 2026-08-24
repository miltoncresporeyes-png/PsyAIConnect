import { useState, useEffect, useCallback } from 'react'
import { 
  subscribeToAppointment, 
  notifyUserJoined, 
  notifyUserLeft,
  startSession,
  endSession,
  getAppointmentRealtimeStatus,
  type RealtimeChannel
} from '@/lib/realtime'

interface UseRealtimeAppointmentOptions {
  appointmentId: string
  userId: string
  isProfessional: boolean
}

interface AppointmentRealtimeState {
  attendanceStatus: string
  pacienteOnline: boolean
  profesionalOnline: boolean
  patientJoinedAt: Date | null
  professionalJoinedAt: Date | null
  sessionStartedAt: Date | null
  loading: boolean
  error: string | null
}

export function useRealtimeAppointment({
  appointmentId,
  userId,
  isProfessional,
}: UseRealtimeAppointmentOptions) {
  const [state, setState] = useState<AppointmentRealtimeState>({
    attendanceStatus: 'EN_ESPERA',
    pacienteOnline: false,
    profesionalOnline: false,
    patientJoinedAt: null,
    professionalJoinedAt: null,
    sessionStartedAt: null,
    loading: true,
    error: null,
  })

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('📡 Realtime update:', payload)

    const newData = payload.new || payload
    setState(prev => ({
      ...prev,
      attendanceStatus: newData.attendanceStatus || prev.attendanceStatus,
      pacienteOnline: newData.pacienteOnline ?? prev.pacienteOnline,
      profesionalOnline: newData.profesionalOnline ?? prev.profesionalOnline,
      patientJoinedAt: newData.patientJoinedAt ? new Date(newData.patientJoinedAt) : prev.patientJoinedAt,
      professionalJoinedAt: newData.professionalJoinedAt ? new Date(newData.professionalJoinedAt) : prev.professionalJoinedAt,
      sessionStartedAt: newData.sessionStartedAt ? new Date(newData.sessionStartedAt) : prev.sessionStartedAt,
      loading: false,
    }))
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    async function init() {
      try {
        // Get initial state
        const status = await getAppointmentRealtimeStatus(appointmentId)
        
        if (status) {
          setState(prev => ({
            ...prev,
            attendanceStatus: status.attendanceStatus,
            pacienteOnline: status.pacienteOnline,
            profesionalOnline: status.profesionalOnline,
            patientJoinedAt: status.patientJoinedAt ? new Date(status.patientJoinedAt) : null,
            professionalJoinedAt: status.professionalJoinedAt ? new Date(status.professionalJoinedAt) : null,
            sessionStartedAt: status.sessionStartedAt ? new Date(status.sessionStartedAt) : null,
            loading: false,
          }))
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }

        // Subscribe to realtime changes
        const subscription = subscribeToAppointment(appointmentId, handleRealtimeUpdate)
        unsubscribe = subscription?.unsubscribe ?? null
      } catch (error) {
        console.error('Error initializing realtime:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }

    init()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [appointmentId, handleRealtimeUpdate])

  const joinRoom = useCallback(async () => {
    try {
      await notifyUserJoined(appointmentId, userId, isProfessional)
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }, [appointmentId, userId, isProfessional])

  const leaveRoom = useCallback(async () => {
    try {
      await notifyUserLeft(appointmentId, userId, isProfessional)
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }, [appointmentId, userId, isProfessional])

  const beginSession = useCallback(async () => {
    try {
      await startSession(appointmentId, userId)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }, [appointmentId, userId])

  const finishSession = useCallback(async () => {
    try {
      await endSession(appointmentId, userId)
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }, [appointmentId, userId])

  return {
    ...state,
    joinRoom,
    leaveRoom,
    beginSession,
    finishSession,
    isReady: state.attendanceStatus === 'EN_SESION' || 
             (state.pacienteOnline && state.profesionalOnline),
    isInSession: state.attendanceStatus === 'EN_SESION',
  }
}
