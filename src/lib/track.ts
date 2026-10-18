/**
 * Utilidad simple de analítica / medición de eventos de telemetría sin cookies de terceros.
 * Cumple con principios de privacidad por diseño (Privacy by Design).
 */

export type TrackEvent =
    | 'cta_paciente'
    | 'cta_profesional'
    | 'form_paciente_enviado'
    | 'form_profesional_enviado'
    | 'click_whatsapp'

export interface TrackProperties {
    [key: string]: string | number | boolean | undefined | null
}

export function track(evento: TrackEvent, props?: TrackProperties): void {
    if (typeof window === 'undefined') return

    // Registrar en consola de desarrollo para inspección local
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [Telemetry Track]: ${evento}`, props || {})
    }

    // Punto de extensión: Si en el futuro se aprueba un proveedor de analítica cookieless
    // (ej. Plausible, Umami o endpoint interno propio), se despacha aquí sin alterar la UI.
    const customWindow = window as unknown as {
        plausible?: (event: string, options?: { props: TrackProperties }) => void
    }

    if (typeof customWindow.plausible === 'function') {
        customWindow.plausible(evento, { props: props || {} })
    }
}
