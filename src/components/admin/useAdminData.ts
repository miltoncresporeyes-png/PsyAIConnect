'use client'

import { useCallback, useEffect, useState } from 'react'

/** Carga JSON de una API de administracion y permite recargar. Cancela respuestas obsoletas al cambiar la URL. */
export function useAdminData<T>(url: string | null) {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(Boolean(url))
    const [tick, setTick] = useState(0)

    useEffect(() => {
        if (!url) return
        let active = true
        setLoading(true)
        fetch(url)
            .then(async (res) => {
                const body = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(body.error || `Error ${res.status}`)
                return body as T
            })
            .then((body) => {
                if (!active) return
                setData(body)
                setError('')
            })
            .catch((err) => active && setError(err instanceof Error ? err.message : 'Error al cargar'))
            .finally(() => active && setLoading(false))
        return () => {
            active = false
        }
    }, [url, tick])

    const reload = useCallback(() => setTick((t) => t + 1), [])
    return { data, error, loading, reload }
}
