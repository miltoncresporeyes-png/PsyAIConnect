/**
 * Monthly Report Generation Service
 * 
 * Generates consolidated monthly financial reports for professionals
 * including financial summary, health system breakdown, invoices, and metrics
 */

import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@/generated/client'

const SII_RETENTION_RATE = 0.1525 // 15.25% for 2026
const PLATFORM_COMMISSION_RATE = 0.114 // 11.4% PRO tier

interface MonthlyReportData {
    professionalId: string
    professionalName: string
    period: {
        year: number
        month: number
        monthName: string
    }
    generatedAt: Date

    financialSummary: {
        totalSessions: number
        totalBrut: number
        totalSiiRetention: number
        totalCommission: number
        totalNet: number
        avgSessionPrice: number
        avgNetPerSession: number
    }

    healthSystemBreakdown: {
        isapres: {
            count: number
            brutAmount: number
            netAmount: number
            percentage: number
            details: Array<{
                isapreName: string
                count: number
                amount: number
            }>
        }
        fonasa: {
            count: number
            brutAmount: number
            netAmount: number
            percentage: number
        }
        private: {
            count: number
            brutAmount: number
            netAmount: number
            percentage: number
        }
    }

    invoices: Array<{
        invoiceNumber: string
        date: Date
        patientName: string
        healthSystem: string
        brutAmount: number
        siiRetention: number
        netAmount: number
        status: string
    }>

    metrics: {
        attendance: {
            completed: number
            cancelled: number
            rate: number
        }
        productivity: {
            totalHours: number
            avgIncomePerHour: number
        }
    }
}

/**
 * Generate or retrieve monthly report for a professional
 */
export async function generateMonthlyReport(
    professionalId: string,
    year: number,
    month: number
): Promise<MonthlyReportData> {
    // Check if report already exists
    const existingReport = await prisma.monthlyReport.findUnique({
        where: {
            professionalId_year_month: {
                professionalId,
                year,
                month,
            },
        },
        include: {
            professional: {
                include: {
                    user: true,
                },
            },
            invoices: {
                include: {
                    appointment: {
                        include: {
                            patient: true,
                        },
                    },
                },
                orderBy: {
                    issueDate: 'desc',
                },
            },
        },
    })

    if (existingReport) {
        return formatReportData(existingReport)
    }

    // Generate new report
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Get all completed appointments for the month
    const appointments = await prisma.appointment.findMany({
        where: {
            professionalId,
            scheduledAt: {
                gte: startDate,
                lte: endDate,
            },
            status: {
                in: ['COMPLETED', 'CANCELLED'],
            },
        },
        include: {
            payment: true,
            patient: {
                include: {
                    patientProfile: true,
                },
            },
        },
    })

    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED')
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED')

    // Calculate financial summary
    const totalBrut = completedAppointments.reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0)
    const totalSiiRetention = Math.round(totalBrut * SII_RETENTION_RATE)
    const totalCommission = completedAppointments.reduce((sum, apt) => sum + (apt.payment?.commission || 0), 0)
    const totalNet = totalBrut - totalSiiRetention - totalCommission

    // Calculate health system breakdown
    const isapresAppointments = completedAppointments.filter(a =>
        a.patient?.patientProfile?.healthSystem === 'ISAPRE'
    )
    const fonasaAppointments = completedAppointments.filter(a =>
        a.patient?.patientProfile?.healthSystem === 'FONASA'
    )
    const privateAppointments = completedAppointments.filter(a =>
        a.patient?.patientProfile?.healthSystem === 'PRIVATE' ||
        !a.patient?.patientProfile?.healthSystem
    )

    const isapresBrut = isapresAppointments.reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0)
    const fonasaBrut = fonasaAppointments.reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0)
    const privateBrut = privateAppointments.reduce((sum, apt) => sum + (apt.payment?.amount || 0), 0)

    // Calculate metrics
    const totalHours = completedAppointments.reduce((sum, apt) => sum + apt.duration, 0) / 60
    const avgIncomePerHour = totalHours > 0 ? Math.round(totalNet / totalHours) : 0
    const attendanceRate = appointments.length > 0
        ? (completedAppointments.length / appointments.length) * 100
        : 0

    // Create invoices for completed appointments
    const invoices = await Promise.all(
        completedAppointments.map(async (apt, index) => {
            const invoiceNumber = `BH-${year}${String(month).padStart(2, '0')}${String(index + 1).padStart(4, '0')}`
            const brutAmount = apt.payment?.amount || 0
            const siiRetention = Math.round(brutAmount * SII_RETENTION_RATE)
            const netAmount = brutAmount - siiRetention - (apt.payment?.commission || 0)

            return prisma.invoice.create({
                data: {
                    appointmentId: apt.id,
                    invoiceNumber,
                    issueDate: apt.scheduledAt,
                    brutAmount,
                    siiRetention,
                    netAmount,
                    healthSystem: apt.patient?.patientProfile?.healthSystem || 'PRIVATE',
                    isapre: apt.patient?.patientProfile?.healthSystem === 'ISAPRE'
                        ? 'Isapre' // TODO: Get actual Isapre name from patient coverage
                        : null,
                    status: 'PAID',
                    paidAt: apt.payment?.paidAt,
                },
            })
        })
    )

    // Create monthly report
    const report = await prisma.monthlyReport.create({
        data: {
            professionalId,
            year,
            month,
            totalSessions: completedAppointments.length,
            totalBrut,
            totalSiiRetention,
            totalCommission,
            totalNet,
            isapresCount: isapresAppointments.length,
            isapresBrut,
            fonasaCount: fonasaAppointments.length,
            fonasaBrut,
            privateCount: privateAppointments.length,
            privateBrut,
            completedCount: completedAppointments.length,
            cancelledCount: cancelledAppointments.length,
            attendanceRate,
            avgIncomePerHour,
            invoices: {
                connect: invoices.map(inv => ({ id: inv.id })),
            },
        },
        include: {
            professional: {
                include: {
                    user: true,
                },
            },
            invoices: {
                include: {
                    appointment: {
                        include: {
                            patient: true,
                        },
                    },
                },
                orderBy: {
                    issueDate: 'desc',
                },
            },
        },
    })

    return formatReportData(report)
}

