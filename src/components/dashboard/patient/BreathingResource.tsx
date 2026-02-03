'use client'

import { Heart } from 'lucide-react'

export function BreathingResource() {
    return (
        <div className="bg-secondary-900 rounded-xl p-4 text-white shadow-sm">
            <div className="flex items-start gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-300 mt-0.5" />
                <h3 className="text-sm font-medium">Un respiro para hoy</h3>
            </div>
            <p className="text-xs text-secondary-100 mb-3 leading-relaxed">
                Si este momento se siente pesado, puedes pausar aquí un instante.
            </p>
            <button className="text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors w-full text-center">
                Tomar una pausa
            </button>
        </div>
    )
}
