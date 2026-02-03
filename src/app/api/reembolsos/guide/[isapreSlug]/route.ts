/**
 * API: Obtener guía de reembolso de una Isapre específica
 * GET /api/reembolsos/guide/[isapreSlug]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIsapreGuide, getAllGuides } from '@/lib/isapreGuides'

export async function GET(
    req: NextRequest,
    { params }: { params: { isapreSlug: string } }
) {
    try {
        const { isapreSlug } = params

        // Si piden 'all', retornar todas las guías
        if (isapreSlug === 'all') {
            const guides = getAllGuides()
            return NextResponse.json(guides)
        }

        // Obtener guía específica
        const guide = getIsapreGuide(isapreSlug)

        if (!guide) {
            return NextResponse.json(
                { error: 'Guía no encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json(guide)
    } catch (error) {
        console.error('Error fetching Isapre guide:', error)
        return NextResponse.json(
            { error: 'Error al obtener guía' },
            { status: 500 }
        )
    }
}
