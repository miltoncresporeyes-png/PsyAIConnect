/**
 * Billing Queue Service - PsyConnect
 * Sistema de cola de emisión de boletas con reintentos automáticos
 * 
 * Maneja errores del SII y reintentos automáticos
 */

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const invoiceQueueSchema = z.object({
  appointmentId: z.string(),
  pacienteRut: z.string(),
  pacienteNombre: z.string(),
  pacienteEmail: z.string().email().optional(),
  pacienteTelefono: z.string().optional(),
  servicioDescripcion: z.string(),
  servicioFecha: z.string().datetime(),
  servicioMonto: z.number().int().positive(),
  descuento: z.number().int().default(0),
  profesionalRut: z.string(),
  profesionalNombre: z.string(),
})

export type InvoiceQueueInput = z.infer<typeof invoiceQueueSchema>

export enum InvoiceQueueStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

const MAX_ATTEMPTS = 3
const RETRY_DELAYS = [60, 300, 900] // 1min, 5min, 15min en segundos

interface EmitBoletaResult {
  success: boolean
  invoiceNumber?: string
  siiFolio?: string
  error?: string
  errorCode?: string
}

/**
 * Agregar una boleta a la cola de procesamiento
 */
export async function addToInvoiceQueue(data: InvoiceQueueInput): Promise<string> {
  const queueItem = await prisma.invoiceQueue.create({
    data: {
      appointmentId: data.appointmentId,
      pacienteRut: data.pacienteRut,
      pacienteNombre: data.pacienteNombre,
      pacienteEmail: data.pacienteEmail || null,
      pacienteTelefono: data.pacienteTelefono || null,
      servicioDescripcion: data.servicioDescripcion,
      servicioFecha: new Date(data.servicioFecha),
      servicioMonto: data.servicioMonto,
      descuento: data.descuento,
      profesionalRut: data.profesionalRut,
      profesionalNombre: data.profesionalNombre,
      status: InvoiceQueueStatus.PENDING,
      maxAttempts: MAX_ATTEMPTS,
      nextAttemptAt: new Date(), // Procesar inmediatamente
    },
  })

  return queueItem.id
}

/**
 * Procesar la cola de boletas - llamado por cron job
 */
export async function processInvoiceQueue(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const result = { processed: 0, succeeded: 0, failed: 0 }

  // Obtener items pendientes o con retry pendiente
  const pendingItems = await prisma.invoiceQueue.findMany({
    where: {
      status: {
        in: [InvoiceQueueStatus.PENDING, InvoiceQueueStatus.PROCESSING],
      },
      OR: [
        { nextAttemptAt: { lte: new Date() } },
        { nextAttemptAt: null },
      ],
    },
    take: 10, // Procesar máximo 10 por ejecución
    orderBy: { createdAt: 'asc' },
  })

  for (const item of pendingItems) {
    result.processed++

    try {
      // Marcar como procesando
      await prisma.invoiceQueue.update({
        where: { id: item.id },
        data: {
          status: InvoiceQueueStatus.PROCESSING,
          lastAttemptAt: new Date(),
          attempts: { increment: 1 },
        },
      })

      // Intentar emitir la boleta
      const emitResult = await emitBoletaToSII(item)

      if (emitResult.success) {
        // Éxito - marcar como completado
        await prisma.invoiceQueue.update({
          where: { id: item.id },
          data: {
            status: InvoiceQueueStatus.COMPLETED,
            invoiceNumber: emitResult.invoiceNumber,
            siiFolio: emitResult.siiFolio,
            completedAt: new Date(),
          },
        })
        result.succeeded++
      } else {
        // Error - manejar reintento
        await handleInvoiceError(item, emitResult)
        result.failed++
      }
    } catch (error) {
      console.error(`Error processing invoice queue item ${item.id}:`, error)
      await handleInvoiceError(item, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      result.failed++
    }
  }

  return result
}

/**
 * Emitir boleta al SII (llama al script Python)
 */
async function emitBoletaToSII(item: any): Promise<EmitBoletaResult> {
  // Import dinámico para evitar problemas de importación
  const { spawn } = await import('child_process')
  
  return new Promise((resolve) => {
    const datosBoleta = {
      paciente: {
        rut: item.pacienteRut,
        nombre: item.pacienteNombre,
        email: item.pacienteEmail,
        telefono: item.pacienteTelefono,
      },
      servicio: {
        descripcion: item.servicioDescripcion,
        fecha_servicio: item.servicioFecha.toISOString().split('T')[0],
        precio_unitario: item.servicioMonto,
        descuento: item.descuento,
      },
    }

    const pythonProcess = spawn('python', [
      'scripts/boleta_emitter.py',
    ], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let output = ''
    let errorOutput = ''

    pythonProcess.stdin.write(JSON.stringify(datosBoleta))
    pythonProcess.stdin.end()

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim())
          if (result.error) {
            resolve({
              success: false,
              error: result.error,
              errorCode: result.error_code,
            })
          } else {
            resolve({
              success: true,
              invoiceNumber: result.numero_documento,
              siiFolio: result.folio,
            })
          }
        } catch {
          resolve({
            success: false,
            error: 'Invalid response from boleta emitter',
          })
        }
      } else {
        resolve({
          success: false,
          error: errorOutput || 'Boleta emitter failed',
          errorCode: 'SII_ERROR',
        })
      }
    })

    // Timeout de 30 segundos
    setTimeout(() => {
      pythonProcess.kill()
      resolve({
        success: false,
        error: 'Timeout processing boleta',
        errorCode: 'TIMEOUT',
      })
    }, 30000)
  })
}

