import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const format = searchParams.get('format')

        const applications = await prisma.founderApplication.findMany({
            orderBy: [
                { numeroCupo: 'asc' },
                { createdAt: 'desc' },
            ],
        })

        const approvedCount = await prisma.founderApplication.count({
            where: { estado: 'aprobado' },
        })

        // CSV export
        if (format === 'csv') {
            const headers = [
                'ID',
                'Nombre Completo',
                'RUT',
                'Profesion',
                'Registro Superintendencia',
                'Email',
                'Telefono',
                'Modalidad',
                'Comuna/Region',
                'Estado',
                'Verificado Registro',
                'Numero Cupo',
                'Fecha Aceptacion',
                'Version Terminos',
                'Fecha Inicio Beneficio',
                'Fecha Fin Beneficio',
                'Motivo Rechazo',
            ]

            const rows = applications.map((app) => [
                `"${app.id}"`,
                `"${app.nombreCompleto.replace(/"/g, '""')}"`,
                `"${app.rut}"`,
                `"${app.profesion}"`,
                `"${app.registroSuperintendencia}"`,
                `"${app.email}"`,
                `"${app.telefono}"`,
                `"${app.modalidadAtencion}"`,
                `"${app.comunaRegion.replace(/"/g, '""')}"`,
                `"${app.estado}"`,
                `"${app.verificadoEnRegistro ? 'SI' : 'NO'}"`,
                `"${app.numeroCupo ?? ''}"`,
                `"${app.fechaAceptacion.toISOString()}"`,
                `"${app.versionTerminos}"`,
                `"${app.fechaInicioBeneficio ? app.fechaInicioBeneficio.toISOString() : ''}"`,
                `"${app.fechaFinBeneficio ? app.fechaFinBeneficio.toISOString() : ''}"`,
                `"${(app.motivoRechazo || '').replace(/"/g, '""')}"`,
            ])

            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="postulaciones_fundadores_${new Date().toISOString().slice(0, 10)}.csv"`,
                },
            })
        }

        return NextResponse.json({
            applications,
            approvedCount,
            cuposTotales: 20,
            cuposCompletos: approvedCount >= 20,
        })
    } catch (error) {
        console.error('Error fetching founder applications:', error)
        return NextResponse.json({ error: 'Error al obtener postulaciones' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }

        const body = await req.json().catch(() => null)
        if (!body) {
            return NextResponse.json({ error: 'Cuerpo de solicitud requerido' }, { status: 400 })
        }

        const { id, action, motivoRechazo, verificadoEnRegistro } = body

        if (!id) {
            return NextResponse.json({ error: 'ID de postulación requerido' }, { status: 400 })
        }

        const application = await prisma.founderApplication.findUnique({
            where: { id },
        })

        if (!application) {
            return NextResponse.json({ error: 'Postulación no encontrada' }, { status: 404 })
        }

        // Action 1: Marcar verificado en el Registro
        if (action === 'toggle-verificado') {
            const updated = await prisma.founderApplication.update({
                where: { id },
                data: {
                    verificadoEnRegistro: typeof verificadoEnRegistro === 'boolean' ? verificadoEnRegistro : !application.verificadoEnRegistro,
                    fechaVerificadoRegistro: new Date(),
                },
            })
            return NextResponse.json({ success: true, application: updated })
        }

        // Action 2: Rechazar postulación (requiere motivo obligatorio)
        if (action === 'rechazar') {
            if (!motivoRechazo || motivoRechazo.trim().length === 0) {
                return NextResponse.json({ error: 'El motivo de rechazo es obligatorio' }, { status: 400 })
            }

            const updated = await prisma.founderApplication.update({
                where: { id },
                data: {
                    estado: 'rechazado',
                    motivoRechazo: motivoRechazo.trim(),
                },
            })
            return NextResponse.json({ success: true, application: updated })
        }

        // Action 3: Aprobar perfil fundador
        if (action === 'aprobar') {
            // Contar fundadores ya aprobados
            const approvedCount = await prisma.founderApplication.count({
                where: { estado: 'aprobado' },
            })

            // Bloquear la aprobación del fundador N° 21
            if (approvedCount >= 20) {
                return NextResponse.json(
                    { error: 'Cupos completos. No es posible aprobar más de 20 profesionales fundadores.' },
                    { status: 400 }
                )
            }

            // Calcular número correlativo de cupo (1 a 20)
            const numeroCupo = approvedCount + 1
            const fechaInicio = new Date()
            const fechaFin = new Date(fechaInicio)
            fechaFin.setFullYear(fechaFin.getFullYear() + 1) // +12 meses

            const updated = await prisma.founderApplication.update({
                where: { id },
                data: {
                    estado: 'aprobado',
                    numeroCupo,
                    fechaInicioBeneficio: fechaInicio,
                    fechaFinBeneficio: fechaFin,
                    motivoRechazo: null,
                },
            })

            return NextResponse.json({
                success: true,
                application: updated,
                message: `Fundador aprobado con éxito. Asignado cupo correlativo N° ${numeroCupo} de 20.`,
            })
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    } catch (error) {
        console.error('Error updating founder application:', error)
        return NextResponse.json({ error: 'Error al actualizar postulación' }, { status: 500 })
    }
}
