import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/metadata'

export const metadata: Metadata = {
    title: 'Mi Panel',
    ...NO_INDEX,
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}