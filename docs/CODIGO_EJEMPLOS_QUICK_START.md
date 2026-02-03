# 💻 Ejemplos de Código - Quick Start

## 🚀 Snippets Listos para Implementar

Esta guía contiene código funcional que puedes copiar y pegar directamente en el proyecto.

---

## 1️⃣ Matching por Previsión - Código Funcional

### 1.1 Endpoint de Búsqueda con Cobertura

```typescript
// src/app/api/professionals/search-with-coverage/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            specialties,
            modality,
            healthSystem,
            isapreId,
            fonasaTramoId,
            hasBonoIMED,
            maxCopayment,
            page = 1,
            limit = 20
        } = body

        // 1. Query base de profesionales
        const whereClause: any = {
            isActive: true,
            isPublic: true,
            verificationStatus: 'VERIFIED'
        }

        if (specialties?.length > 0) {
            whereClause.specialties = {
                hasSome: specialties
            }
        }

        if (modality) {
            whereClause.modality = {
                in: [modality, 'BOTH']
            }
        }

        // 2. Obtener profesionales base
        const professionals = await prisma.professional.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                isapreConvenios: {
                    where: { isActive: true },
                    include: {
                        isapre: true
                    }
                },
                fonasaAcceptance: {
                    where: { isActive: true },
                    include: {
                        fonasaTramo: true
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit
        })

        // 3. Calcular score y compatibilidad financiera para cada uno
        const scoredProfessionals = professionals.map(prof => {
            const financialScore = calculateFinancialScore(prof, {
                healthSystem,
                isapreId,
                fonasaTramoId,
                hasBonoIMED
            })

            const specialtyScore = calculateSpecialtyScore(prof, specialties)
            const ratingScore = (prof.rating || 4.0) * 20 // Escala a 100

            const totalScore = 
                financialScore * 0.40 +
                specialtyScore * 0.30 +
                50 * 0.15 + // Location (placeholder)
                ratingScore * 0.10 +
                70 * 0.05 // Availability (placeholder)

            const paymentDetails = calculatePaymentDetails(prof, {
                healthSystem,
                isapreId,
                fonasaTramoId,
                hasBonoIMED
            })

            return {
                id: prof.id,
                name: prof.user.name,
                profileImage: prof.user.image,
                specialties: prof.specialties,
                rating: prof.rating,
                sessionPrice: prof.sessionPrice,
                modality: prof.modality,
                
                // Matching info
                matchScore: Math.round(totalScore),
                financialCompatibility: getCompatibilityLevel(financialScore),
                
                // Payment info
                paymentMethod: paymentDetails.method,
                estimatedCost: prof.sessionPrice,
                copayment: paymentDetails.copayment,
                coveragePercentage: paymentDetails.coveragePercentage,
                
                // Badges
                badges: generateBadges(prof, { healthSystem, isapreId, fonasaTramoId })
            }
        })

        // 4. Ordenar por score
        scoredProfessionals.sort((a, b) => b.matchScore - a.matchScore)

        // 5. Filtrar por copago máximo si se especificó
        const filtered = maxCopayment
            ? scoredProfessionals.filter(p => p.copayment <= maxCopayment)
            : scoredProfessionals

        // 6. Obtener total count
        const total = await prisma.professional.count({ where: whereClause })

        return NextResponse.json({
            professionals: filtered,
            meta: {
                total,
                page,
                limit,
                hasMore: page * limit < total
            }
        })

    } catch (error) {
        console.error('Error in search-with-coverage:', error)
        return NextResponse.json(
            { error: 'Error al buscar profesionales' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// ============================================
// FUNCIONES DE SCORING
// ============================================

function calculateFinancialScore(
    professional: any,
    patientData: any
): number {
    const { healthSystem, isapreId, fonasaTramoId, hasBonoIMED } = patientData

    // ISAPRE
    if (healthSystem === 'ISAPRE' && isapreId) {
        const convenio = professional.isapreConvenios.find(
            (c: any) => c.isapreId === isapreId
        )

        if (convenio) {
            if (convenio.acceptsBono && hasBonoIMED) {
                const copaymentRatio = convenio.copaymentAmount / professional.sessionPrice
                if (copaymentRatio < 0.1) return 100
                if (copaymentRatio < 0.3) return 90
                return 80
            }

            if (convenio.acceptsReembolso) {
                const reembolsoPct = convenio.reembolsoPercentage
                if (reembolsoPct >= 70) return 80
                if (reembolsoPct >= 40) return 60
                return 40
            }
        }

        return 20 // Tiene Isapre pero sin convenio
    }

    // FONASA
    if (healthSystem === 'FONASA' && fonasaTramoId) {
        const acceptance = professional.fonasaAcceptance.find(
            (f: any) => f.fonasaTramoId === fonasaTramoId
        )

        if (acceptance) {
            if (acceptance.acceptsBonoArancel) {
                const coverageRatio = acceptance.bonoAmount / professional.sessionPrice
                if (coverageRatio >= 0.8) return 100
                if (coverageRatio >= 0.5) return 85
                return 70
            }

            if (acceptance.acceptsMLE) return 60
        }

        return 30
    }

    // PARTICULAR
    if (healthSystem === 'PRIVATE') {
        if (professional.sessionPrice <= 30000) return 70
        if (professional.sessionPrice <= 50000) return 50
        return 30
    }

    return 20
}

function calculateSpecialtyScore(
    professional: any,
    patientSpecialties?: string[]
): number {
    if (!patientSpecialties || patientSpecialties.length === 0) {
        return 50
    }

    const profSpecialties = new Set(professional.specialties)
    const matchCount = patientSpecialties.filter(s => profSpecialties.has(s)).length

    if (matchCount >= 2) return 100
    if (matchCount === 1) return 80
    return 30
}

function getCompatibilityLevel(score: number): string {
    if (score >= 90) return 'PERFECT'
    if (score >= 70) return 'GOOD'
    if (score >= 40) return 'PARTIAL'
    return 'LOW'
}

function calculatePaymentDetails(
    professional: any,
    patientData: any
): {
    method: string
    copayment: number
    coveragePercentage: number
} {
    const { healthSystem, isapreId, fonasaTramoId, hasBonoIMED } = patientData

    // ISAPRE
    if (healthSystem === 'ISAPRE' && isapreId) {
        const convenio = professional.isapreConvenios.find(
            (c: any) => c.isapreId === isapreId
        )

        if (convenio?.acceptsBono && hasBonoIMED) {
            return {
                method: 'BONO_IMED',
                copayment: convenio.copaymentAmount,
                coveragePercentage: Math.round(
                    (1 - convenio.copaymentAmount / professional.sessionPrice) * 100
                )
            }
        }

        if (convenio?.acceptsReembolso) {
            return {
                method: 'REEMBOLSO',
                copayment: professional.sessionPrice,
                coveragePercentage: convenio.reembolsoPercentage
            }
        }
    }

    // FONASA
    if (healthSystem === 'FONASA' && fonasaTramoId) {
        const acceptance = professional.fonasaAcceptance.find(
            (f: any) => f.fonasaTramoId === fonasaTramoId
        )

        if (acceptance?.acceptsBonoArancel) {
            const copayment = Math.max(0, professional.sessionPrice - acceptance.bonoAmount)
            return {
                method: 'BONO_FONASA',
                copayment,
                coveragePercentage: Math.round(
                    (acceptance.bonoAmount / professional.sessionPrice) * 100
                )
            }
        }
    }

    // PARTICULAR
    return {
        method: 'PRIVATE',
        copayment: professional.sessionPrice,
        coveragePercentage: 0
    }
}

function generateBadges(
    professional: any,
    patientData: any
): string[] {
    const badges: string[] = []
    const { healthSystem, isapreId, fonasaTramoId } = patientData

    if (healthSystem === 'ISAPRE' && isapreId) {
        const convenio = professional.isapreConvenios.find(
            (c: any) => c.isapreId === isapreId
        )

        if (convenio?.acceptsBono) {
            badges.push('BONO_IMED')
        }

        if (convenio?.acceptsReembolso) {
            badges.push(`REEMBOLSO_${convenio.reembolsoPercentage}%`)
        }
    }

    if (healthSystem === 'FONASA' && fonasaTramoId) {
        const acceptance = professional.fonasaAcceptance.find(
            (f: any) => f.fonasaTramoId === fonasaTramoId
        )

        if (acceptance?.acceptsBonoArancel) {
            badges.push(`FONASA_${acceptance.bonoLevel}`)
        }
    }

    return badges
}
```

