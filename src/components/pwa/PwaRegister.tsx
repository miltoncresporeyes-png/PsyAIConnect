'use client'

import { useEffect } from 'react'

/** Registra el service worker solo en producción (en desarrollo interfiere con el HMR). */
export function PwaRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return
        if (!('serviceWorker' in navigator)) return
        navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
            /* sin service worker la app sigue funcionando como web normal */
        })
    }, [])
    return null
}
