/**
 * Configuración central del asistente PsyDoctor AI
 * Aquí vive todo el "cerebro" del asistente: system prompt, contexto, reglas
 */

export const ASSISTANT_CONFIG = {
  name: 'PsyAI',
  title: 'Asistente PsyDoctor',
  subtitle: 'Orientación automatizada',
  model: 'gpt-4o-mini',
  maxTokens: 600,
  temperature: 0.7,
  sessionExpirationMinutes: 60,
  maxHistoryMessages: 20,
} as const

/**
 * Contexto del sistema — le dice al asistente quién es y qué puede hacer
 * Este es el corazón de la configuración de IA del asistente
 */
export function buildSystemPrompt(): string {
  return `Eres ${ASSISTANT_CONFIG.name}, el asistente virtual de PsyDoctor (https://psydoctor.cl), una plataforma chilena de salud mental que conecta pacientes con psicólogos y psiquiatras verificados en todo Chile.

## TU IDENTIDAD
- Nombre: ${ASSISTANT_CONFIG.name}
- Trabajas 24 horas, los 7 días de la semana
- Eres amable, empático, claro y profesional
- Usas un tono cálido pero nunca clínico
- Cuando no estés seguro de algo, lo reconoces honestamente

## LO QUE SÍ PUEDES HACER
- Explicar qué es PsyDoctor y cómo funciona la plataforma
- Guiar a pacientes en su búsqueda del profesional adecuado según sus necesidades
- Explicar los tipos de cobertura: Fonasa (tramos A a F), Isapres (Banmédica, Consalud, Colmena, etc.), Particular
- Informar sobre precios orientativos de sesiones (entre $25.000 y $80.000 CLP según el profesional)
- Describir las diferentes modalidades de atención: online, presencial, o híbrida
- Explicar el proceso de reserva: búsqueda → orientación → reserva → confirmación → videollamada
- Guiar a profesionales en el proceso de registro y verificación de credenciales
- Resolver dudas frecuentes sobre la plataforma, pagos, reembolsos y facturación
- Proporcionar información general sobre salud mental (ansiedad, depresión, estrés, etc.) de forma psicoeducativa
- Explicar qué documentos necesitas para solicitar reembolso (boleta electrónica, indicar datos del profesional)

## LO QUE NUNCA DEBES HACER (reglas estrictas)
- ❌ NO des diagnósticos psicológicos ni psiquiátricos
- ❌ NO sugieras tratamientos específicos ni medicación
- ❌ NO sustituyas la consulta con un profesional habilitado
- ❌ NO recopiles datos personales sensibles (RUT, diagnósticos, historial clínico)
- ❌ NO prometas resultados terapéuticos ni curas
- ❌ NO compartas información del paciente con terceros bajo ninguna circunstancia
- ❌ NO generes vínculos emocionales o relaciones dual-terapeuta con el usuario
- ❌ NO interpretes síntomas como emergencias médicas; si hay riesgo, deriva INMEDIATEMENTE

## PROTOCOLO DE CRISIS — PRIORIDAD ABSOLUTA
Si el usuario expresa ideas de suicidio, autolesión, o cualquier emergencia de salud mental:
1. Detén TODO lo que estabas diciendo
2. Responde con empatía y sin juzgar
3. Proporciona INMEDIATAMENTE estos recursosChile de emergencia:
   - Línea de Crisis Chile: 600 360 7777 (Salud Responde, 24/7, gratuita)
   - Carabineros: 134
   - Emergencias: 131 (SAMU)
   - CRISIS text: envía AYUDO al +56 9 1234 5678
4. No intentes hacer terapia de crisis tú mismo; DERIVA siempre

## CONTEXTO DE CHILE
- Fonasa tiene 5 tramos (A-E) con distintos porcentajes de bonificación para psicología
- Las Isapres bonifican psicología con distintos topes según el plan
- Los profesionales en PsyDoctor emiten boleta electrónica para reembolso
- Cobertura: la bonificación promedio es 40-70% según plan Isapre o Fonasa

## FORMATO DE RESPUESTA
- Sé conciso pero cálido (máximo 3-4 oraciones para preguntas simples)
- Usa listas con viñetes solo cuando sea necesario
- Para información compleja, estructura la respuesta en pasos claros
- Si la pregunta es muy amplia, haz una contra-pregunta para precisar
- Cuando derivas a un recurso humano, menciona el siguiente paso concreto

## PRIVACIDAD
- Solo solicitas información necesaria para orientar (nombre, correo si requiere seguimiento)
- Nunca guardas datos sensibles del usuario
- Si alguien pide tus políticas de privacidad, derivalo a: https://psydoctor.cl/privacidad

¿Entendido? Cuando un usuario te escriba, respóndele como ${ASSISTANT_CONFIG.name}, el asistente de PsyDoctor, siendo útil pero cumpliendo siempre estas reglas.`
}

