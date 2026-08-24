import { prisma } from '@/lib/prisma'
import { encryptClinicalNote } from '@/lib/encryption'
import { generateClinicalHash, generateClinicalSignature } from '@/lib/clinicalSignature'
import { addToInvoiceQueue } from '@/lib/billingQueue'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

export interface SessionCompleteInput {
    appointmentId: string
    professionalId: string
    generateRecipe?: boolean
    recipeContent?: string
    generateCertificate?: boolean
    certificateContent?: string
    diagnosis?: string
    emitInvoice?: boolean
}

export interface SessionCompleteResult {
    success: boolean
    appointmentId: string
    steps: SessionStepResult[]
    documents?: {
        recipe?: DocumentResult
        certificate?: DocumentResult
        invoice?: InvoiceResult
    }
    clinicalNote?: {
        contentHash: string
        signedAt: string
    }
    error?: string
}

export interface SessionStepResult {
    step: string
    success: boolean
    message?: string
    error?: string
    data?: any
}

export interface DocumentResult {
    filename: string
    pdfBase64?: string
    filepath?: string
}

export interface InvoiceResult {
    invoiceNumber: string
    queueId: string
    status: string
}

class SessionManager {
    /**
     * Orquestador principal: Finaliza una sesión completa
     * Ejecuta todas las tareas en orden:
     * 1. Validar que la cita no haya sido finalizada
     * 2. Archivar y firmar la nota clínica
     * 3. Generar documentos PDF (receta/certificado)
     * 4. Emitir boleta electrónica
     * 5. Actualizar estado de la cita
     */
    async finalizarSesionCompleta(input: SessionCompleteInput): Promise<SessionCompleteResult> {
        const { appointmentId, professionalId, generateRecipe, recipeContent, generateCertificate, certificateContent, diagnosis, emitInvoice } = input

        const steps: SessionStepResult[] = []

        try {
            // ========== STEP 1: VALIDAR ==========
            const validationStep = await this.validarCita(appointmentId, professionalId)
            steps.push(validationStep)

            if (!validationStep.success) {
                return {
                    success: false,
                    appointmentId,
                    steps,
                    error: validationStep.error,
                }
            }

            // ========== STEP 2: ARCHIVAR NOTA CLÍNICA ==========
            const noteStep = await this.archivarNotaClinica(appointmentId, professionalId)
            steps.push(noteStep)

            // ========== STEP 3: GENERAR PDF RECETA ==========
            if (generateRecipe && recipeContent) {
                const recipeStep = await this.generarRecetaPDF(appointmentId, professionalId, recipeContent)
                steps.push(recipeStep)
            }

            // ========== STEP 4: GENERAR PDF CERTIFICADO ==========
            if (generateCertificate && certificateContent) {
                const certStep = await this.generarCertificadoPDF(appointmentId, professionalId, certificateContent, diagnosis)
                steps.push(certStep)
            }

            // ========== STEP 5: EMITIR BOLETA ==========
            if (emitInvoice) {
                const invoiceStep = await this.emitirBoleta(appointmentId, professionalId)
                steps.push(invoiceStep)
            }

            // ========== STEP 6: ACTUALIZAR ESTADO ==========
            const statusStep = await this.actualizarEstadoCita(appointmentId)
            steps.push(statusStep)

            // ========== RECOLECTAR RESULTADOS ==========
            const documents: SessionCompleteResult['documents'] = {}
            
            const recipeResult = steps.find(s => s.step === 'recipe_pdf' && s.success)
            if (recipeResult?.data) {
                documents.recipe = recipeResult.data
            }

            const certResult = steps.find(s => s.step === 'certificate_pdf' && s.success)
            if (certResult?.data) {
                documents.certificate = certResult.data
            }

            const invoiceResult = steps.find(s => s.step === 'invoice' && s.success)
            if (invoiceResult?.data) {
                documents.invoice = invoiceResult.data
            }

            const noteResult = steps.find(s => s.step === 'clinical_note' && s.success)

            return {
                success: true,
                appointmentId,
                steps,
                documents,
                clinicalNote: noteResult?.data,
            }

        } catch (error) {
            console.error('Error en finalizarSesionCompleta:', error)
            return {
                success: false,
                appointmentId,
                steps,
                error: error instanceof Error ? error.message : 'Error desconocido',
            }
        }
    }

    /**
     * Valida que la cita exista, pertenezca al profesional y no haya sido finalizada
     */
    private async validarCita(appointmentId: string, professionalId: string): Promise<SessionStepResult> {
        try {
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
            })

