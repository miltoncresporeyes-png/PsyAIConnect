/**
 * Isapre Guides - Guías específicas por aseguradora
 * 
 * Contiene información detallada de cómo solicitar reembolsos
 * en cada Isapre y FONASA
 */

export interface IsapreGuide {
    slug: string
    name: string
    portalUrl: string
    appName: string
    phone: string
    requirements: {
        invoice: boolean
        medicalReferral: 'required' | 'recommended' | 'optional'
        attendanceCertificate: boolean
    }
    coverageRange: string
    responseTime: string
    steps: {
        web?: string[]
        app?: string[]
        inPerson?: string[]
    }
    tips: string[]
    codes?: {
        prestacion: string
        description: string
    }
}

export const ISAPRE_GUIDES: Record<string, IsapreGuide> = {
    'colmena': {
        slug: 'colmena',
        name: 'Isapre Colmena Golden Cross',
        portalUrl: 'https://mi.colmena.cl',
        appName: 'Mi Colmena',
        phone: '600 600 3000',
        requirements: {
            invoice: true,
            medicalReferral: 'recommended',
            attendanceCertificate: true
        },
        coverageRange: '50-70%',
        responseTime: '5-7 días hábiles',
        steps: {
            web: [
                'Ingresa a mi.colmena.cl con tu RUT y clave',
                'Ve a "Reembolsos" → "Nueva Solicitud"',
                'Selecciona Tipo: "Consulta Médica" y Especialidad: "Psicología"',
                'Sube el Kit de Reembolso descargado',
                'Si tienes derivación médica, súbela también',
                'Revisa el monto estimado y confirma la solicitud',
                'Guarda el número de seguimiento'
            ],
            app: [
                'Abre la app "Mi Colmena"',
                'Toca "Reembolsos" en el menú principal',
                'Selecciona "Nueva Solicitud"',
                'Sigue los mismos pasos que en el portal web'
            ],
            inPerson: [
                'Imprime el Kit de Reembolso',
                'Lleva tu cédula de identidad',
                'Acércate a cualquier sucursal Colmena',
                'Entrega los documentos en el mesón de reembolsos'
            ]
        },
        tips: [
            'Guarda el número de solicitud para hacer seguimiento',
            'Puedes verificar el estado en mi.colmena.cl',
            'El reembolso se deposita en tu cuenta bancaria registrada',
            'Acepta solicitudes retroactivas hasta 6 meses'
        ],
        codes: {
            prestacion: '1701',
            description: 'Psicoterapia individual'
        }
    },

    'banmedica': {
        slug: 'banmedica',
        name: 'Isapre Banmédica',
        portalUrl: 'https://portal.banmedica.cl',
        appName: 'Banmédica',
        phone: '600 426 2633',
        requirements: {
            invoice: true,
            medicalReferral: 'required',
            attendanceCertificate: true
        },
        coverageRange: '40-60%',
        responseTime: '7-10 días hábiles',
        steps: {
            web: [
                'Ingresa a portal.banmedica.cl',
                'Ve a "Reembolsos" en el menú',
                'Selecciona "Solicitar Reembolso"',
                'Completa el formulario con tus datos',
                'Sube el Kit de Reembolso',
                'Sube tu orden médica (obligatorio)',
                'Confirma y guarda el comprobante'
            ],
            app: [
                'Abre la app "Banmédica"',
                'Toca "Reembolsos"',
                'Selecciona "Nueva Solicitud"',
                'Adjunta documentos y confirma'
            ],
            inPerson: [
                'Imprime todos los documentos',
                'Lleva tu cédula y orden médica original',
                'Acércate a una sucursal Banmédica',
                'Solicita el formulario de reembolso'
            ]
        },
        tips: [
            'La orden médica es OBLIGATORIA - sin ella rechazan la solicitud',
            'La orden debe especificar el número de sesiones',
            'Puedes hacer seguimiento en el portal web',
            'El pago demora entre 7-10 días hábiles'
        ],
        codes: {
            prestacion: '0401020',
            description: 'Consulta psicológica'
        }
    },

    'consalud': {
        slug: 'consalud',
        name: 'Isapre Consalud',
        portalUrl: 'https://portalpaciente.consalud.cl',
        appName: 'Consalud Móvil',
        phone: '600 360 3600',
        requirements: {
            invoice: true,
            medicalReferral: 'recommended',
            attendanceCertificate: true
        },
        coverageRange: '50-65%',
        responseTime: '5-7 días hábiles',
        steps: {
            web: [
                'Ingresa a portalpaciente.consalud.cl',
                'Ve a "Reembolsos" → "Nueva Solicitud"',
                'Selecciona "Atención Ambulatoria"',
                'Sube el Kit de Reembolso',
                'Agrega tu derivación si la tienes',
                'Confirma la solicitud',
                'Recibirás un email de confirmación'
            ],
            app: [
                'Abre "Consalud Móvil"',
                'Toca "Reembolsos"',
                'Selecciona "Solicitar"',
                'Sube documentos desde tu galería',
                'Confirma'
            ],
            inPerson: [
                'Imprime el Kit de Reembolso',
                'Lleva tu cédula',
                'Acércate a cualquier sucursal',
                'Entrega en el mesón de atención'
            ]
        },
        tips: [
            'Proceso 100% digital muy ágil',
            'Puedes agrupar varias sesiones en una solicitud',
            'Reembolso directo a cuenta bancaria',
            'Notificaciones por email y SMS'
        ]
    },

    'cruz-blanca': {
        slug: 'cruz-blanca',
        name: 'Isapre Cruz Blanca',
        portalUrl: 'https://www.cruzblanca.cl',
        appName: 'Cruz Blanca Móvil',
        phone: '600 390 0000',
        requirements: {
            invoice: true,
            medicalReferral: 'required',
            attendanceCertificate: true
        },
        coverageRange: '45-60%',
        responseTime: '7-10 días hábiles',
        steps: {
            web: [
                'Ingresa a www.cruzblanca.cl',
                'Ve a "Mi Cuenta" → "Reembolsos"',
                'Selecciona "Nueva Solicitud"',
                'Completa el formulario',
                'Sube Kit de Reembolso y orden médica',
                'Confirma la solicitud'
            ],
            app: [
                'Abre "Cruz Blanca Móvil"',
                'Toca "Reembolsos"',
                'Selecciona "Solicitar"',
                'Adjunta documentos',
                'Envía solicitud'
            ],
            inPerson: [
                'Imprime documentos',
                'Lleva cédula y orden médica',
                'Acércate a sucursal',
                'Solicita formulario de reembolso'
            ]
        },
        tips: [
            'La orden médica debe ser de médico general o psiquiatra',
            'Límite de 12 sesiones por año en planes básicos',
            'Puedes consultar cobertura antes de solicitar',
            'Pago por transferencia o vale vista'
        ],
        codes: {
            prestacion: '0401',
            description: 'Atención psicológica'
        }
    },

    'vida-tres': {
        slug: 'vida-tres',
        name: 'Isapre Vida Tres',
        portalUrl: 'https://www.vidatres.cl',
        appName: 'Vida Tres',
        phone: '600 837 3000',
        requirements: {
            invoice: true,
            medicalReferral: 'recommended',
            attendanceCertificate: true
        },
        coverageRange: '50-70%',
        responseTime: '5-7 días hábiles',
        steps: {
            web: [
                'Ingresa a www.vidatres.cl',
                'Ve a "Reembolsos"',
                'Selecciona "Nueva Solicitud"',
                'Sube el Kit de Reembolso',
                'Agrega derivación si la tienes',
                'Confirma'
            ],
            app: [
                'Abre app "Vida Tres"',
                'Toca "Reembolsos"',
                'Selecciona "Solicitar"',
                'Sube documentos',
                'Confirma'
            ],
            inPerson: [
                'Imprime Kit de Reembolso',
                'Lleva cédula',
                'Acércate a sucursal',
                'Entrega documentos'
            ]
        },
        tips: [
            'Proceso simplificado para afiliados antiguos',
            'Acepta certificados digitales',
            'Reembolso express en 48 hrs para planes premium',
            'Notificaciones por WhatsApp disponibles'
        ]
    }
}

