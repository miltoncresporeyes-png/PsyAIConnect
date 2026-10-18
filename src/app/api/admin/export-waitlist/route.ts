import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function escapeCsvField(val: unknown): string {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const authHeader = req.headers.get('authorization')
    const adminToken = process.env.ADMIN_EXPORT_TOKEN

    const isAuthorized =
        (session?.user && (session.user as any).role === 'ADMIN') ||
        (adminToken && authHeader === `Bearer ${adminToken}`) ||
        (adminToken && req.nextUrl.searchParams.get('token') === adminToken)

    if (!isAuthorized && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        const patients = await prisma.waitlistPatient.findMany({
            orderBy: { createdAt: 'desc' },
        })

        const headers = [
            'ID',
            'Email',
            'Nombre',
            'Comuna/Region',
            'Tipo Atencion',
            'Modalidad',
            'Telefono/WhatsApp',
            'Fecha Registro',
        ]

        const rows = patients.map((p) => [
            escapeCsvField(p.id),
            escapeCsvField(p.email),
            escapeCsvField(p.name || ''),
            escapeCsvField(p.comuna),
            escapeCsvField(p.careType || ''),
            escapeCsvField(p.modality || ''),
            escapeCsvField(p.whatsapp || ''),
            escapeCsvField(p.createdAt.toISOString()),
        ])

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="lista_espera_pacientes_${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        })
    } catch (error) {
        console.error('Error exporting waitlist CSV:', error)
        return NextResponse.json({ error: 'Error al exportar datos' }, { status: 500 })
    }
}