            if (!appointment) {
                return {
                    step: 'validation',
                    success: false,
                    error: 'Cita no encontrada',
                }
            }

            if (appointment.professionalId !== professionalId) {
                return {
                    step: 'validation',
                    success: false,
                    error: 'No tienes autorización para esta cita',
                }
            }

            if (appointment.status === 'COMPLETED') {
                return {
                    step: 'validation',
                    success: false,
                    error: 'Esta cita ya ha sido finalizada',
                }
            }

            if (appointment.status === 'CANCELLED') {
                return {
                    step: 'validation',
                    success: false,
                    error: 'No se puede finalizar una cita cancelada',
                }
            }

            return {
                step: 'validation',
                success: true,
                message: 'Cita validada correctamente',
            }
        } catch (error) {
            return {
                step: 'validation',
                success: false,
                error: error instanceof Error ? error.message : 'Error al validar cita',
            }
        }
    }

    /**
     * Archiva la nota clínica: mueve el borrador a la tabla definitiva y lo firma
     */
    private async archivarNotaClinica(appointmentId: string, professionalId: string): Promise<SessionStepResult> {
        try {
            const draft = await prisma.clinicalNoteDraft.findUnique({
                where: { appointmentId },
            })

            const professional = await prisma.professional.findUnique({
                where: { id: professionalId },
                include: { user: true },
            })

            if (!professional) {
                return {
                    step: 'clinical_note',
                    success: false,
                    error: 'Profesional no encontrado',
                }
            }

            const signedAt = new Date()
            let contentHash = ''
            let signature = ''

            if (draft) {
                contentHash = generateClinicalHash(draft.content, professionalId, appointmentId)
                signature = generateClinicalSignature(
                    draft.content,
                    professionalId,
                    appointmentId,
                    professional.user.name || 'Profesional'
                )

                const encryptedContent = encryptClinicalNote(draft.content)

                // Buscar nota existente
                const existingNote = await prisma.clinicalNote.findFirst({
                    where: {
                        appointmentId,
                        professionalId,
                        deletedAt: null,
                    },
                })

                if (existingNote) {
                    if (existingNote.isFinalized) {
                        return {
                            step: 'clinical_note',
                            success: false,
                            error: 'La nota ya está firmada. Usa un anexo para correcciones.',
                        }
                    }

                    await prisma.clinicalNote.update({
                        where: { id: existingNote.id },
                        data: {
                            encryptedContent,
                            contentHash,
                            signature,
                            signedAt,
                            isFinalized: true,
                            finalizedAt: signedAt,
                            updatedAt: new Date(),
                        },
                    })
                } else {
                    await prisma.clinicalNote.create({
                        data: {
                            appointmentId,
                            professionalId,
                            encryptedContent,
                            contentHash,
                            signature,
                            signedAt,
                            isFinalized: true,
                            finalizedAt: signedAt,
                        },
                    })
                }

                // Eliminar borrador
                await prisma.clinicalNoteDraft.delete({
                    where: { id: draft.id },
                })
            }

            return {
                step: 'clinical_note',
                success: true,
                message: draft ? 'Nota clínica archivada y firmada' : 'No había borrador para archivar',
                data: {
                    contentHash,
                    signedAt: signedAt.toISOString(),
                },
            }
        } catch (error) {
            return {
                step: 'clinical_note',
                success: false,
                error: error instanceof Error ? error.message : 'Error al archivar nota',
            }
        }
    }

    /**
     * Genera PDF de receta médica
     */
    private async generarRecetaPDF(appointmentId: string, professionalId: string, content: string): Promise<SessionStepResult> {
        try {
            const result = await this.generarPDF('recipe', appointmentId, professionalId, content)

            return {
                step: 'recipe_pdf',
                success: true,
                data: result,
            }
        } catch (error) {
            return {
                step: 'recipe_pdf',
                success: false,
                error: error instanceof Error ? error.message : 'Error al generar receta',
            }
        }
    }

    /**
     * Genera PDF de certificado médico
     */
    private async generarCertificadoPDF(
        appointmentId: string,
        professionalId: string,
        content: string,
        diagnosis?: string
    ): Promise<SessionStepResult> {
        try {
            const result = await this.generarPDF('certificate', appointmentId, professionalId, content, diagnosis)

            return {
                step: 'certificate_pdf',
                success: true,
                data: result,
            }
        } catch (error) {
            return {
                step: 'certificate_pdf',
                success: false,
                error: error instanceof Error ? error.message : 'Error al generar certificado',
            }
        }
    }

    /**
     * Genera un PDF usando el script de Python
     */
    private async generarPDF(
        type: 'recipe' | 'certificate',
        appointmentId: string,
        professionalId: string,
        content: string,
        diagnosis?: string
    ): Promise<DocumentResult> {
        const scriptPath = path.join(process.cwd(), 'scripts', 'pdf', 'generate_medical_pdf.py')

        if (!fs.existsSync(scriptPath)) {
            throw new Error('Script de PDF no encontrado')
        }

        const args = [
            scriptPath,
            '--type', type,
            '--appointment_id', appointmentId,
            '--professional_id', professionalId,
            '--content', content.replace(/"/g, '\\"'),
        ]

        if (diagnosis) {
            args.push('--diagnosis', diagnosis.replace(/"/g, '\\"'))
        }

        const command = `python3 ${args.join(' ')}`

        let stdout = ''
        let stderr = ''
        try {
            stdout = execSync(command, { 
                cwd: process.cwd(),
                encoding: 'utf-8',
                timeout: 60000,
            })
        } catch (execError: any) {
            stdout = execError.stdout || ''
            stderr = execError.stderr || ''
        }

        let pdfData
        try {
            pdfData = JSON.parse(stdout)
        } catch {
            throw new Error(`Error al parsear PDF: ${stderr.slice(-200)}`)
        }

        if (pdfData.error) {
            throw new Error(pdfData.error)
        }

        return {
            filename: pdfData.filename,
            pdfBase64: pdfData.pdf_base64,
            filepath: pdfData.filepath,
        }
    }

    /**
     * Emite boleta electrónica de honorarios
     */
    private async emitirBoleta(appointmentId: string, professionalId: string): Promise<SessionStepResult> {
        try {
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    patient: {
                        include: {
                            patientProfile: true,
                        },
                    },
                },
            })

            const professional = await prisma.professional.findUnique({
                where: { id: professionalId },
                include: { user: true },
            })

            if (!appointment || !professional) {
                return {
                    step: 'invoice',
                    success: false,
                    error: 'Cita o profesional no encontrado',
                }
            }

            const patient = appointment.patient
            const patientRut = patient.patientProfile?.rut || patient.email?.split('@')[0] || '12345678'
            const serviceDescription = `Consulta de psicología - ${new Date(appointment.scheduledAt).toLocaleDateString('es-CL')}`

            const invoiceInput = {
                appointmentId: appointment.id,
                pacienteRut: patientRut,
                pacienteNombre: patient.name || 'Paciente',
                pacienteEmail: patient.email || undefined,
                pacienteTelefono: patient.phone || undefined,
                servicioDescripcion: serviceDescription,
                servicioFecha: appointment.scheduledAt.toISOString().split('T')[0],
                servicioMonto: professional.sessionPrice,
                descuento: 0,
                profesionalRut: professional.rut || '12345678',
                profesionalNombre: professional.user.name || 'Profesional',
            }

            const queueId = await addToInvoiceQueue(invoiceInput)

            return {
                step: 'invoice',
                success: true,
                data: {
                    invoiceNumber: `PENDIENTE-${queueId.slice(0, 8)}`,
                    queueId: queueId,
                    status: 'EN_COLA',
                },
            }
        } catch (error) {
            return {
                step: 'invoice',
                success: false,
                error: error instanceof Error ? error.message : 'Error al emitir boleta',
            }
        }
    }

    /**
     * Actualiza el estado de la cita a COMPLETED
     */
    private async actualizarEstadoCita(appointmentId: string): Promise<SessionStepResult> {
        try {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: 'COMPLETED',
                    attendanceStatus: 'FINALIZADA',
                    sessionEndedAt: new Date(),
                },
            })

            return {
                step: 'appointment_status',
                success: true,
                message: 'Estado de cita actualizado a COMPLETED',
            }
        } catch (error) {
            return {
                step: 'appointment_status',
                success: false,
                error: error instanceof Error ? error.message : 'Error al actualizar estado',
            }
        }
    }
}

// Exportar instancia singleton
export const sessionManager = new SessionManager()

// Exportar función principal
export const finalizarSesionCompleta = (
    input: SessionCompleteInput
): Promise<SessionCompleteResult> => {
    return sessionManager.finalizarSesionCompleta(input)
}
