import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/metadata'

export const metadata: Metadata = {
    title: 'Emitir boleta electrónica',
    ...NO_INDEX,
}

export default function EmitirBoletaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}