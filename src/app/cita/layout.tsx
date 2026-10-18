import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/metadata'

export const metadata: Metadata = {
    title: 'Confirmar cita',
    ...NO_INDEX,
}

export default function CitaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}