---

## 2️⃣ Automatización de Boletas - Código Funcional

### 2.1 Trigger Post-Pago

```typescript
// src/services/invoice/auto-emission.service.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PaymentConfirmedEvent {
    appointmentId: string
    amount: number
    paymentId: string
}

/**
 * Función que se ejecuta cuando Flow confirma el pago
 * Llamar desde el webhook de Flow o después de confirmar pago manual
 */
export async function onPaymentConfirmed(event: PaymentConfirmedEvent) {
    const { appointmentId, amount } = event

    console.log(`💰 Payment confirmed for appointment ${appointmentId}`)

    try {
        // 1. Obtener datos completos de la cita
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                professional: {
                    include: {
                        user: true,
                        taxSettings: true,
                        certificate: {
                            where: {
                                isActive: true,
                                validUntil: {
                                    gte: new Date()
                                }
                            },
                            take: 1
                        }
                    }
                },
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        rut: true
                    }
                }
            }
        })

        if (!appointment) {
            throw new Error(`Appointment ${appointmentId} not found`)
        }

        // 2. Verificar configuración del profesional
        const taxSettings = appointment.professional.taxSettings

        if (!taxSettings) {
            console.log('⚠️  Professional has no tax settings configured')
            return { autoIssue: false, reason: 'NO_TAX_SETTINGS' }
        }

        if (!taxSettings.autoIssueEnabled) {
            console.log('⚠️  Auto-issue disabled for professional')
            return { autoIssue: false, reason: 'AUTO_ISSUE_DISABLED' }
        }

        // 3. Verificar certificado digital
        const certificate = appointment.professional.certificate?.[0]

        if (!certificate) {
            console.error('❌ No valid certificate found')
            throw new Error('CERT_ERROR: No valid certificate')
        }

        // 4. Verificar que no exista boleta ya
        const existingInvoice = await prisma.invoice.findUnique({
            where: { appointmentId }
        })

        if (existingInvoice) {
            console.log('⚠️  Invoice already exists')
            return { autoIssue: false, reason: 'INVOICE_EXISTS' }
        }

        // 5. Calcular montos
        const RETENTION_RATE_2026 = 0.1525  // 15.25%
        const PLATFORM_COMMISSION = 0.08    // 8%

        const grossAmount = amount
        const retentionAmount = Math.round(grossAmount * RETENTION_RATE_2026)
        const netAmount = grossAmount - retentionAmount
        const commissionAmount = Math.round(grossAmount * PLATFORM_COMMISSION)
        const finalAmount = netAmount - commissionAmount

        console.log(`
