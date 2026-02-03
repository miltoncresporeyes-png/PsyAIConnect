'use client'

import { ShieldCheck } from 'lucide-react'

export function SafetyMicroCopy() {
    return (
        <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck className="w-3 h-3" />
                <span>Tu información es privada y está bajo tu control</span>
            </div>
            <p className="text-[10px] text-gray-400">
                PsyConnect no comparte tus datos sensibles sin tu consentimiento explícito.
            </p>
        </div>
    )
}
