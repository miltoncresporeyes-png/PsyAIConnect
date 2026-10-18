import type { Metadata } from 'next'

/**
 * Metadata para áreas privadas o transaccionales (login, registro, dashboard,
 * admin, pagos, confirmación de cita). Se combinan con `Metadata` explícita de
 * cada layout/page para marcar la zona como no indexable.
 */
export const NO_INDEX: Partial<Metadata> = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}