export const FONASA_GUIDE: IsapreGuide = {
    slug: 'fonasa',
    name: 'FONASA',
    portalUrl: 'https://www.fonasa.cl',
    appName: 'FONASA Móvil',
    phone: '600 360 3000',
    requirements: {
        invoice: false, // FONASA no usa reembolso retroactivo
        medicalReferral: 'required',
        attendanceCertificate: false
    },
    coverageRange: 'Según tramo',
    responseTime: 'Inmediato (bono previo)',
    steps: {
        web: [
            'IMPORTANTE: FONASA no hace reembolsos retroactivos',
            'Debes solicitar el bono ANTES de la sesión',
            'Ingresa a www.fonasa.cl → Sucursal Virtual',
            'Solicita "Bono de Atención Psicológica"',
            'Presenta el bono al profesional en la sesión',
            'El profesional cobra directamente a FONASA'
        ],
        inPerson: [
            'Acércate a una sucursal FONASA',
            'Lleva tu cédula y orden médica',
            'Solicita bono de atención psicológica',
            'Presenta el bono en tu sesión'
        ]
    },
    tips: [
        'No aplica reembolso retroactivo - debes solicitar bono ANTES',
        'El profesional debe estar inscrito en FONASA',
        'Máximo 3 sesiones por derivación',
        'Tramo A y B: atención gratuita',
        'Tramo C y D: copago según arancel'
    ]
}

/**
 * Obtiene la guía de una Isapre específica
 */
export function getIsapreGuide(slug: string): IsapreGuide | null {
    if (slug === 'fonasa') {
        return FONASA_GUIDE
    }
    return ISAPRE_GUIDES[slug] || null
}

/**
 * Lista todas las guías disponibles
 */
export function getAllGuides(): IsapreGuide[] {
    return [...Object.values(ISAPRE_GUIDES), FONASA_GUIDE]
}
