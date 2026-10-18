/**
 * Configuración editable para la Landing de Lista de Espera de PsyAI Connect
 * Todos los valores parametrizados deben configurarse aquí.
 * Si un valor permanece en "PENDIENTE", la interfaz mostrará un aviso visible
 * EXCLUSIVAMENTE en entorno de desarrollo.
 */

export interface LandingConfig {
    cupoFundadores: string
    beneficioFundadores: string
    beneficioPrimeraSesion: string
    plazoRespuestaProfesionales: string
    whatsappContacto: string
    urlInstagram: string
    urlLinkedin: string
    emailContacto: string
    versionConsentimiento: string
}

export const landingConfig: LandingConfig = {
    // Cupos y beneficios para los primeros profesionales registrados
    cupoFundadores: 'PENDIENTE',
    beneficioFundadores: 'PENDIENTE',

    // Beneficio para pacientes en lista de espera
    beneficioPrimeraSesion: 'PENDIENTE',

    // SLA de respuesta y contacto directo
    plazoRespuestaProfesionales: 'PENDIENTE',
    whatsappContacto: 'PENDIENTE',
    urlInstagram: 'PENDIENTE',
    urlLinkedin: 'PENDIENTE',
    emailContacto: 'PENDIENTE',

    // Versión legal de términos y política de privacidad para registro
    versionConsentimiento: 'v1.0-waitlist-2026',
}

/**
 * Helper para verificar valores pendientes (solo activo en desarrollo)
 */
export function getPendingConfigKeys(): (keyof LandingConfig)[] {
    return (Object.keys(landingConfig) as (keyof LandingConfig)[]).filter(
        (key) => landingConfig[key] === 'PENDIENTE'
    )
}
