import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptClinicalNote } from '@/lib/encryption'

// Force dynamic rendering for API routes using auth
export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id },
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'Perfil profesional no encontrado' },
                { status: 404 }
            )
        }

        // Get appointments between this professional and patient
        const appointments = await prisma.appointment.findMany({
            where: {
                professionalId: professional.id,
                patientId: params.id,
            },
            include: {
                clinicalNotes: {
                    where: { deletedAt: null },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
                payment: true,
            },
            orderBy: { scheduledAt: 'desc' },
        })

        // El profesional solo puede ver pacientes con los que tiene (o tuvo) una cita.
        // Sin esta comprobación, cualquier ID de usuario sería enumerable.
        if (appointments.length === 0) {
            return NextResponse.json(
                { error: 'Paciente no encontrado' },
                { status: 404 }
            )
        }

        // Auditar acceso a la ficha clínica (Ley 19.628 y estándares de salud)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'
        await prisma.clinicalAccessAudit.create({
            data: {
                userId: session.user.id,
                userRole: session.user.role || 'PROFESSIONAL',
                patientId: params.id,
                action: 'VIEW_HISTORY',
                ipAddress: ip.split(',')[0].trim(),
                userAgent: userAgent.slice(0, 255),
            },
        }).catch((err) => {
            console.error('Failed to create clinical audit record:', err)
        })

        // Get patient info
        const patient = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        })

        if (!patient) {
            return NextResponse.json(
                { error: 'Paciente no encontrado' },
                { status: 404 }
            )
        }

        // Calculate stats
        const completedAppointments = appointments.filter(a => a.status === 'COMPLETED')
        const totalSpent = appointments
            .filter(a => a.payment?.status === 'COMPLETED')
            .reduce((sum, a) => sum + (a.payment?.amount || 0), 0)

        // Format appointments with decrypted notes and indicaciones
        const formattedAppointments = appointments.map(apt => {
            let note = null
            let indicaciones = null

            if (apt.clinicalNotes.length > 0) {
                const clinicalNote = apt.clinicalNotes[0]

                // Decrypt clinical note content
                if (clinicalNote.encryptedContent) {
                    try {
                        const decrypted = decryptClinicalNote(clinicalNote.encryptedContent)
                        note = {
                            content: decrypted.content,
                            createdAt: clinicalNote.createdAt.toISOString(),
                        }
                    } catch (err) {
                        console.error('Error decrypting note:', err)
                    }
                }

                // Decrypt indicaciones
                if (clinicalNote.encryptedIndicaciones) {
                    try {
                        const decrypted = decryptClinicalNote(clinicalNote.encryptedIndicaciones)
                        indicaciones = {
                            content: decrypted.content,
                            createdAt: clinicalNote.createdAt.toISOString(),
                        }
                    } catch (err) {
                        console.error('Error decrypting indicaciones:', err)
                    }
                }
            }

            return {
                id: apt.id,
                scheduledAt: apt.scheduledAt.toISOString(),
                duration: apt.duration,
                modality: apt.modality,
                status: apt.status,
                consultationReason: apt.consultationReason,
                hasNote: !!note,
                hasIndicaciones: !!indicaciones,
                note,
                indicaciones,
            }
        })

        return NextResponse.json({
            patient,
            appointments: formattedAppointments,
            stats: {
                totalAppointments: appointments.length,
                completedAppointments: completedAppointments.length,
                totalSpent,
            },
        })
    } catch (error) {
        console.error('Patient detail error:', error)
        return NextResponse.json(
            { error: 'Error al obtener datos del paciente' },
            { status: 500 }
        )
    }
}