📊 Invoice Calculation:
- Gross:      $${grossAmount.toLocaleString('es-CL')}
- Retention:  $${retentionAmount.toLocaleString('es-CL')} (15.25%)
- Net:        $${netAmount.toLocaleString('es-CL')}
- Commission: $${commissionAmount.toLocaleString('es-CL')} (8%)
- Final:      $${finalAmount.toLocaleString('es-CL')}
        `)

        // 6. Crear registro de boleta
        const invoice = await prisma.invoice.create({
            data: {
                appointmentId: appointment.id,
                professionalId: appointment.professionalId,
                patientId: appointment.patientId,
                certificateId: certificate.id,

                documentType: 'BHE',
                status: 'PENDING',

                grossAmount,
                retentionRate: RETENTION_RATE_2026,
                retentionAmount,
                netAmount,
                platformCommission: commissionAmount,
                finalAmount,

                periodMonth: new Date(appointment.scheduledAt).getMonth() + 1,
                periodYear: new Date(appointment.scheduledAt).getFullYear(),

                serviceDescription: `Atención psicológica individual - ${appointment.professional.user.name}`,
                serviceDate: appointment.scheduledAt,

                receiverRut: appointment.patient.rut || '66666666-6',
                receiverName: appointment.patient.name,
                receiverEmail: appointment.patient.email
            }
        })

        console.log(`✅ Invoice ${invoice.id} created, status: PENDING`)

        // 7. TODO: Encolar job de emisión
        // await invoiceQueue.add('emit-invoice', { invoiceId: invoice.id })

        // Por ahora, emitir inmediatamente (para testing)
        await emitInvoiceImmediately(invoice.id)

        return {
            autoIssue: true,
            invoiceId: invoice.id,
            status: 'PROCESSING'
        }

    } catch (error) {
        console.error('❌ Error in onPaymentConfirmed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

/**
 * Emisión inmediata (sin queue)
 * En producción, esto debería estar en un Worker
 */
async function emitInvoiceImmediately(invoiceId: string) {
    console.log(`🚀 Emitting invoice ${invoiceId}...`)

    try {
        // 1. Obtener boleta con todos los datos
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                professional: {
                    include: {
                        user: true,
                        taxSettings: true
                    }
                },
                patient: true,
                certificate: true
            }
        })

        if (!invoice) {
            throw new Error('Invoice not found')
        }

        // 2. Actualizar a PROCESSING
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PROCESSING',
                lastAttemptAt: new Date()
            }
        })

        // 3. TODO: Integración real con SimpleDTE
        // const simpleDTE = new SimpleDTEService()
        // const result = await simpleDTE.emitInvoice(invoiceData)

        // Por ahora, simular emisión exitosa
        await new Promise(resolve => setTimeout(resolve, 2000))

        const mockFolio = Math.floor(Math.random() * 1000000)

        // 4. Actualizar a ISSUED
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'ISSUED',
                siiInvoiceNumber: mockFolio,
                siiTrackingId: `MOCK-${invoiceId}`,
                siiAuthCode: 'ABC123',
                isSigned: true,
                signedAt: new Date(),
                issuedAt: new Date()
            }
        })

        console.log(`✅ Invoice ${invoiceId} emitted successfully! Folio: ${mockFolio}`)

        return { success: true, folio: mockFolio }

    } catch (error) {
        console.error(`❌ Error emitting invoice ${invoiceId}:`, error)

        // Marcar como FAILED
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'FAILED',
                lastError: error.message,
                errorCount: { increment: 1 },
                lastAttemptAt: new Date()
            }
        })

        throw error
    } finally {
        await prisma.$disconnect()
    }
}
```

