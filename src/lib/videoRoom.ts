import { z } from 'zod'

const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = 'https://api.daily.co/v1'

const ROOM_EXPIRY_MINUTES = 60 // Sala dura 1 hora máximo

const roomConfigSchema = z.object({
  name: z.string().optional(),
  privacy: z.enum(['public', 'private']).default('private'),
  properties: z.object({
    exp: z.number().optional(),
    nbf: z.number().optional(),
    max_participants: z.number().max(15).default(2),
    enable_screenshare: z.boolean().default(true),
    enable_chat: z.boolean().default(true),
    enable_knocking: z.boolean().default(false),
    start_video_off: z.boolean().default(false),
    start_audio_off: z.boolean().default(false),
    enable_recording: z.boolean().default(false),
    eject_at_room_exp: z.boolean().default(true),
    enable_prejoin_ui: z.boolean().default(true),
    enable_network_ui: z.boolean().default(true),
    lang: z.string().default('es'),
  }).optional(),
})

type RoomConfig = z.infer<typeof roomConfigSchema>

export interface VideoRoom {
  id: string
  name: string
  url: string
  privacy: string
  created_at: string
  config: Record<string, unknown>
}

export interface VideoRoomResponse {
  room: VideoRoom
}

export async function createVideoRoom(appointmentId: string): Promise<VideoRoomResponse> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY no configurada')
  }

  // Nombre efímero: solo Appointment ID (sin timestamp público)
  const roomName = `psyai-${appointmentId}`
  
  // Calcular expiry (1 hora desde ahora)
  const exp = Math.floor(Date.now() / 1000) + (ROOM_EXPIRY_MINUTES * 60)
  
  const config: RoomConfig = {
    name: roomName,
    privacy: 'private',
    properties: {
      max_participants: 2,
      enable_screenshare: true,
      enable_chat: true,
      enable_knocking: false,
      start_video_off: false,
      start_audio_off: false,
      enable_recording: false,
      eject_at_room_exp: true,
      enable_prejoin_ui: true,
      enable_network_ui: true,
      lang: 'es',
      exp,
    },
  }

  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify(config),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error creando sala Daily.co: ${error}`)
  }

  return response.json()
}

export async function deleteVideoRoom(roomName: string): Promise<void> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY no configurada')
  }

  const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  })

  if (!response.ok && response.status !== 404) {
    const error = await response.text()
    throw new Error(`Error eliminando sala Daily.co: ${error}`)
  }
}

/**
 * Obtener o crear sala efímera para una cita
 * Si la sala ya existe y no ha expirado, la reutiliza
 * Si ha expirado, crea una nueva
 */
export async function getOrCreateVideoRoom(appointmentId: string): Promise<VideoRoomResponse> {
  const roomName = `psyai-${appointmentId}`
  
  // Verificar si ya existe
  const existingRoom = await getVideoRoom(roomName)
  
  if (existingRoom) {
    // Verificar si aún no ha expirado
    const roomConfig = existingRoom.room.config as any
    const exp = roomConfig?.exp
    
    if (exp && Math.floor(Date.now() / 1000) < exp) {
      console.log(`♻️ Reutilizando sala existente: ${roomName}`)
      return existingRoom
    }
    
    // La sala expiró, eliminarla y crear nueva
    console.log(`⏰ Sala expirada, creando nueva: ${roomName}`)
    await deleteVideoRoom(roomName)
  }
  
  // Crear nueva sala
  return createVideoRoom(appointmentId)
}

export async function getVideoRoom(roomName: string): Promise<VideoRoomResponse | null> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY no configurada')
  }

  const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error obteniendo sala Daily.co: ${error}`)
  }

  return response.json()
}

export function generateVideoToken(
  roomName: string,
  userName: string,
  userId: string,
  isOwner: boolean = false
): string {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY no configurada')
  }

  // Nota: En producción, esto debería generarse en el servidor
  // usando la API de Daily.co para crear tokens
  // Este es un cliente stub que debería llamarse desde el backend
  
  return `TOKEN_GENERATION_REQUIRES_SERVER_CALL`
}

export async function createVideoToken(
  roomName: string,
  userName: string,
  userId: string,
  isOwner: boolean = false
): Promise<string> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY no configurada')
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2 // 2 horas

  const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        user_id: userId,
        is_owner: isOwner,
        exp,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error creando token Daily.co: ${error}`)
  }

  const data = await response.json()
  return data.token
}
