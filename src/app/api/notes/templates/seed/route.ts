import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_TEMPLATES = [
    {
        name: 'SOAP (Subjetivo-Objetivo-Análisis-Plan)',
        description: 'Modelo clínico estándar para documentación de sesiones',
        content: `S (SUBJETIVO):
- Motivo de consulta:
- Queja principal:
- Evolución actual:
- Estado de ánimo reportado:


O (OBJETIVO):
- Apariencia general:
- Conducta:
- Lenguaje:
- Afecto:
- Pensamiento:
- Percepción:
- Cognición:
- Insight:


A (ANÁLISIS):
- Diagnóstico principal:
- Diagnóstico diferencial:
- Impresión clínica:


P (PLAN):
- Intervenciones realizadas:
- Plan de tratamiento:
- Recomendaciones:
- Próxima sesión:`,
        category: 'soap',
        isGlobal: true,
        sortOrder: 1,
    },
    {
        name: 'GROW (Meta-Realidad-Opciones-Voluntad)',
        description: 'Modelo de coaching y terapia breve orientada a objetivos',
        content: `G (GOAL - METAS):
- ¿Qué quieres lograr hoy?
- ¿Cuál es tu objetivo principal?
- ¿Qué te gustaría que fuera diferente?


R (REALITY - REALIDAD):
- ¿Qué está pasando ahora?
- ¿Qué has intentado?
- ¿Qué obstáculos enfrentas?
- ¿Cómo te ha afectado?


O (OPTIONS - OPCIONES):
- ¿Qué podrías hacer?
- ¿Qué fortalezas tienes?
- ¿Qué recursos disponibles?
- ¿Qué han hecho otros?


W (WILL - VOLUNTAD):
- ¿Qué harás específicamente?
- ¿Cuándo lo harás?
- ¿Qué necesitas?
- Compromiso para la próxima semana:`,
        category: 'grow',
        isGlobal: true,
        sortOrder: 2,
    },
    {
        name: 'Ficha de Ingreso',
        description: 'Plantilla para primera sesión - Recopila antecedentes completos',
        content: `FICHA DE INGRESO

=== DATOS DE IDENTIFICACIÓN ===
- Nombre:
- RUT:
- Fecha de nacimiento:
- Edad:
- Género:
- Estado civil:
- Ocupación:
- Escolaridad:


=== ANTECEDENTES MÓRBIDOS ===
- Psiquiátricos:
- Médicos:
- Quirúrgicos:
- Alergias:
- Medicamentos actuales:


=== ANTECEDENTES FAMILIARES ===
- Grupo familiar actual:
- Dinámica familiar:
- Historia familiar de enfermedades psiquiátricas:
- Relaciones significativas:


=== ANTECEDENTES DE DESARROLLO ===
- Infancia:
- Adolescencia:
- Eventos traumáticos:


=== HISTORIA LABORAL ===
- Ocupación actual:
- Antecedentes laborales:
- Satisfacción laboral:


=== RED DE APOYO ===
- Familia:
- Amigos:
- Recursos comunitarios:


=== MOTIVO DE CONSULTA ===
- Principal:
- Secundario:
- Expectativas:


=== HISTORIA DE LA ENFERMEDAD ===
- Inicio:
- Evolución:
- Tratamientos previos:
- Respuesta a tratamientos:


=== EVALUACIÓN CLÍNICA ===
- Estado mental:
- Funcionamiento actual:


=== PLAN DE TRATAMIENTO ===
- Modalidad recomendada:
- Frecuencia:
- Objetivos terapéuticos:`,
        category: 'intake',
        isGlobal: true,
        sortOrder: 3,
    },
]

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Solo administradores pueden ejecutar esta acción' },
                { status: 403 }
            )
        }

        const created = []

        for (const template of DEFAULT_TEMPLATES) {
            const existing = await prisma.clinicalTemplate.findFirst({
                where: {
                    name: template.name,
                    isGlobal: true,
                },
            })

            if (!existing) {
                const createdTemplate = await prisma.clinicalTemplate.create({
                    data: template,
                })
                created.push(createdTemplate)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Se crearon ${created.length} plantillas`,
            templates: created,
        })
    } catch (error) {
        console.error('Seed templates error:', error)
        return NextResponse.json(
            { error: 'Error al crear plantillas' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const count = await prisma.clinicalTemplate.count({
            where: { isGlobal: true },
        })

        return NextResponse.json({
            globalTemplatesCount: count,
            needsSeeding: count === 0,
        })
    } catch (error) {
        console.error('Check templates error:', error)
        return NextResponse.json(
            { error: 'Error al verificar plantillas' },
            { status: 500 }
        )
    }
}
