import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptClinicalNote } from '@/lib/encryption'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const patientId = session.user.id

        // Auditar acceso a la ficha clínica (Ley 19.628 / 20.584)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'
        await prisma.clinicalAccessAudit.create({
            data: {
                userId: patientId,
                userRole: session.user.role || 'PATIENT',
                patientId: patientId,
                action: 'VIEW_DIAGNOSES',
                ipAddress: ip.split(',')[0].trim(),
                userAgent: userAgent.slice(0, 255),
            },
        }).catch((err) => {
            console.error('Failed to log clinical access audit for diagnoses:', err)
        })

        // Buscar todas las citas del paciente que tengan notas clínicas asociadas
        const appointmentsWithNotes = await prisma.appointment.findMany({
            where: {
                patientId,
                clinicalNotes: {
                    some: {
                        deletedAt: null,
                    },
                },
            },
            include: {
                professional: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                clinicalNotes: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        })

        const diagnoses = appointmentsWithNotes.flatMap((apt) => {
            return apt.clinicalNotes.map((note) => {
                let decryptedIndicaciones: string | null = null
                let decryptedSummary: string | null = null

                if (note.encryptedIndicaciones) {
                    try {
                        const parsed = decryptClinicalNote(note.encryptedIndicaciones)
                        decryptedIndicaciones = parsed.content
                    } catch (e) {
                        console.error('Error decrypting indicaciones:', e)
                    }
                }

                if (note.encryptedContent) {
                    try {
                        const parsed = decryptClinicalNote(note.encryptedContent)
                        // Para el paciente, si no hay resumen explícito, podemos mostrar el contenido o extraer líneas clave
                        decryptedSummary = parsed.content
                    } catch (e) {
                        console.error('Error decrypting note summary:', e)
                    }
                }

                // Generar un tag legible o fallback basado en diagnosticTag o appointment
                const diagnosticTitle = note.diagnosticTag || (note.treatmentType ? `Evaluación: ${note.treatmentType}` : 'Diagnóstico Clínico General')

                return {
                    id: note.id,
                    appointmentId: apt.id,
                    date: note.signedAt || note.createdAt,
                    scheduledAt: apt.scheduledAt,
                    diagnosticTitle,
                    treatmentType: note.treatmentType || 'Psicoterapia Integral',
                    isFinalized: note.isFinalized,
                    indicaciones: decryptedIndicaciones,
                    summary: decryptedSummary,
                    professional: {
                        name: apt.professional.user.name,
                        type: apt.professional.professionalType === 'PSYCHIATRIST' ? 'Psiquiatra' : 'Psicólogo/a Clínico/a',
                        specialties: apt.professional.specialties,
                        licenseNumber: apt.professional.licenseNumber,
                    },
                    status: note.isFinalized ? 'Tratamiento Activo' : 'En Evaluación Inicial',
                }
            })
        })

        return NextResponse.json({
            success: true,
            diagnoses,
            count: diagnoses.length,
        })
    } catch (error) {
        console.error('Error in patient diagnoses API:', error)
        return NextResponse.json(
            { error: 'Error al consultar diagnósticos clínicos' },
            { status: 500 }
        )
    }
}
