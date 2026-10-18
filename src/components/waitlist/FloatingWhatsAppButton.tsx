'use client'

import { landingConfig } from '@/config/landing.config'
import { track } from '@/lib/track'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsAppButton() {
    // Si no está configurado, ocultar o apuntar a canal de soporte predeterminado
    const phone = landingConfig.whatsappContacto !== 'PENDIENTE'
        ? landingConfig.whatsappContacto.replace(/[^0-9]/g, '')
        : '56983414730'

    const handleClick = () => {
        track('click_whatsapp', { source: 'floating_button' })
    }

    return (
        <aside
            aria-label="Contacto de soporte por WhatsApp"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
        >
            <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent('Hola, me comunico desde la lista de espera de PsyDoctor.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                aria-label="Contactar por WhatsApp con soporte de PsyDoctor"
                className="group flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pino motion-reduce:transform-none"
            >
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                <span className="sr-only">Contactar por WhatsApp</span>
            </a>
        </aside>
    )
}
