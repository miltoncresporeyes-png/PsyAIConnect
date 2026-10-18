import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/metadata'

export const metadata: Metadata = {
    title: 'Pago',
    ...NO_INDEX,
}

export default function PagoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}