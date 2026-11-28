'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Botón "Instalar app": solo aparece si el navegador permite instalar y la app no está instalada. */
export function InstallPwaButton({ className = '' }: { className?: string }) {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault()
            setPromptEvent(e as BeforeInstallPromptEvent)
        }
        const onInstalled = () => setPromptEvent(null)
        window.addEventListener('beforeinstallprompt', onPrompt)
        window.addEventListener('appinstalled', onInstalled)
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt)
            window.removeEventListener('appinstalled', onInstalled)
        }
    }, [])

    if (!promptEvent) return null

    return (
        <button
            type="button"
            onClick={async () => {
                await promptEvent.prompt()
                await promptEvent.userChoice
                setPromptEvent(null)
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium ${className}`}
        >
            <Download className="h-4 w-4" aria-hidden /> Instalar app
        </button>
    )
}
