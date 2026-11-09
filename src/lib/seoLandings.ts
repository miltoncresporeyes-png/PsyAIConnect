/**
 * Contenido de las landings SEO orientadas a pacientes.
 *
 * - /psicologo-online/[especialidad]  -> búsqueda por motivo de consulta
 * - /psicologo-con/[prevision]        -> búsqueda por Fonasa / Isapre
 *
 * Reglas de contenido: sin cifras de cobertura, plazos ni promesas clínicas que
 * no podamos respaldar. Lo que depende del plan o del profesional se dice así.
 */

export const SITE_URL = 'https://psydoctor.cl'

export interface FaqItem {
    q: string
    a: string
}

export interface SpecialtyLanding {
    slug: string
    name: string
    /** Texto corto para títulos: "Psicólogo online para {short}" */
    short: string
    metaDescription: string
    intro: string
    signs: string[]
    approach: string[]
    faq: FaqItem[]
}

export interface PrevisionLanding {
    slug: string
    name: string
    kind: 'fonasa' | 'isapre'
    metaDescription: string
    intro: string
    steps: string[]
    documents: string[]
    faq: FaqItem[]
}

export const SPECIALTY_LANDINGS: SpecialtyLanding[] = [
    {
        slug: 'ansiedad',
        name: 'Ansiedad',
        short: 'ansiedad',
        metaDescription:
            'Encuentra psicólogos online en Chile para tratar la ansiedad. Profesionales inscritos en el Registro de la Superintendencia de Salud, con boleta para reembolso.',
        intro:
            'La ansiedad es una de las razones más frecuentes por las que las personas consultan a un psicólogo. En PsyDoctor puedes encontrar profesionales inscritos en el Registro de Prestadores de la Superintendencia de Salud y atenderte por videollamada desde tu casa.',
        signs: [
            'Preocupación constante que cuesta controlar',
            'Tensión muscular, inquietud o sensación de estar siempre alerta',
            'Dificultad para dormir o concentrarse',
            'Evitar situaciones por miedo a sentirte mal',
        ],
        approach: [
            'Evaluación inicial para entender qué la desencadena y cómo te afecta',
            'Enfoques de uso habitual, como la terapia cognitivo-conductual, según el criterio de cada profesional',
            'Herramientas prácticas para manejar los síntomas entre sesiones',
        ],
        faq: [
            {
                q: '¿Cuántas sesiones necesito para tratar la ansiedad?',
                a: 'Depende de cada persona y de cada caso. El profesional lo conversará contigo después de la evaluación inicial.',
            },
            {
                q: '¿Puedo atenderme online por ansiedad?',
                a: 'Sí. Muchos profesionales atienden por videollamada. Puedes filtrar por modalidad al buscar.',
            },
            {
                q: '¿Necesito un psiquiatra o un psicólogo?',
                a: 'El psicólogo realiza psicoterapia. Si se requiere evaluar medicación, el psiquiatra es quien la indica. Puedes buscar ambos en PsyDoctor.',
            },
        ],
    },
    {
        slug: 'depresion',
        name: 'Depresión',
        short: 'depresión',
        metaDescription:
            'Psicólogos online en Chile para acompañar la depresión. Profesionales verificados, atención por videollamada y boleta para reembolso Isapre.',
        intro:
            'Sentirte sin energía o sin interés por casi todo durante semanas es una razón válida para pedir ayuda profesional. Aquí puedes buscar psicólogos y psiquiatras inscritos en el registro oficial y reservar una primera sesión.',
        signs: [
            'Tristeza o vacío que no mejora con los días',
            'Pérdida de interés en actividades que antes disfrutabas',
            'Cambios en el sueño o en el apetito',
            'Cansancio constante y dificultad para concentrarte',
        ],
        approach: [
            'Una primera conversación para conocer tu situación y tus objetivos',
            'Psicoterapia con el enfoque que el profesional considere adecuado para ti',
            'Coordinación con psiquiatría cuando corresponda',
        ],
        faq: [
            {
                q: '¿Puedo pedir ayuda si no sé si es depresión?',
                a: 'Sí. No necesitas un diagnóstico previo. El profesional te ayudará a evaluar lo que estás viviendo.',
            },
            {
                q: '¿La terapia online sirve para la depresión?',
                a: 'Muchas personas la usan con buenos resultados, pero la decisión depende del caso. Tu profesional te orientará sobre la modalidad.',
            },
            {
                q: '¿Qué hago si estoy en crisis?',
                a: 'Si estás en riesgo, llama a Salud Responde al 600 360 7777 o a la línea de prevención del suicidio *4141, o acude a urgencias.',
            },
        ],
    },
    {
        slug: 'terapia-de-pareja',
        name: 'Terapia de pareja',
        short: 'terapia de pareja',
        metaDescription:
            'Terapia de pareja online en Chile con profesionales inscritos en la Superintendencia de Salud. Reserva en línea y recibe boleta para reembolso.',
        intro:
            'Atravesar conflictos, cambios o distancia en la pareja es común. La terapia de pareja ofrece un espacio ordenado para conversar con acompañamiento profesional, presencial u online.',
        signs: [
            'Discusiones repetitivas que no se resuelven',
            'Dificultad para comunicarse o sentirse escuchado',
            'Distancia emocional o pérdida de confianza',
            'Decisiones importantes que no logran tomar juntos',
        ],
        approach: [
            'Sesiones conjuntas, y a veces individuales, según el caso',
            'Trabajo en comunicación y acuerdos concretos',
            'Un marco de respeto donde ambas personas puedan expresarse',
        ],
        faq: [
            {
                q: '¿Deben asistir ambos a las sesiones?',
                a: 'Lo habitual es que sí, pero cada profesional define el formato. Si solo una persona quiere asistir, también puede consultar por terapia individual.',
            },
            {
                q: '¿Se puede hacer por videollamada?',
                a: 'Sí, y puedes conectarte desde lugares distintos si es necesario.',
            },
            {
                q: '¿La terapia de pareja tiene reembolso Isapre?',
                a: 'Depende del plan y de la prestación. Consulta con tu Isapre antes de agendar.',
            },
        ],
    },
    {
        slug: 'duelo',
        name: 'Duelo',
        short: 'duelo',
        metaDescription:
            'Acompañamiento psicológico online en Chile para procesos de duelo. Profesionales verificados y atención por videollamada.',
        intro:
            'Perder a alguien, o atravesar un cambio importante, puede sentirse abrumador. Un profesional de salud mental puede acompañarte a transitar ese proceso a tu ritmo.',
        signs: [
            'Tristeza intensa o sensación de irrealidad tras una pérdida',
            'Dificultad para retomar rutinas',
            'Culpa, enojo o preguntas sin respuesta',
            'Aislamiento de las personas cercanas',
        ],
        approach: [
            'Un espacio seguro para hablar de la pérdida',
            'Herramientas para sostener el día a día mientras elaboras el duelo',
            'Respeto por tus tiempos y tu forma de vivirlo',
        ],
        faq: [
            {
                q: '¿Cuánto dura un duelo?',
                a: 'No hay un plazo único. Cada persona lo vive distinto, y pedir ayuda no depende de cuánto tiempo haya pasado.',
            },
            {
                q: '¿Es normal sentirme así?',
                a: 'Muchas reacciones son esperables tras una pérdida. Si te cuesta funcionar, conversarlo con un profesional puede ayudarte.',
            },
            {
                q: '¿Puedo atenderme desde otra ciudad?',
                a: 'Sí, si el profesional atiende online. Puedes filtrar por modalidad al buscar.',
            },
        ],
    },
    {
        slug: 'estres-laboral',
        name: 'Estrés laboral',
        short: 'estrés laboral',
        metaDescription:
            'Psicólogos online en Chile para estrés laboral y agotamiento. Reserva en línea con profesionales verificados y boleta para reembolso.',
        intro:
            'El estrés sostenido en el trabajo puede afectar el sueño, el ánimo y las relaciones. Hablar con un psicólogo ayuda a ordenar lo que ocurre y a definir qué cambios son posibles.',
        signs: [
            'Agotamiento físico y mental al terminar la jornada',
            'Irritabilidad o desmotivación frente al trabajo',
            'Dificultad para desconectarte fuera del horario laboral',
            'Problemas de sueño o dolores frecuentes sin causa médica clara',
        ],
        approach: [
            'Identificar las fuentes de estrés y los límites que puedes poner',
            'Estrategias de regulación y organización del tiempo',
            'Apoyo en la toma de decisiones sobre tu situación laboral',
        ],
        faq: [
            {
                q: '¿La terapia online sirve si tengo poco tiempo?',
                a: 'La modalidad online ahorra traslados y facilita encontrar un horario compatible con tu jornada.',
            },
            {
                q: '¿Puedo pedir licencia médica?',
                a: 'La licencia médica la emite un médico habilitado para ello. El psicólogo no la emite. Un psiquiatra o médico puede evaluar tu caso.',
            },
            {
                q: '¿Lo que converso es confidencial?',
                a: 'Sí. La información clínica está protegida por la Ley N° 20.584 sobre derechos de los pacientes.',
            },
        ],
    },
]

