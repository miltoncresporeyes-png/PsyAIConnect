import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/metadata'

export const metadata: Metadata = {
    title: 'Completar perfil',
    ...NO_INDEX,
}

export default function CompletarPerfilLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}