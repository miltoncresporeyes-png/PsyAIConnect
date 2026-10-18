/**
 * Monthly Reports Page
 * /dashboard/reportes
 */

import { Metadata } from 'next'
import { Header, Footer } from '@/components/layout'
import { PageContainer } from '@/components/layout/shell'
import MonthlyReportViewer from '@/components/dashboard/MonthlyReportViewer'

export const metadata: Metadata = {
    title: { absolute: 'Reportes Mensuales | PsyDoctor' },
    description: 'Reportes financieros y de gestión mensual',
    robots: { index: false, follow: false },
}

export default function ReportesPage() {
    return (
        <>
            <Header />

            <PageContainer variant="dashboard" size="wide">
                <MonthlyReportViewer />
            </PageContainer>

            <Footer />
        </>
    )
}