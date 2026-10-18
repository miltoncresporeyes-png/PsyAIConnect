'use client'

import { ShieldCheck } from 'lucide-react'

export function SafetyMicroCopy() {
    return (
        <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-80 hover:opacity-100 transition-opacity text-center px-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Privacidad y seguridad</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
                Tus datos de salud se tratan con medidas de seguridad y según nuestra Política de Privacidad.
            </p>
        </div>
    )
}
