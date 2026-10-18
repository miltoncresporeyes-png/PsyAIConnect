import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/metadata'

/**
 * Segunda interfaz de búsqueda con foco en cobertura previsional. Duplica la
 * intención de /buscar, por lo que se canonicaliza hacia /buscar y se marca
 * como no indexable para no repartir señales entre dos URLs.
 */
export const metadata: Metadata = {
    title: 'Buscar profesional con cobertura Fonasa o Isapre',
    description:
        'Encuentra Professionals de salud mental que aceptan Fonasa o Isapre, online o presencial, según tu comuna, especialidad y presupuesto.',
    alternates: { canonical: '/buscar' },
    ...NO_INDEX,
}

export default function BuscarConCoberturaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}