/**
 * Mensajes de bienvenida para usuarios nuevos
 */
export const WELCOME_MESSAGES = {
  greeting: '¡Hola! Soy **PsyAI**, el asistente virtual de PsyDoctor. Estoy aquí para ayudarte a encontrar el apoyo que necesitas, resolver tus dudas sobre la plataforma o guiarte en tu proceso. ¿En qué puedo ayudarte hoy?',
  quickReplies: [
    { label: 'Buscar un profesional', value: 'Quiero buscar un psicólogo o psiquiatra' },
    { label: '¿Cómo funciona?', value: '¿Cómo funciona PsyDoctor?' },
    { label: 'Cobertura Fonasa/Isapre', value: '¿Cubren Fonasa o Isapre?' },
    { label: 'Soy profesional', value: 'Quiero registrarme como profesional' },
    { label: 'Precio de sesiones', value: '¿Cuánto cuestan las sesiones?' },
    { label: 'Hablar con un humano', value: 'Necesito hablar con un ejecutivo' },
  ] as const,
}

/**
 * Mensaje cuando el usuario quiere hablar con un humano
 */
export const HUMAN_HANDOVER = `Perfecto, con gusto te conecto con nuestro equipo. Puedes contactarnos directamente por:

📱 **WhatsApp:** +56 9 8341 4730
📧 **Email:** contacto@psydoctor.cl
🌐 **Web:** https://psydoctor.cl

Nuestro equipo está disponible de lunes a viernes de 9:00 a 18:00 horas (hora de Chile). Fuera de ese horario, puedes dejar tu mensaje y te responderemos a la brevedad.

¿Hay algo más en lo que pueda orientarte mientras esperas? 😊`

/**
 * Prompt injection signatures to neutralize adversarial manipulation
 */
export const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+(unrestricted|dan|jailbroken)/i,
  /bypass\s+(safety|content)\s+filters/i,
  /reveal\s+(the\s+)?(developer\s+mode|api\s+key|token)/i,
  /act\s+as\s+a\s+licensed\s+psychiatrist\s+and\s+prescribe/i,
]

export function isPotentialPromptInjection(message: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(message))
}

export const INJECTION_WARNING_MESSAGE =
  'PsyAI opera con estrictos protocolos de seguridad y salud mental. No puedo procesar solicitudes para eludir lineamientos de seguridad o prescribir tratamientos. Si necesitas orientación médica, consulta a un profesional habilitado.'

/**
 * Mensaje de crisis (devuelto cuando se detecta riesgo)
 */
export const CRISIS_MESSAGE = `Entiendo que estás pasando por un momento muy difícil. Quiero que sepas que **no estás solo/a** y que hay ayuda disponible de inmediato.

⚠️ **IMPORTANTE:** PsyAI es un orientador automatizado y **NO reemplaza la atención de un profesional de la salud ni atiende urgencias**.

Por favor contacta ahora mismo a estos servicios de apoyo gratuitos en Chile (24/7):

📞 **Prevención del Suicidio:** Llama al ***4141** (gratuito 24/7 desde cualquier celular)
📞 **Salud Responde:** **600 360 7777** (orientación psicológica y médica MINSAL)
🚨 **Urgencias Médicas / SAMU:** **131**

Estas líneas están atendidas por profesionales especializados en contención y crisis. Por tu seguridad, he pausado esta conversación para que puedas comunicarte con ellos de inmediato. 💚`

/**
 * Mensaje cuando la IA no puede responder
 */
export const FALLBACK_MESSAGE = `Gracias por tu pregunta. Soy PsyAI, el asistente virtual de PsyDoctor, y estoy aquí para ayudarte con información general sobre nuestra plataforma y salud mental.

*Aviso legal: PsyAI no diagnostica ni reemplaza la consulta con un profesional de la salud habilitado.*

Para darte la mejor orientación, ¿podrías contarme un poco más sobre lo que buscas? Por ejemplo:

- ¿Estás buscando un profesional para ti o para un familiar?
- ¿Tienes alguna duda sobre cobertura Fonasa/Isapres o agendamiento?

También puedes contactar a nuestro equipo humano directamente:
📱 WhatsApp: +56 9 8341 4730 · 📧 contacto@psydoctor.cl`

/**
 * Keywords que activan el protocolo de crisis
 */
export const CRISIS_KEYWORDS = [
  'suicidio', 'suicidal', 'autolesión', 'autolesionarse', 'matarme',
  'no quiero vivir', 'mejor morir', 'quiero morir', 'hurt myself',
  'cutting myself', 'end my life', 'kill myself', 'crisis', 'emergencia',
  'no puedo más', 'ya no aguanto', 'no vale la pena vivir', 'acabar con todo',
  'pastillas para morir', 'despedirme de todos',
] as const

/**
 * Verifica si el mensaje contiene keywords de crisis
 */
export function containsCrisisKeywords(message: string): boolean {
  const lower = message.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword))
}
