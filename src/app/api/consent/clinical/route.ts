import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { consentType, digitalSignature } = body

        if (!consentType || !digitalSignature) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            )
        }

        // Get user agent and IP for audit trail
        const userAgent = request.headers.get('user-agent') || 'Unknown'
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'Unknown'

        // Create hash of consent text for integrity verification
        // In production, this should hash the actual consent document version
        const consentVersion = '1.0'
        const consentTextHash = createHash('sha256')
            .update(`CLINICAL_CONSENT_${consentVersion}_${new Date().toISOString()}`)
            .digest('hex')

        // Log consent to database
        const consentLog = await prisma.consentLog.create({
            data: {
                userId: session.user.id,
                consentType: consentType,
                consentVersion: consentVersion,
                consentTextHash: consentTextHash,
                granted: true,
                grantedAt: new Date(),
                ipAddress: ipAddress,
                userAgent: userAgent,
            },
        })

        return NextResponse.json({
            success: true,
            consentId: consentLog.id,
            message: 'Consentimiento registrado correctamente'
        })

    } catch (error) {
        console.error('Error logging clinical consent:', error)
        return NextResponse.json(
            { error: 'Error al registrar el consentimiento' },
            { status: 500 }
        )
    }
}

// GET endpoint to retrieve consent history
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const consents = await prisma.consentLog.findMany({
            where: {
                userId: session.user.id,
                revokedAt: null, // Only active consents
            },
            orderBy: {
                grantedAt: 'desc',
            },
            select: {
                id: true,
                consentType: true,
                consentVersion: true,
                granted: true,
                grantedAt: true,
            },
        })

        return NextResponse.json({ consents })

    } catch (error) {
        console.error('Error fetching consents:', error)
        return NextResponse.json(
            { error: 'Error al obtener consentimientos' },
            { status: 500 }
        )
    }
}