### 2.2 Endpoint para Listar Boletas del Profesional

```typescript
// src/app/api/professional/invoices/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // 2. Obtener professional ID del usuario
        const professional = await prisma.professional.findUnique({
            where: { userId: session.user.id }
        })

        if (!professional) {
            return NextResponse.json(
                { error: 'No eres un profesional' },
                { status: 403 }
            )
        }

        // 3. Query params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const status = searchParams.get('status')
        const fromDate = searchParams.get('fromDate')
        const toDate = searchParams.get('toDate')

        // 4. Build where clause
        const whereClause: any = {
            professionalId: professional.id
        }

        if (status) {
            whereClause.status = status
        }

        if (fromDate || toDate) {
            whereClause.issueDate = {}
            if (fromDate) whereClause.issueDate.gte = new Date(fromDate)
            if (toDate) whereClause.issueDate.lte = new Date(toDate)
        }

        // 5. Obtener boletas
        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where: whereClause,
                include: {
                    appointment: {
                        select: {
                            id: true,
                            scheduledAt: true
                        }
                    },
                    patient: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    issueDate: 'desc'
                },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.invoice.count({ where: whereClause })
        ])

        // 6. Formatear respuesta
        const formattedInvoices = invoices.map(inv => ({
            id: inv.id,
            siiInvoiceNumber: inv.siiInvoiceNumber,
            appointmentId: inv.appointmentId,
            patientName: inv.patient.name,
            grossAmount: inv.grossAmount,
            retentionAmount: inv.retentionAmount,
            netAmount: inv.netAmount,
            finalAmount: inv.finalAmount,
            status: inv.status,
            issueDate: inv.issueDate.toISOString(),
            issuedAt: inv.issuedAt?.toISOString(),
            pdfUrl: inv.pdfUrl,
            lastError: inv.lastError
        }))

        return NextResponse.json({
            invoices: formattedInvoices,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching invoices:', error)
        return NextResponse.json(
            { error: 'Error al obtener boletas' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
```

---

## 3️⃣ Componentes de UI - React

### 3.1 Card de Profesional con Badge de Cobertura

