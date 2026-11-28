import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'
import { prisma } from '@/lib/prisma'
import { FOUNDER_SLOTS, FOUNDER_TIER, firstFreeSlot, founderBenefitEnd } from '@/lib/founders'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const guard = await requireAdmin()
        if ('error' in guard) return guard.error

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
        const guard = await requireAdmin()
        if ('error' in guard) return guard.error

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

            const wasApproved = application.estado === 'aprobado'
            const [updated] = await prisma.$transaction(async (tx) => {
                const result = await tx.founderApplication.update({
                    where: { id },
                    data: {
                        estado: 'rechazado',
                        motivoRechazo: motivoRechazo.trim(),
                        // Libera el cupo para que lo use otra persona
                        numeroCupo: null,
                        fechaInicioBeneficio: null,
                        fechaFinBeneficio: null,
                    },
                })
                if (wasApproved && application.fechaFinBeneficio) {
                    await revokeFounderPlan(tx, application.email, application.fechaFinBeneficio)
                }
                return [result]
            })
            return NextResponse.json({ success: true, application: updated })
        }

        // Action 3: Aprobar perfil fundador
        if (action === 'aprobar') {
            if (application.estado === 'aprobado') {
                return NextResponse.json({ error: 'Esta postulación ya está aprobada' }, { status: 400 })
            }

            const fechaInicio = new Date()
            const fechaFin = founderBenefitEnd(fechaInicio)

            // Hasta 3 intentos: si dos aprobaciones simultáneas eligen el mismo cupo, la restricción única reintenta
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    const outcome = await prisma.$transaction(async (tx) => {
                        const taken = await tx.founderApplication.findMany({
                            where: { estado: 'aprobado' },
                            select: { numeroCupo: true },
                        })
                        const numeroCupo = firstFreeSlot(taken.map((t) => t.numeroCupo))
                        if (numeroCupo === null) return null

                        const updated = await tx.founderApplication.update({
                            where: { id },
                            data: {
                                estado: 'aprobado',
                                numeroCupo,
                                fechaInicioBeneficio: fechaInicio,
                                fechaFinBeneficio: fechaFin,
                                motivoRechazo: null,
                            },
                        })

                        // Activa el plan Pro de la cuenta con ese correo (si ya existe)
                        const professional = await findProfessionalByEmail(tx, application.email)
                        if (professional) {
                            await tx.professional.update({
                                where: { id: professional.id },
                                data: { subscriptionTier: FOUNDER_TIER, subscriptionEnds: fechaFin, subscriptionCancelledAt: null, isFounder: true },
                            })
                        }
                        return { updated, numeroCupo, accountActivated: Boolean(professional) }
                    })

                    if (!outcome) {
                        return NextResponse.json(
                            { error: `Cupos completos. No es posible aprobar más de ${FOUNDER_SLOTS} profesionales fundadores.` },
                            { status: 400 }
                        )
                    }

                    return NextResponse.json({
                        success: true,
                        application: outcome.updated,
                        accountActivated: outcome.accountActivated,
                        message: outcome.accountActivated
                            ? `Fundador aprobado. Cupo N° ${outcome.numeroCupo} de ${FOUNDER_SLOTS} y plan Pro activado por 12 meses.`
                            : `Fundador aprobado. Cupo N° ${outcome.numeroCupo} de ${FOUNDER_SLOTS}. Aún no existe una cuenta profesional con ese correo, por lo que el plan Pro no se activó.`,
                    })
                } catch (err) {
                    const code = (err as { code?: string })?.code
                    if (code === 'P2002' && attempt < 2) continue
                    throw err
                }
            }
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    } catch (error) {
        console.error('Error updating founder application:', error)
        return NextResponse.json({ error: 'Error al actualizar postulación' }, { status: 500 })
    }
}

type Tx = Pick<typeof prisma, 'user' | 'professional'>

async function findProfessionalByEmail(tx: Tx, email: string) {
    const user = await tx.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        select: { professional: { select: { id: true } } },
    })
    return user?.professional ?? null
}

/** Quita el plan de fundador solo si sigue siendo el que se concedió (no toca planes pagados). */
async function revokeFounderPlan(tx: Tx, email: string, grantedEnd: Date) {
    const professional = await findProfessionalByEmail(tx, email)
    if (!professional) return
    await tx.professional.update({ where: { id: professional.id }, data: { isFounder: false } })
    await tx.professional.updateMany({
        where: { id: professional.id, subscriptionTier: FOUNDER_TIER, subscriptionEnds: grantedEnd },
        data: { subscriptionTier: 'STARTER', subscriptionEnds: null },
    })
}
