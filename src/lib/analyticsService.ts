import { prisma } from '@/lib/prisma'

export interface FinancialStats {
    totalRevenue: number
    completedSessions: number
    averagePerSession: number
    month: string
    year: number
}

export interface AttendanceMetrics {
    total: number
    completed: number
    cancelled: number
    noShow: number
    attendanceRate: number
    cancellationRate: number
}

export interface DiagnosticCount {
    tag: string
    count: number
    percentage: number
}

export interface TreatmentCount {
    type: string
    count: number
    percentage: number
}

export interface ProfessionalSummary {
    financial: FinancialStats
    attendance: AttendanceMetrics
    diagnostics: DiagnosticCount[]
    treatments: TreatmentCount[]
    period: {
        start: Date
        end: Date
    }
}

class AnalyticsService {
    /**
     * Get date range for current month or specific month
     */
    private getMonthRange(month?: string): { start: Date; end: Date } {
        const now = new Date()
        let year = now.getFullYear()
        let monthNum = now.getMonth()

        if (month) {
            const [y, m] = month.split('-').map(Number)
            if (y) year = y
            if (m) monthNum = m - 1
        }

        const start = new Date(year, monthNum, 1)
        const end = new Date(year, monthNum + 1, 0, 23, 59, 59)

        return { start, end }
    }