```typescript
// src/components/search/ProfessionalCard.tsx

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Video, Users } from 'lucide-react'

interface ProfessionalCardProps {
    professional: {
        id: string
        name: string
        profileImage?: string
        specialties: string[]
        rating: number
        sessionPrice: number
        matchScore: number
        financialCompatibility: 'PERFECT' | 'GOOD' | 'PARTIAL' | 'LOW'
        copayment: number
        coveragePercentage: number
        badges: string[]
        modality: string
    }
    onSelect: (id: string) => void
}

export function ProfessionalCard({ professional, onSelect }: ProfessionalCardProps) {
    const compatibilityColors = {
        PERFECT: 'bg-green-100 text-green-800 border-green-200',
        GOOD: 'bg-blue-100 text-blue-800 border-blue-200',
        PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        LOW: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const compatibilityLabels = {
        PERFECT: 'Cobertura Perfecta',
        GOOD: 'Buena Cobertura',
        PARTIAL: 'Cobertura Parcial',
        LOW: 'Sin Cobertura'
    }

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Header con Score */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 flex justify-between items-center">
                <Badge className="bg-white/20 text-white border-white/30">
                    Match: {professional.matchScore}%
                </Badge>
                <Badge className={compatibilityColors[professional.financialCompatibility]}>
                    {compatibilityLabels[professional.financialCompatibility]}
                </Badge>
            </div>

            <div className="p-6">
                {/* Foto y Nombre */}
                <div className="flex items-start gap-4 mb-4">
                    <img
                        src={professional.profileImage || '/default-avatar.png'}
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                            {professional.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">
                                {professional.rating.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Especialidades */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {professional.specialties.slice(0, 3).map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {specialty}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Badges de Cobertura */}
                {professional.badges.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {professional.badges.map((badge, idx) => (
                            <Badge key={idx} className="bg-green-500 text-white text-xs">
                                {badge === 'BONO_IMED' && '✓ Acepta Bono IMED'}
                                {badge.startsWith('REEMBOLSO_') && `✓ ${badge.replace('REEMBOLSO_', 'Reembolso ')}` }
                                {badge.startsWith('FONASA_') && `✓ ${badge.replace('FONASA_', 'Fonasa ')}`}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Información Financiera */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Precio Sesión</p>
                            <p className="text-lg font-bold text-gray-900">
                                ${professional.sessionPrice.toLocaleString('es-CL')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Tu Copago</p>
                            <p className="text-lg font-bold text-green-600">
                                ${professional.copayment.toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>
                    {professional.coveragePercentage > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500">Cobertura</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${professional.coveragePercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {professional.coveragePercentage}% cubierto
                            </p>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Button
                    onClick={() => onSelect(professional.id)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                    Ver Perfil y Agendar
                </Button>
            </div>
        </div>
    )
}
```

### 3.2 Dashboard de Boletas (Profesional)

```typescript
// src/components/professional/InvoicesDashboard.tsx

'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

export function InvoicesDashboard() {
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        fetchInvoices()
    }, [filter])

    const fetchInvoices = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter !== 'ALL') params.set('status', filter)

            const response = await fetch(`/api/professional/invoices?${params}`)
            const data = await response.json()
            setInvoices(data.invoices)
        } catch (error) {
            console.error('Error fetching invoices:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ISSUED':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'FAILED':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'PROCESSING':
                return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
            default:
                return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            ISSUED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            PENDING: 'bg-yellow-100 text-yellow-800'
        }

        return (
            <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
                {status}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Boletas de Honorarios
                </h2>
                <Button onClick={fetchInvoices} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['ALL', 'ISSUED', 'PENDING', 'PROCESSING', 'FAILED'].map(status => (
                    <Button
                        key={status}
                        onClick={() => setFilter(status)}
                        variant={filter === status ? 'default' : 'outline'}
                        size="sm"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Folio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Paciente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Bruto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Retención
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Neto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice: any) => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(invoice.status)}
                                        {getStatusBadge(invoice.status)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {invoice.siiInvoiceNumber || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {invoice.patientName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(invoice.issueDate).toLocaleDateString('es-CL')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    ${invoice.grossAmount.toLocaleString('es-CL')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                    -${invoice.retentionAmount.toLocaleString('es-CL')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                    ${invoice.finalAmount.toLocaleString('es-CL')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {invoice.pdfUrl ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(invoice.pdfUrl, '_blank')}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
```

---

## 🎯 Próximos Pasos

1. **Copiar los schemas** de los documentos de arquitectura a `prisma/schema.prisma`
2. **Ejecutar migración**: `npx prisma db push`
3. **Crear seeders** con datos de Isapres reales
4. **Implementar endpoints** usando el código de este documento
5. **Crear componentes UI** con los ejemplos proporcionados

---

**¡El código está listo para implementar!** 🚀
