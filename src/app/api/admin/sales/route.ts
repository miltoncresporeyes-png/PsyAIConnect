import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface SaleItem {
    id: string
    date: Date
    professionalName: string
    patientName: string
    amount: number
    discount: number
    total: number
    status: string
    invoiceNumber: string | null
    siiFolio: string | null
    errorMessage: string | null
    attempts: number
    maxAttempts: number
    createdAt: Date
    completedAt: Date | null
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Solo administradores pueden acceder' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const status = searchParams.get('status')

        const where: any = {}

        if (startDate || endDate) {
            where.servicioFecha = {}
            if (startDate) where.servicioFecha.gte = new Date(startDate)
            if (endDate) where.servicioFecha.lte = new Date(endDate)
        }

        if (status) {
            if (status === 'failed') {
                where.status = { in: ['FAILED', 'MANUAL_REVIEW'] }
            } else {
                where.status = status.toUpperCase()
            }
        }

        const sales = await prisma.invoiceQueue.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        })

        const transformedSales: SaleItem[] = sales.map((item: any) => ({
            id: item.id,
            date: item.servicioFecha,
            professionalName: item.professionalNombre,
            patientName: item.pacienteNombre,
            amount: item.servicioMonto,
            discount: item.descuento,
            total: item.servicioMonto - item.descuento,
            status: item.status,
            invoiceNumber: item.invoiceNumber,
            siiFolio: item.siiFolio,
            errorMessage: item.errorMessage,
            attempts: item.attempts,
            maxAttempts: item.maxAttempts,
            createdAt: item.createdAt,
            completedAt: item.completedAt,
        }))

        const totals = {
            total: transformedSales.length,
            completed: transformedSales.filter(s => s.status === 'COMPLETED').length,
            pending: transformedSales.filter(s => s.status === 'PENDING').length,
            failed: transformedSales.filter(s => s.status === 'FAILED' || s.status === 'MANUAL_REVIEW').length,
            processing: transformedSales.filter(s => s.status === 'PROCESSING').length,
            totalAmount: transformedSales.reduce((sum, s) => sum + s.total, 0),
            completedAmount: transformedSales
                .filter(s => s.status === 'COMPLETED')
                .reduce((sum, s) => sum + s.total, 0),
        }

        const uniqueProfs = Array.from(new Set(sales.map((s: any) => s.professionalNombre)))
        const professionals = uniqueProfs.map(name => ({ name }))

        return NextResponse.json({
            sales: transformedSales,
            totals,
            professionals,
        })
    } catch (error) {
        console.error('Admin sales error:', error)
        return NextResponse.json(
            { error: 'Error al obtener ventas' },
            { status: 500 }
        )
    }
}
