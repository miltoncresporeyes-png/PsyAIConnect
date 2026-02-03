/**
 * Monthly Reports Page
 * /dashboard/reportes
 */

import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import MonthlyReportViewer from '@/components/dashboard/MonthlyReportViewer'

export const metadata: Metadata = {
    title: 'Reportes Mensuales | PsyConnect',
    description: 'Reportes financieros y de gestión mensual',
}

export default function ReportesPage() {
    return (
        <>
            <Header />

            <div className="min-h-screen bg-[#F8F9FA] py-8">
                <div className="container-wide max-w-7xl mx-auto px-4">
                    <MonthlyReportViewer />
                </div>
            </div>

            <Footer />
        </>
    )
}
