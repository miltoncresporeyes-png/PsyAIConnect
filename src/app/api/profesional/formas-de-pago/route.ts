import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PAYMENT_NOTES_MAX_LENGTH, normalizePaymentMethods, isPaymentMethodId } from '@/lib/paymentMethods'
import { screenMessage } from '@/lib/chat'

export const dynamic = 'force-dynamic'

async function requireProfessional() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
    }
    const professional = await prisma.professional.findUnique({
        where: { userId: session.user.id },
        select: { id: true, acceptedPaymentMethods: true, paymentNotes: true },
    })
    if (!professional) {
        return { error: NextResponse.json({ error: 'Perfil profesional no encontrado' }, { status: 404 }) }
    }
    return { professional }
}

export async function GET() {
    const { professional, error } = await requireProfessional()
    if (error) return error
    return NextResponse.json({
        methods: normalizePaymentMethods(professional.acceptedPaymentMethods),
        notes: professional.paymentNotes ?? '',
    })
}

const bodySchema = z.object({
    methods: z
        .array(z.string())
        .max(20)
        .refine((list) => list.every(isPaymentMethodId), 'Forma de pago no válida'),
    notes: z.string().trim().max(PAYMENT_NOTES_MAX_LENGTH, `Máximo ${PAYMENT_NOTES_MAX_LENGTH} caracteres`).optional(),
})

export async function PUT(request: Request) {
    const { professional, error } = await requireProfessional()
    if (error) return error

    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const methods = normalizePaymentMethods(parsed.data.methods)
    if (methods.length === 0) {
        return NextResponse.json({ error: 'Selecciona al menos una forma de pago' }, { status: 400 })
    }

    // Las indicaciones son publicas: no admiten datos bancarios ni de contacto
    // (los datos de cuenta se entregan solo a pacientes con cita confirmada).
    const notes = parsed.data.notes?.trim() || null
    if (notes) {
        const screened = screenMessage(notes)
        if (!screened.ok) {
            return NextResponse.json(
                {
                    error:
                        'Las indicaciones son públicas: no incluyas correos, teléfonos, enlaces ni números de cuenta. Los datos de pago los compartes con el paciente una vez confirmada la cita.',
                },
                { status: 400 }
            )
        }
    }

    await prisma.professional.update({
        where: { id: professional.id },
        data: { acceptedPaymentMethods: methods, paymentNotes: notes },
    })
    return NextResponse.json({ success: true, methods, notes: notes ?? '' })
}
