'use client'

import { landingConfig, getPendingConfigKeys } from '@/config/landing.config'
import { AlertTriangle } from 'lucide-react'

export function PendingConfigBanner() {
    // Solo visible en entorno de desarrollo local
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    const pendingKeys = getPendingConfigKeys()
    if (pendingKeys.length === 0) {
        return null
    }

    return (
        <aside
            aria-label="Aviso de configuración en desarrollo"
            className="bg-ambar text-tinta px-4 py-2.5 text-xs font-medium border-b border-amber-600/30 shadow-2xs"
        >
            <div className="container-wide flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-tinta" />
                    <span>
                        <strong>Aviso de Configuración (Solo visible en Dev):</strong> Hay {pendingKeys.length} valor(es) en{' '}
                        <code className="bg-white/40 px-1 py-0.5 rounded font-mono text-[11px]">src/config/landing.config.ts</code> con valor &ldquo;PENDIENTE&rdquo;: {pendingKeys.join(', ')}.
                    </span>
                </div>
            </div>
        </aside>
    )
}
