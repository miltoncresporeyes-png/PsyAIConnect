import { z } from 'zod'

// Expresión regular para número de teléfono / WhatsApp en Chile (+569... o 9...)
const phoneRegex = /^(\+?56)?(\s?)(0?9)(\s?)[0-9]{8}$/

// Esquema legado para compatibilidad con /api/waitlist preexistente
export const waitlistSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    email: z.string().email('Email inválido'),
    type: z.enum(['patient', 'professional', 'PATIENT', 'PROFESSIONAL']).optional(),
    profession: z.string().optional(),
    source: z.string().optional(),
})

export const waitlistPatientSchema = z.object({
    name: z
        .string({ required_error: 'El nombre es requerido' })
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z
        .string({ required_error: 'El correo electrónico es requerido' })
        .trim()
        .toLowerCase()
        .email('Ingresa un correo electrónico válido')
        .max(150, 'El correo no puede exceder 150 caracteres'),
    whatsapp: z
        .string()
        .trim()
        .regex(phoneRegex, 'Ingresa un número de WhatsApp válido (ej. +56912345678)')
        .optional()
        .or(z.literal('')),
    comuna: z
        .string({ required_error: 'La comuna es requerida' })
        .trim()
        .min(2, 'Selecciona o ingresa una comuna válida')
        .max(80, 'La comuna no puede exceder 80 caracteres'),
    motivoCategoria: z
        .enum(['ANSIEDAD', 'ANIMO', 'PAREJA', 'ESTRES_LABORAL', 'OTRO'], {
            errorMap: (issue) => ({
                message: issue.code === 'invalid_enum_value' ? 'Selecciona una categoría válida' : 'Campo requerido',
            }),
        })
        .optional(),
    prevision: z.enum(['FONASA', 'ISAPRE', 'PARTICULAR'], {
        errorMap: (issue) => ({
            message: issue.code === 'invalid_enum_value' ? 'Previsión no válida' : 'Selecciona tu tipo de previsión de salud',
        }),
    }),
    consentAccepted: z
        .boolean()
        .refine((val) => val === true, 'Debes aceptar los términos y el consentimiento para continuar'),
    consentVersion: z
        .string({ required_error: 'Versión de consentimiento requerida' })
        .min(1),

    // Honeypot anti-bot (debe llegar vacío)
    website: z.string().max(0, 'Bot detected').optional().or(z.literal('')),
    // Timestamp de renderizado del formulario en cliente para evaluar tiempo de llenado
    renderedAt: z.number().optional(),

    // Parámetros de atribución
    utmSource: z.string().max(100).optional().or(z.literal('')),
    utmMedium: z.string().max(100).optional().or(z.literal('')),
    utmCampaign: z.string().max(100).optional().or(z.literal('')),
    referrer: z.string().max(300).optional().or(z.literal('')),
})

export const waitlistProfessionalSchema = z.object({
    name: z
        .string({ required_error: 'El nombre es requerido' })
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z
        .string({ required_error: 'El correo electrónico es requerido' })
        .trim()
        .toLowerCase()
        .email('Ingresa un correo electrónico válido')
        .max(150, 'El correo no puede exceder 150 caracteres'),
    whatsapp: z
        .string({ required_error: 'El número de WhatsApp es requerido' })
        .trim()
        .regex(phoneRegex, 'Ingresa un número de WhatsApp válido (ej. +56912345678)'),
    profesion: z.enum(['PSICOLOGO', 'PSIQUIATRA'], {
        errorMap: (issue) => ({
            message: issue.code === 'invalid_enum_value' ? 'Profesión no válida' : 'Selecciona tu profesión',
        }),
    }),
    registroSuperintendencia: z
        .string({ required_error: 'El número de registro en la Superintendencia de Salud es requerido' })
        .trim()
        .min(3, 'Ingresa un registro válido de la Superintendencia de Salud')
        .max(50, 'El registro no puede exceder 50 caracteres'),
    especialidades: z
        .array(z.string().trim().min(2))
        .min(1, 'Selecciona al menos una especialidad')
        .max(10, 'Máximo 10 especialidades'),
    aniosExperiencia: z
        .number({ required_error: 'Los años de experiencia son requeridos' })
        .int('Debe ser un número entero')
        .min(0, 'No puede ser menor a 0')
        .max(60, 'Valor fuera de rango'),
    ciudad: z
        .string({ required_error: 'La ciudad de residencia o atención es requerida' })
        .trim()
        .min(2, 'Ingresa una ciudad válida')
        .max(80, 'La ciudad no puede exceder 80 caracteres'),
    atiendeOnline: z.boolean({
        required_error: 'Indica si realizas atención online',
    }),
    consentAccepted: z
        .boolean()
        .refine((val) => val === true, 'Debes aceptar los términos y el consentimiento para continuar'),
    consentVersion: z
        .string({ required_error: 'Versión de consentimiento requerida' })
        .min(1),

    // Honeypot anti-bot (debe llegar vacío)
    website: z.string().max(0, 'Bot detected').optional().or(z.literal('')),
    // Timestamp de renderizado del formulario en cliente
    renderedAt: z.number().optional(),

    // Parámetros de atribución
    utmSource: z.string().max(100).optional().or(z.literal('')),
    utmMedium: z.string().max(100).optional().or(z.literal('')),
    utmCampaign: z.string().max(100).optional().or(z.literal('')),
    referrer: z.string().max(300).optional().or(z.literal('')),
})

export type WaitlistPatientInput = z.infer<typeof waitlistPatientSchema>
export type WaitlistProfessionalInput = z.infer<typeof waitlistProfessionalSchema>