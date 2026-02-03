'use client'

import { Phone } from 'lucide-react'

export function CrisisBanner() {
    return (
        <div className="crisis-banner">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <Phone className="w-4 h-4" />
                <span>
                    <strong>¿Emergencia?</strong> Llama al{' '}
                    <a href="tel:6003607777" className="font-bold">
                        600 360 7777
                    </a>{' '}
                    (Salud Responde, 24/7) o{' '}
                    <a href="tel:131" className="font-bold">
                        131
                    </a>{' '}
                    (Ambulancia)
                </span>
            </div>
        </div>
    )
}
