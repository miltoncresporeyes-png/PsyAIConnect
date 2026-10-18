import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/realtime'

type AppointmentRole = 'patient' | 'professional'

const HEARTBEAT_INTERVAL = 10000 // 10 segundos
const CONNECTION_TIMEOUT = 30000 // 30 segundos sin heartbeat = desconectado

interface UseAppointmentRealtimeOptions {
  appointmentId: string
  role: AppointmentRole
  onSessionStart?: () => void
  onOtherPartyDisconnected?: () => void
  onOtherPartyReconnected?: () => void
}

interface UseAppointmentRealtimeReturn {
  status: string
  isOtherPartyPresent: boolean
  amIPresent: boolean
  isOtherPartyConnected: boolean
  connectionQuality: 'good' | 'poor' | 'disconnected'
  setMyPresence: (isReady: boolean) => Promise<void>
  sendHeartbeat: () => Promise<void>
  error: string | null
  isConnected: boolean
}

export function useAppointmentRealtime({
  appointmentId,
  role,
  onSessionStart,
  onOtherPartyDisconnected,
  onOtherPartyReconnected,
}: UseAppointmentRealtimeOptions): UseAppointmentRealtimeReturn {
  const [status, setStatus] = useState<string>('waiting')
  const [isOtherPartyPresent, setIsOtherPartyPresent] = useState(false)
  const [amIPresent, setAmIPresent] = useState(false)
  const [isOtherPartyConnected, setIsOtherPartyConnected] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'disconnected'>('good')
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const lastHeartbeatRef = useRef<number>(Date.now())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null)
  const wasConnectedRef = useRef<boolean>(false)
  const isOtherPartyPresentRef = useRef(false)

  const setMyPresence = useCallback(async (isReady: boolean) => {
    if (!appointmentId || !supabase) return

    const column = role === 'patient' ? 'pacienteOnline' : 'profesionalOnline'

    const { error: updateError } = await supabase
      .from('Appointment')
      .update({ [column]: isReady })
      .eq('id', appointmentId)

    if (updateError) {
      setError(updateError.message)
      console.error('Error updating presence:', updateError)
    } else {
      setAmIPresent(isReady)
      if (isReady) {
        lastHeartbeatRef.current = Date.now()
      }
    }
  }, [appointmentId, role])

  const sendHeartbeat = useCallback(async () => {
    await setMyPresence(true)
    lastHeartbeatRef.current = Date.now()
  }, [setMyPresence])

  // Monitorear conexión de la otra parte
  const checkConnectionStatus = useCallback(() => {
    const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current
    
    if (timeSinceLastHeartbeat > CONNECTION_TIMEOUT) {
      if (isOtherPartyConnected) {
        setIsOtherPartyConnected(false)
        setConnectionQuality('disconnected')
        onOtherPartyDisconnected?.()
      }
    } else if (timeSinceLastHeartbeat > 15000) {
      setConnectionQuality('poor')
    } else {
      if (!isOtherPartyConnected && wasConnectedRef.current) {
        setIsOtherPartyConnected(true)
        setConnectionQuality('good')
        onOtherPartyReconnected?.()
      }
    }
  }, [isOtherPartyConnected, onOtherPartyDisconnected, onOtherPartyReconnected])

  useEffect(() => {
    if (!appointmentId || !supabase) return

    // Iniciar heartbeat
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat()
    }, HEARTBEAT_INTERVAL)

    // Verificar estado de conexión
    connectionCheckRef.current = setInterval(() => {
      checkConnectionStatus()
    }, 5000)

    const channel = supabase
      .channel(`appointment_${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Appointment',
          filter: `id=eq.${appointmentId}`,
        },
        (payload) => {
          const newData = payload.new as any
          
          // Actualizar estado de la sesión
          if (newData.attendanceStatus) {
            setStatus(newData.attendanceStatus)
            
            // Notificar si la sesión comenzó
            if (newData.attendanceStatus === 'EN_SESION' && onSessionStart) {
              onSessionStart()
            }
          }

          // Detectar presencia de la contraparte
          if (role === 'patient') {
            const wasPresent = isOtherPartyPresentRef.current
            const nowPresent = newData.profesionalOnline || false
            
            setIsOtherPartyPresent(nowPresent)
            isOtherPartyPresentRef.current = nowPresent
            setAmIPresent(newData.pacienteOnline || false)
            
            // Detectar reconexión/desconexión
            if (nowPresent && !wasPresent) {
              wasConnectedRef.current = true
              setIsOtherPartyConnected(true)
              setConnectionQuality('good')
              lastHeartbeatRef.current = Date.now()
              onOtherPartyReconnected?.()
            } else if (!nowPresent && wasPresent) {
              wasConnectedRef.current = false
              setIsOtherPartyConnected(false)
              setConnectionQuality('disconnected')
              onOtherPartyDisconnected?.()
            }
          } else {
            const wasPresent = isOtherPartyPresentRef.current
            const nowPresent = newData.pacienteOnline || false
            
            setIsOtherPartyPresent(nowPresent)
            isOtherPartyPresentRef.current = nowPresent
            setAmIPresent(newData.profesionalOnline || false)
            
            if (nowPresent && !wasPresent) {
              wasConnectedRef.current = true
              setIsOtherPartyConnected(true)
              setConnectionQuality('good')
              lastHeartbeatRef.current = Date.now()
              onOtherPartyReconnected?.()
            } else if (!nowPresent && wasPresent) {
              wasConnectedRef.current = false
              setIsOtherPartyConnected(false)
              setConnectionQuality('disconnected')
              onOtherPartyDisconnected?.()
            }
          }
        }
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === 'CHANNEL_ERROR') {
          setError('Error de conexión en tiempo real')
          setIsConnected(false)
        } else if (subscriptionStatus === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    // Cleanup
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current)
      }
      if (supabase) {
        supabase.removeChannel(channel)
      }
      setIsConnected(false)
    }
  }, [appointmentId, role, onSessionStart, sendHeartbeat, checkConnectionStatus, onOtherPartyDisconnected, onOtherPartyReconnected])

  return {
    status,
    isOtherPartyPresent,
    amIPresent,
    isOtherPartyConnected,
    connectionQuality,
    setMyPresence,
    sendHeartbeat,
    error,
    isConnected,
  }
}
