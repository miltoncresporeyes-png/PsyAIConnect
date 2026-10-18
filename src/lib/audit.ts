import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export interface AuditParams {
  userId: string
  userRole: string
  action: string
  resource: string
  patientId?: string | null
  details?: string | null
}

/**
 * Registra un evento de auditoría para accesos o modificaciones a datos de salud/pacientes
 * Cumple con el requerimiento de trazabilidad clínica y administrativa.
 * Nunca registra contenido sensible ni notas clínicas.
 */
export async function logAudit({
  userId,
  userRole,
  action,
  resource,
  patientId,
  details,
}: AuditParams) {
  try {
    let ipAddress: string | null = null
    let userAgent: string | null = null

    try {
      const headerList = headers()
      ipAddress = headerList.get('x-forwarded-for')?.split(',')[0].trim() || headerList.get('x-real-ip') || null
      userAgent = headerList.get('user-agent') || null
    } catch {
      // Ignorar si se ejecuta fuera de contexto HTTP (ej. cron o scripts)
    }

    await prisma.auditLog.create({
      data: {
        userId,
        userRole,
        action,
        resource,
        patientId: patientId || null,
        details: details || null,
        ipAddress,
        userAgent,
      },
    })
  } catch (err) {
    // La auditoría no debe bloquear el flujo pero sí emitir alerta en servidor
    console.error('[AUDIT_LOG_ERROR]', err)
  }
}