/**
 * Format report data for frontend consumption
 */
function formatReportData(report: any): MonthlyReportData {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    return {
        professionalId: report.professionalId,
        professionalName: report.professional.user.name || 'Profesional',
        period: {
            year: report.year,
            month: report.month,
            monthName: `${monthNames[report.month - 1]} ${report.year}`,
        },
        generatedAt: report.generatedAt,

        financialSummary: {
            totalSessions: report.totalSessions,
            totalBrut: report.totalBrut,
            totalSiiRetention: report.totalSiiRetention,
            totalCommission: report.totalCommission,
            totalNet: report.totalNet,
            avgSessionPrice: report.totalSessions > 0
                ? Math.round(report.totalBrut / report.totalSessions)
                : 0,
            avgNetPerSession: report.totalSessions > 0
                ? Math.round(report.totalNet / report.totalSessions)
                : 0,
        },

        healthSystemBreakdown: {
            isapres: {
                count: report.isapresCount,
                brutAmount: report.isapresBrut,
                netAmount: Math.round(report.isapresBrut * (1 - SII_RETENTION_RATE - PLATFORM_COMMISSION_RATE)),
                percentage: report.totalBrut > 0
                    ? (report.isapresBrut / report.totalBrut) * 100
                    : 0,
                details: [], // TODO: Group by Isapre name
            },
            fonasa: {
                count: report.fonasaCount,
                brutAmount: report.fonasaBrut,
                netAmount: Math.round(report.fonasaBrut * (1 - SII_RETENTION_RATE - PLATFORM_COMMISSION_RATE)),
                percentage: report.totalBrut > 0
                    ? (report.fonasaBrut / report.totalBrut) * 100
                    : 0,
            },
            private: {
                count: report.privateCount,
                brutAmount: report.privateBrut,
                netAmount: Math.round(report.privateBrut * (1 - SII_RETENTION_RATE - PLATFORM_COMMISSION_RATE)),
                percentage: report.totalBrut > 0
                    ? (report.privateBrut / report.totalBrut) * 100
                    : 0,
            },
        },

        invoices: report.invoices.map((inv: any) => ({
            invoiceNumber: inv.invoiceNumber,
            date: inv.issueDate,
            patientName: inv.appointment.patient.name || 'Paciente',
            healthSystem: inv.healthSystem,
            brutAmount: inv.brutAmount,
            siiRetention: inv.siiRetention,
            netAmount: inv.netAmount,
            status: inv.status,
        })),

        metrics: {
            attendance: {
                completed: report.completedCount,
                cancelled: report.cancelledCount,
                rate: report.attendanceRate,
            },
            productivity: {
                totalHours: report.totalSessions > 0
                    ? report.totalSessions * 0.833 // Assuming 50min sessions
                    : 0,
                avgIncomePerHour: report.avgIncomePerHour,
            },
        },
    }
}

/**
 * Get all reports for a professional
 */
export async function getProfessionalReports(professionalId: string) {
    return prisma.monthlyReport.findMany({
        where: { professionalId },
        orderBy: [
            { year: 'desc' },
            { month: 'desc' },
        ],
        take: 12, // Last 12 months
    })
}
