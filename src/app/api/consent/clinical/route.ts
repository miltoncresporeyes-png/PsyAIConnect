import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'
import { captureApiError, getRequestId } from '@/lib/observability'

const CLINICAL_CONSENT_VERSION = '1.0'
const CLINICAL_CONSENT_TEMPLATE = [
    'CONSENTIMIENTO_INFORMADO_PSYCONECT',
    'NATURALEZA_DEL_SERVICIO',
    'CONFIDENCIALIDAD',
    'LIMITES_TELEPSICOLOGIA',
    'GRABACION_NO_POR_DEFECTO',
    'PAGOS_Y_CANCELACIONES',
    'DERECHOS_Y_RESPONSABILIDADES',
    'PROTECCION_DE_DATOS',
].join('|')

export async function POST(request: Request) {
    const requestId = getRequestId(request)
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        const clientIp = getClientIp(request)
        const consentLimit = checkRateLimit(`consent:clinical:${session.user.id}:${clientIp}`, {
            limit: 10,
            windowMs: 60 * 60 * 1000,
        })

        if (!consentLimit.allowed) {
            return NextResponse.json(
                { error: 'Demasiados intentos de consentimiento. Intenta nuevamente mas tarde.' },
                { status: 429, headers: createRateLimitHeaders(consentLimit) }
            )
        }

        const body = await request.json()
        const { consentType, digitalSignature, professionalId } = body

        if (consentType !== 'CLINICAL_CONSENT') {
            return NextResponse.json(
                { error: 'Tipo de consentimiento no valido' },
                { status: 400 }
            )
        }

        const signature = typeof digitalSignature === 'string' ? digitalSignature.trim() : ''
        if (signature.length < 3) {
            return NextResponse.json(
                { error: 'Firma digital invalida' },
                { status: 400 }
            )
        }

        if (professionalId && typeof professionalId === 'string') {
            const professionalExists = await prisma.professional.findUnique({
                where: { id: professionalId },
                select: { id: true },
            })

            if (!professionalExists) {
                return NextResponse.json(
                    { error: 'Profesional no encontrado' },
                    { status: 404 }
                )
            }
        }

        // Get user agent and IP for audit trail
        const userAgent = request.headers.get('user-agent') || 'Unknown'
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'Unknown'

        // Create hash from fixed consent template and version for integrity verification
        const consentTextHash = createHash('sha256')
            .update(`${CLINICAL_CONSENT_TEMPLATE}|v=${CLINICAL_CONSENT_VERSION}`)
            .digest('hex')

        // Log consent to database
        const consentLog = await prisma.consentLog.create({
            data: {
                userId: session.user.id,
                consentType,
                consentVersion: CLINICAL_CONSENT_VERSION,
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
        await captureApiError('/api/consent/clinical:POST', error, requestId)
        return NextResponse.json(
            { error: 'Error al registrar el consentimiento', requestId },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }
}

// GET endpoint to retrieve consent history
export async function GET(request: Request) {
    const requestId = getRequestId(request)
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
        await captureApiError('/api/consent/clinical:GET', error, requestId)
        return NextResponse.json(
            { error: 'Error al obtener consentimientos', requestId },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }
}