const COMMON_PREVISION_DOCS = [
    'Boleta de honorarios o boleta de prestación de servicios emitida por el profesional',
    'Certificado de atención o asistencia, si tu Isapre lo solicita',
    'Orden médica o derivación, solo si tu plan la exige',
]

export const PREVISION_LANDINGS: PrevisionLanding[] = [
    {
        slug: 'fonasa',
        name: 'Fonasa',
        kind: 'fonasa',
        metaDescription:
            'Cómo atenderte con un psicólogo si eres Fonasa: modalidad de libre elección, bono y profesionales que aceptan Fonasa en PsyDoctor.',
        intro:
            'Si eres afiliado a Fonasa, puedes atenderte con profesionales que están inscritos en la Modalidad de Libre Elección. En PsyDoctor puedes filtrar la búsqueda para ver quién acepta Fonasa y en qué tramo.',
        steps: [
            'Busca profesionales y filtra por cobertura Fonasa.',
            'Revisa en el perfil si el profesional acepta Fonasa y qué copago aplica.',
            'Consulta en Fonasa los requisitos del bono antes de tu sesión.',
            'Reserva tu hora y atiéndete por videollamada o de forma presencial.',
        ],
        documents: [
            'Bono de atención, cuando corresponda según tu tramo y el profesional',
            'Orden médica, si tu situación lo requiere',
        ],
        faq: [
            {
                q: '¿Todos los psicólogos aceptan Fonasa?',
                a: 'No. Depende de si el profesional está inscrito en la Modalidad de Libre Elección. Por eso conviene filtrar por cobertura.',
            },
            {
                q: '¿Cuánto pagaría con Fonasa?',
                a: 'Depende de tu tramo y del arancel de la prestación. El perfil de cada profesional muestra la información disponible.',
            },
            {
                q: '¿Puedo pedir reembolso a Fonasa después de la sesión?',
                a: 'En general el bono se gestiona antes de la atención. Confirma el procedimiento vigente directamente con Fonasa.',
            },
        ],
    },
    ...[
        { slug: 'colmena', name: 'Isapre Colmena' },
        { slug: 'banmedica', name: 'Isapre Banmédica' },
        { slug: 'consalud', name: 'Isapre Consalud' },
        { slug: 'cruz-blanca', name: 'Isapre Cruz Blanca' },
        { slug: 'vida-tres', name: 'Isapre Vida Tres' },
    ].map(
        ({ slug, name }): PrevisionLanding => ({
            slug,
            name,
            kind: 'isapre',
            metaDescription: `Atiéndete con un psicólogo online si estás en ${name}. Qué documentos necesitas para pedir reembolso y cómo buscar profesionales con boleta en PsyDoctor.`,
            intro: `Si estás afiliado a ${name}, puedes atenderte con un psicólogo particular y solicitar reembolso según tu plan de salud. En PsyDoctor los profesionales emiten boleta para que puedas presentarla a tu Isapre.`,
            steps: [
                'Revisa en tu plan de salud si cubre psicoterapia y con qué tope.',
                'Busca un profesional inscrito en el Registro de la Superintendencia de Salud.',
                'Reserva y paga tu sesión. Recibirás la boleta correspondiente.',
                `Presenta la boleta y los documentos que pida ${name} por su canal oficial.`,
            ],
            documents: COMMON_PREVISION_DOCS,
            faq: [
                {
                    q: `¿${name} reembolsa la terapia psicológica?`,
                    a: 'Depende de tu plan y de la prestación. Revisa tu contrato o consulta directamente a tu Isapre antes de agendar.',
                },
                {
                    q: '¿Qué porcentaje me devuelven?',
                    a: 'Varía según el plan, el tope anual y la prestación. PsyDoctor no puede asegurar un monto específico.',
                },
                {
                    q: '¿Dónde presento la boleta?',
                    a: 'Por los canales oficiales de tu Isapre, como su sitio web, su aplicación o sus sucursales.',
                },
            ],
        }),
    ),
]

export function getSpecialty(slug: string): SpecialtyLanding | undefined {
    return SPECIALTY_LANDINGS.find((s) => s.slug === slug)
}

export function getPrevision(slug: string): PrevisionLanding | undefined {
    return PREVISION_LANDINGS.find((p) => p.slug === slug)
}
