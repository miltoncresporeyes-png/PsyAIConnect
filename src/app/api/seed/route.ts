import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkRateLimit, createRateLimitHeaders, getClientIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// Test password for all users
const TEST_PASSWORD = 'Test1234!'

// Test users configuration
const TEST_USERS = [
    {
        email: 'paciente@test.com',
        name: 'Ana García (Paciente)',
        role: 'PATIENT' as const,
        phone: '+56912345678',
    },
    {
        email: 'profesional@test.com',
        name: 'Dr. Carlos Mendoza',
        role: 'PROFESSIONAL' as const,
        phone: '+56987654321',
        professionalData: {
            professionalType: 'PSYCHOLOGIST' as const,
            slug: 'dr-carlos-mendoza',
            bio: 'Psicólogo clínico con más de 10 años de experiencia en terapia cognitivo-conductual. Especializado en ansiedad, depresión y manejo del estrés.',
            specialties: ['Ansiedad', 'Depresión', 'Estrés', 'Terapia de pareja'],
            modality: 'BOTH' as const,
            sessionPrice: 45000,
            sessionDuration: 50,
            verificationStatus: 'VERIFIED' as const,
            isActive: true,
            isPublic: true,
            subscriptionTier: 'PRO' as const,
        },
    },
    {
        email: 'admin@test.com',
        name: 'María Admin',
        role: 'ADMIN' as const,
        phone: '+56900000000',
    },
]

/**
 * GET /api/seed - Create test users (development only)
 */
export async function GET(request: Request) {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Seed not allowed in production' },
            { status: 403 }
        )
    }

    const seedApiKey = process.env.SEED_API_KEY
    const providedSeedKey = request.headers.get('x-seed-key')
    if (!seedApiKey) {
        return NextResponse.json(
            { error: 'SEED_API_KEY no configurada. No se permite ejecutar seed.' },
            { status: 403 }
        )
    }

    if (!providedSeedKey || providedSeedKey !== seedApiKey) {
        return NextResponse.json(
            { error: 'x-seed-key invalida o ausente' },
            { status: 403 }
        )
    }

    const clientIp = getClientIp(request)
    const seedLimit = checkRateLimit(`seed:run:${clientIp}`, {
        limit: 5,
        windowMs: 60 * 60 * 1000,
    })

    if (!seedLimit.allowed) {
        return NextResponse.json(
            { error: 'Demasiadas ejecuciones de seed. Intenta nuevamente mas tarde.' },
            { status: 429, headers: createRateLimitHeaders(seedLimit) }
        )
    }

    try {
        const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12)
        const results: string[] = []

        for (const userData of TEST_USERS) {
            const { professionalData, ...userInfo } = userData as typeof userData & {
                professionalData?: typeof TEST_USERS[1]['professionalData']
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userInfo.email },
            })

            if (existingUser) {
                results.push(`⏭️ ${userInfo.email} already exists`)
                continue
            }

            // Create user
            const user = await prisma.user.create({
                data: {
                    ...userInfo,
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            })

            results.push(`✅ Created ${userInfo.role}: ${userInfo.email}`)

            // If professional, create professional profile
            if (userInfo.role === 'PROFESSIONAL' && professionalData) {
                await prisma.professional.create({
                    data: {
                        userId: user.id,
                        ...professionalData,
                        verifiedAt: new Date(),
                    },
                })
                results.push(`   └─ Created professional profile`)

                // Create availability
                const weekdays = [1, 2, 3, 4, 5]
                for (const day of weekdays) {
                    await prisma.availability.create({
                        data: {
                            professionalId: (await prisma.professional.findFirst({
                                where: { userId: user.id }
                            }))!.id,
                            dayOfWeek: day,
                            startTime: '09:00',
                            endTime: '18:00',
                            isActive: true,
                        },
                    })
                }
                results.push(`   └─ Created availability (Mon-Fri 9:00-18:00)`)
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Seed completed',
            results,
            credentials: {
                password: TEST_PASSWORD,
                users: [
                    { role: 'Paciente', email: 'paciente@test.com' },
                    { role: 'Profesional', email: 'profesional@test.com' },
                    { role: 'Admin', email: 'admin@test.com' },
                ],
            },
        })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json(
            {
                error: 'Seed failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
