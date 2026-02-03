'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface Props {
    className?: string
}

export function BackToDashboard({ className = "inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6" }: Props) {
    const router = useRouter()

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault()

        // If the window has an opener (was opened from another tab via target="_blank")
        // we try to close it. If it doesn't work or if there's no opener, we navigate.
        if (typeof window !== 'undefined') {
            const isNewTab = window.opener !== null || window.history.length === 1

            if (isNewTab) {
                window.close()
                // If window.close() didn't work (browser policy), fallback to navigation
                setTimeout(() => {
                    router.push('/dashboard')
                }, 100)
            } else {
                router.push('/dashboard')
            }
        }
    }

    return (
        <button
            onClick={handleBack}
            className={className}
        >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver al dashboard
        </button>
    )
}
