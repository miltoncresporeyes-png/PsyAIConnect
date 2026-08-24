/**
 * Supabase Realtime Service for PsyConnect
 * Maneja tiempo real para la sala de espera y videollamada
 */

import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type RealtimeChannel = 'appointment-status' | 'waiting-room'

interface AppointmentRealtimePayload {
  attendanceStatus?: string
  pacienteOnline?: boolean
  profesionalOnline?: boolean
  patientJoinedAt?: Date | null
  professionalJoinedAt?: Date | null
  sessionStartedAt?: Date | null
  sessionEndedAt?: Date | null
}

/**
 * Suscribirse a cambios en una cita
 */
export function subscribeToAppointment(
  appointmentId: string,
  callback: (payload: any) => void
): { unsubscribe: () => void } | null {
  if (!supabase) {
    console.warn('Supabase not configured - realtime disabled')
    return null
  }

  const channel = supabase
    .channel(`appointment:${appointmentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Appointment',
        filter: `id=eq.${appointmentId}`,
      },
      callback
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}

/**
 * Actualizar estado de asistencia en la base de datos
 */
export async function updateAttendanceStatus(
  appointmentId: string,
  userId: string,
  data: {
    pacienteOnline?: boolean
    profesionalOnline?: boolean
    attendanceStatus?: string
    patientJoinedAt?: Date | null
    professionalJoinedAt?: Date | null
    sessionStartedAt?: Date | null
    sessionEndedAt?: Date | null
  }
): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { professional: { include: { user: true } } },
  })

  if (!appointment) {
    throw new Error('Appointment not found')
  }

  const isPatient = appointment.patientId === userId
  const isProfessional = appointment.professional.userId === userId

  const updateData: any = {}

  if (isPatient) {
    if (data.pacienteOnline !== undefined) updateData.pacienteOnline = data.pacienteOnline
    if (data.patientJoinedAt !== undefined) updateData.patientJoinedAt = data.patientJoinedAt
  }

  if (isProfessional) {
    if (data.profesionalOnline !== undefined) updateData.profesionalOnline = data.profesionalOnline
    if (data.professionalJoinedAt !== undefined) updateData.professionalJoinedAt = data.professionalJoinedAt
  }

  if (data.attendanceStatus) {
    updateData.attendanceStatus = data.attendanceStatus
  }

  if (data.sessionStartedAt) {
    updateData.sessionStartedAt = data.sessionStartedAt
  }

  if (data.sessionEndedAt) {
    updateData.sessionEndedAt = data.sessionEndedAt
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
  })
}

/**
 * Notificar que un usuario se unió a la sala
 */
export async function notifyUserJoined(
  appointmentId: string,
  userId: string,
  isProfessional: boolean
): Promise<void> {
  const data: AppointmentRealtimePayload = {
    attendanceStatus: 'EN_SESION',
  }

  if (isProfessional) {
    data.profesionalOnline = true
    data.professionalJoinedAt = new Date()
  } else {
    data.pacienteOnline = true
    data.patientJoinedAt = new Date()
  }

  await updateAttendanceStatus(appointmentId, userId, data)
}

/**
 * Notificar que un usuario salió de la sala
 */
export async function notifyUserLeft(
  appointmentId: string,
  userId: string,
  isProfessional: boolean
): Promise<void> {
  if (isProfessional) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { profesionalOnline: false },
    })
  } else {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { pacienteOnline: false },
    })
  }
}

/**
 * Iniciar la sesión (cuando ambos están presentes)
 */
export async function startSession(
  appointmentId: string,
  userId: string
): Promise<void> {
  await updateAttendanceStatus(appointmentId, userId, {
    attendanceStatus: 'EN_SESION',
    sessionStartedAt: new Date(),
  })
}

/**
 * Finalizar la sesión
 */
export async function endSession(
  appointmentId: string,
  userId: string
): Promise<void> {
  await updateAttendanceStatus(appointmentId, userId, {
    attendanceStatus: 'FINALIZADA',
    sessionEndedAt: new Date(),
  })
}

/**
 * Obtener estado actual de la cita
 */
export async function getAppointmentRealtimeStatus(
  appointmentId: string
): Promise<{
  attendanceStatus: string
  pacienteOnline: boolean
  profesionalOnline: boolean
  patientJoinedAt: Date | null
  professionalJoinedAt: Date | null
  sessionStartedAt: Date | null
} | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      attendanceStatus: true,
      pacienteOnline: true,
      profesionalOnline: true,
      patientJoinedAt: true,
      professionalJoinedAt: true,
      sessionStartedAt: true,
    },
  })

  return appointment
}
