import Link from 'next/link'
import { MapPin, Shield, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

interface Props {
    limit?: number
}

const TYPE_LABELS: Record<string, string> = {
    PSYCHOLOGIST: 'Psicólogo/a',
    PSYCHIATRIST: 'Psiquiatra',
    CLINICAL_PSYCHOLOGIST: 'Psicólogo/a Clínico',
    THERAPIST: 'Terapeuta',
    COUNSELOR: 'Consejero/a',
    OTHER: 'Profesional',
}

/**
 * Directorio server-rendered de profesionales públicos.
 *
 * Cumple dos funciones: da contenido indexable real a la home (en vez de sólo
 * datos mock en cliente) y enlaza internamente las páginas /profesional/[slug],
 * que de otro modo sólo serían alcanzables vía sitemap.
 */
export async function ProfessionalDirectory({ limit = 12 }: Props) {
    let professionals: Awaited<
        ReturnType<
            typeof prisma.professional.findMany<{
                select: {
                    slug: true
                    professionalType: true
                    specialties: true
                    comuna: true
                    region: true
                    sessionPrice: true
                    verificationStatus: true
                    profileImageUrl: true
                    user: { select: { name: true; image: true } }
                }
            }>
        >
    > = []

    try {
        professionals = await prisma.professional.findMany({
            where: { isPublic: true, isActive: true },
            select: {
                slug: true,
                professionalType: true,
                specialties: true,
                comuna: true,
                region: true,
                sessionPrice: true,
                verificationStatus: true,
                profileImageUrl: true,
                user: { select: { name: true, image: true } },
            },
            orderBy: { verificationStatus: 'asc' },
            take: limit,
        })
    } catch (error) {
        console.error('[directorio] No se pudieron cargar los perfiles:', error)
        return null
    }

    if (professionals.length === 0) {
        return null
    }

    return (
        <section id="directorio" className="py-12 md:py-16 bg-secondary-50/60">
            <div className="container-wide">
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                        Profesionales en PsyDoctor
                    </h2>
                    <p className="text-lg text-gray-600">
                        Inscritos en el Registro de la Superintendencia de Salud, con especialidad y precio de
                        sesión visible antes de agendar.
                    </p>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
                    {professionals.map((professional) => {
                        const typeLabel =
                            TYPE_LABELS[professional.professionalType] ?? 'Profesional'
                        const location =
                            professional.comuna ??
                            professional.region ??
                            'Chile'
                        const specialties = professional.specialties.slice(0, 3)

                        return (
                            <li key={professional.slug}>
                                <Link
                                    href={`/profesional/${professional.slug}`}
                                    className="card p-5 flex flex-col h-full hover:border-primary-300"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center font-bold text-primary-700 flex-shrink-0 overflow-hidden">
                                            {professional.profileImageUrl ||
                                            professional.user.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={
                                                        professional.profileImageUrl ??
                                                        professional.user.image ??
                                                        ''
                                                    }
                                                    alt=""
                                                    width={48}
                                                    height={48}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                (professional.user.name?.charAt(0) ?? 'P').toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {professional.user.name}
                                            </h3>
                                            <p className="text-sm text-primary-700">{typeLabel}</p>
                                        </div>
                                    </div>

                                    <ul className="flex flex-wrap gap-1.5 mb-3" role="list">
                                        {specialties.map((specialty) => (
                                            <li
                                                key={specialty}
                                                className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs"
                                            >
                                                {specialty}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto flex items-center justify-between text-sm text-gray-600">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                            {location}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatPrice(professional.sessionPrice)}
                                        </span>
                                    </div>

                                    {professional.verificationStatus === 'VERIFIED' && (
                                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-green-700">
                                            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                                            Inscrito en el Registro
                                        </p>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                <div className="text-center mt-8">
                    <Link
                        href="/buscar"
                        className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:underline"
                    >
                        Ver todos los profesionales
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    )
}