/**
 * Manejar error de emisión - planificar reintento o marcar como fallido
 */
async function handleInvoiceError(
  item: any,
  result: EmitBoletaResult
): Promise<void> {
  const attempts = item.attempts + 1
  const isMaxAttempts = attempts >= item.maxAttempts

  // Determinar si es un error recuperable
  const isRecoverable = isRecoverableError(result.errorCode)

  if (!isRecoverable || isMaxAttempts) {
    // Error no recuperable o sin reintentos - marcar como fallido o revisión manual
    const status = isRecoverableError(result.errorCode)
      ? InvoiceQueueStatus.FAILED
      : InvoiceQueueStatus.MANUAL_REVIEW

    await prisma.invoiceQueue.update({
      where: { id: item.id },
      data: {
        status,
        errorMessage: result.error,
        errorCode: result.errorCode,
        nextAttemptAt: null,
      },
    })
  } else {
    // Programar reintento
    const delaySeconds = RETRY_DELAYS[attempts - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
    const nextAttempt = new Date(Date.now() + delaySeconds * 1000)

    await prisma.invoiceQueue.update({
      where: { id: item.id },
      data: {
        status: InvoiceQueueStatus.PENDING,
        errorMessage: result.error,
        errorCode: result.errorCode,
        nextAttemptAt: nextAttempt,
      },
    })

    console.log(
      `Invoice queue: Scheduling retry ${attempts + 1}/${item.maxAttempts} ` +
      `for appointment ${item.appointmentId} in ${delaySeconds}s`
    )
  }
}

/**
 * Determinar si un error es recuperable
 */
function isRecoverableError(errorCode?: string): boolean {
  if (!errorCode) return false

  // Errores recuperables - pueden reintentarse
  const recoverableErrors = [
    'TIMEOUT',
    'SII_UNAVAILABLE',
    'CONNECTION_ERROR',
    'RATE_LIMIT',
    'INVALID_TOKEN',
  ]

  // Errores no recuperables - requieren intervención manual
  const nonRecoverableErrors = [
    'INVALID_RUT',
    'INVALID_DATA',
    'DUPLICATE_INVOICE',
    'SII_REJECTED',
  ]

  if (nonRecoverableErrors.includes(errorCode)) {
    return false
  }

  return recoverableErrors.includes(errorCode) || !errorCode
}

/**
 * Obtener estado de la cola de facturación
 */
export async function getInvoiceQueueStats(): Promise<{
  pending: number
  processing: number
  completed: number
  failed: number
  manualReview: number
}> {
  const [pending, processing, completed, failed, manualReview] = await Promise.all([
    prisma.invoiceQueue.count({ where: { status: InvoiceQueueStatus.PENDING } }),
    prisma.invoiceQueue.count({ where: { status: InvoiceQueueStatus.PROCESSING } }),
    prisma.invoiceQueue.count({ where: { status: InvoiceQueueStatus.COMPLETED } }),
    prisma.invoiceQueue.count({ where: { status: InvoiceQueueStatus.FAILED } }),
    prisma.invoiceQueue.count({ where: { status: InvoiceQueueStatus.MANUAL_REVIEW } }),
  ])

  return { pending, processing, completed, failed, manualReview }
}

/**
 * Obtener item de la cola por appointmentId
 */
export async function getInvoiceQueueByAppointment(
  appointmentId: string
): Promise<any | null> {
  return prisma.invoiceQueue.findUnique({
    where: { appointmentId },
  })
}