    /**
     * get_financial_stats: Suma de monto de citas COMPLETED del mes
     */
    async getFinancialStats(professionalId?: string, month?: string): Promise<FinancialStats> {
        const { start, end } = this.getMonthRange(month)
        const now = new Date()

        // Build where clause
        const where: any = {
            status: 'COMPLETED',
            scheduledAt: {
                gte: start,
                lte: end,
            },
        }

        if (professionalId) {
            where.professionalId = professionalId
        }

        // Get all completed appointments with their professionals to get session prices
        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                professional: {
                    select: {
                        id: true,
                        sessionPrice: true,
                    },
                },
            },
        })

        const completedSessions = appointments.length
        const totalRevenue = appointments.reduce(
            (sum, apt) => sum + (apt.professional?.sessionPrice || 0),
            0
        )

        return {
            totalRevenue,
            completedSessions,
            averagePerSession: completedSessions > 0 ? Math.round(totalRevenue / completedSessions) : 0,
            month: start.toLocaleString('es-CL', { month: 'long' }),
            year: start.getFullYear(),
        }
    }

    /**
     * get_attendance_metrics: Citas COMPLETED vs CANCELLED vs NO_SHOW
     */
    async getAttendanceMetrics(professionalId?: string, month?: string): Promise<AttendanceMetrics> {
        const { start, end } = this.getMonthRange(month)

        const where: any = {
            scheduledAt: {
                gte: start,
                lte: end,
            },
        }

        if (professionalId) {
            where.professionalId = professionalId
        }

        const [completed, cancelled, noShow] = await Promise.all([
            prisma.appointment.count({
                where: { ...where, status: 'COMPLETED' },
            }),
            prisma.appointment.count({
                where: { ...where, status: 'CANCELLED' },
            }),
            prisma.appointment.count({
                where: { ...where, status: 'NO_SHOW' },
            }),
        ])

        const total = completed + cancelled + noShow

        return {
            total,
            completed,
            cancelled,
            noShow,
            attendanceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            cancellationRate: total > 0 ? Math.round(((cancelled + noShow) / total) * 100) : 0,
        }
    }

    /**
     * get_diagnostic_distribution: Frecuencia de diagnostic_tag
     */
    async getDiagnosticDistribution(professionalId?: string, month?: string): Promise<DiagnosticCount[]> {
        const { start, end } = this.getMonthRange(month)

        const where: any = {
            isFinalized: true,
            createdAt: {
                gte: start,
                lte: end,
            },
            diagnosticTag: {
                not: null,
            },
        }

        // Use conditional raw SQL queries based on filter
        const result = await (professionalId
            ? prisma.$queryRaw<{ diagnostic_tag: string; count: bigint }[]>`
                SELECT 
                    "diagnosticTag" as diagnostic_tag,
                    COUNT(*) as count
                FROM "ClinicalNote"
                WHERE "diagnosticTag" IS NOT NULL
                  AND "isFinalized" = true
                  AND "createdAt" >= ${start}
                  AND "createdAt" <= ${end}
                  AND "professionalId" = ${professionalId}
                GROUP BY "diagnosticTag"
                ORDER BY count DESC
                LIMIT 20
              `
            : prisma.$queryRaw<{ diagnostic_tag: string; count: bigint }[]>`
                SELECT 
                    "diagnosticTag" as diagnostic_tag,
                    COUNT(*) as count
                FROM "ClinicalNote"
                WHERE "diagnosticTag" IS NOT NULL
                  AND "isFinalized" = true
                  AND "createdAt" >= ${start}
                  AND "createdAt" <= ${end}
                GROUP BY "diagnosticTag"
                ORDER BY count DESC
                LIMIT 20
              `)

        const totalCount = result.reduce((sum, row) => sum + Number(row.count), 0)

        return result.map((row) => ({
            tag: row.diagnostic_tag || 'Sin etiqueta',
            count: Number(row.count),
            percentage: totalCount > 0 ? Math.round((Number(row.count) / totalCount) * 100) : 0,
        }))
    }

    /**
     * get_treatment_distribution: Frecuencia de treatmentType
     */
    async getTreatmentDistribution(professionalId?: string, month?: string): Promise<TreatmentCount[]> {
        const { start, end } = this.getMonthRange(month)

        const where: any = {
            isFinalized: true,
            createdAt: {
                gte: start,
                lte: end,
            },
            treatmentType: {
                not: null,
            },
        }

        // Use conditional raw SQL queries based on filter
        const result = await (professionalId
            ? prisma.$queryRaw<{ treatment_type: string; count: bigint }[]>`
                SELECT 
                    "treatmentType" as treatment_type,
                    COUNT(*) as count
                FROM "ClinicalNote"
                WHERE "treatmentType" IS NOT NULL
                  AND "isFinalized" = true
                  AND "createdAt" >= ${start}
                  AND "createdAt" <= ${end}
                  AND "professionalId" = ${professionalId}
                GROUP BY "treatmentType"
                ORDER BY count DESC
                LIMIT 20
              `
            : prisma.$queryRaw<{ treatment_type: string; count: bigint }[]>`
                SELECT 
                    "treatmentType" as treatment_type,
                    COUNT(*) as count
                FROM "ClinicalNote"
                WHERE "treatmentType" IS NOT NULL
                  AND "isFinalized" = true
                  AND "createdAt" >= ${start}
                  AND "createdAt" <= ${end}
                GROUP BY "treatmentType"
                ORDER BY count DESC
                LIMIT 20
              `)

        const totalCount = result.reduce((sum, row) => sum + Number(row.count), 0)

        return result.map((row) => ({
            type: row.treatment_type || 'Sin tipo',
            count: Number(row.count),
            percentage: totalCount > 0 ? Math.round((Number(row.count) / totalCount) * 100) : 0,
        }))

    }

    /**
     * get_professional_summary: Resumen completo para un profesional
     */
    async getProfessionalSummary(professionalId?: string, month?: string): Promise<ProfessionalSummary> {
        const { start, end } = this.getMonthRange(month)

        const [financial, attendance, diagnostics, treatments] = await Promise.all([
            this.getFinancialStats(professionalId, month),
            this.getAttendanceMetrics(professionalId, month),
            this.getDiagnosticDistribution(professionalId, month),
            this.getTreatmentDistribution(professionalId, month),
        ])

        return {
            financial,
            attendance,
            diagnostics,
            treatments,
            period: {
                start,
                end,
            },
        }
    }
}

export const analyticsService = new AnalyticsService()
