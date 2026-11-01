/**
 * PsyDoctor - Helper de Analítica y Conversiones (GA4)
 * Estrictamente protegido contra envío de PII (Personally Identifiable Information),
 * correos electrónicos o datos clínicos sensibles.
 */

type GAEventParams = Record<string, string | number | boolean | undefined | null>

export function trackEvent(eventName: string, params?: GAEventParams) {
    if (typeof window === 'undefined' || !(window as any).gtag) {
        return
    }

    // Filtrar llaves que pudieran contener PII por error
    const safeParams: GAEventParams = {}
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            const lowerKey = key.toLowerCase()
            if (
                lowerKey.includes('email') ||
                lowerKey.includes('rut') ||
                lowerKey.includes('nombre') ||
                lowerKey.includes('telefono') ||
                lowerKey.includes('diag') ||
                lowerKey.includes('paciente')
            ) {
                continue
            }
            safeParams[key] = value
        }
    }

    ;(window as any).gtag('event', eventName, safeParams)
}

// Eventos comerciales predefinidos
export const analyticsEvents = {
    professionalLandingView: (page: string) =>
        trackEvent('professional_landing_view', { page_location: page }),
    
    founderCtaClick: (source: string) =>
        trackEvent('founder_cta_click', { cta_source: source }),
    
    professionalRegistration: (method: 'form_founder' | 'standard') =>
        trackEvent('professional_registration', { registration_method: method }),
    
    demoRequested: (channel: string) =>
        trackEvent('demo_requested', { request_channel: channel }),
    
    subscriptionStarted: (planName: string) =>
        trackEvent('subscription_started', { plan: planName }),
}

