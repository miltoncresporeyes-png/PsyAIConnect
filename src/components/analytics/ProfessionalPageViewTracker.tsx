'use client'

import { useEffect } from 'react'
import { analyticsEvents } from '@/lib/analytics'

interface PageViewTrackerProps {
    pageName: string
}

export function ProfessionalPageViewTracker({ pageName }: PageViewTrackerProps) {
    useEffect(() => {
        analyticsEvents.professionalLandingView(pageName)
    }, [pageName])

    return null
}

