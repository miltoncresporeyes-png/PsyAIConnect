import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header, Footer } from '@/components/layout'
import { formatPrice } from '@/lib/utils'
import { MapPin, Clock, DollarSign, Shield, Calendar, Linkedin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BackToDashboard } from '@/components/ui/BackToDashboard'

interface Props {
    params: { slug: string }
}

const professionalTypeLabels: Record<string, string> = {
    PSYCHOLOGIST: 'Psicólogo/a',
    PSYCHIATRIST: 'Psiquiatra',
    CLINICAL_PSYCHOLOGIST: 'Psicólogo/a Clínico',
    THERAPIST: 'Terapeuta',
    COUNSELOR: 'Consejero/a',
    OTHER: 'Profesional',
}

const modalityLabels: Record<string, string> = {
    ONLINE: 'Solo online',
    IN_PERSON: 'Solo presencial',
    BOTH: 'Online y presencial',
}

export default async function ProfessionalProfilePage({ params }: Props) {
    const professional = await prisma.professional.findUnique({
        where: {
            slug: params.slug,
            isPublic: true,
            isActive: true,
        },
        select: {
            id: true,
            userId: true,
            professionalType: true,
            licenseNumber: true,
            bio: true,
            slug: true,
            specialties: true,
            modality: true,
            sessionPrice: true,
            sessionDuration: true,
            verificationStatus: true,
            linkedinUrl: true,
            profileImageUrl: true,
            // UX Redesign fields
            targetAudience: true,
            approachDescription: true,
            yearsExperience: true,
            firstSessionInfo: true,
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    })

    if (!professional) {
        notFound()
    }

    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === professional.userId

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container-wide">
                    {isOwner && (
                        <div className="max-w-4xl mx-auto">
                            <BackToDashboard />
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Profile Header */}
                            <div className="card p-8">
                                <div className="flex items-start gap-6">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                        {professional.profileImageUrl ? (
                                            <Image
                                                src={professional.profileImageUrl}
                                                alt={professional.user.name || 'Profesional'}
                                                width={96}
                                                height={96}
                                                className="object-cover"
                                            />
                                        ) : professional.user.image ? (
                                            <Image
                                                src={professional.user.image}
                                                alt={professional.user.name || 'Profesional'}
                                                width={96}
                                                height={96}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-primary-600">
                                                {professional.user.name?.charAt(0) || 'P'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h1 className="text-2xl font-heading font-bold text-gray-900">
                                                {professional.user.name}
                                            </h1>
                                            {professional.verificationStatus === 'VERIFIED' && (
                                                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    <span>Identidad y título verificados</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-lg text-primary-600 font-medium">
                                            {professionalTypeLabels[professional.professionalType]}
                                        </p>
                                        {professional.yearsExperience && (
                                            <p className="text-sm text-gray-500 mb-3">
                                                +{professional.yearsExperience} años de experiencia
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {modalityLabels[professional.modality]}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {professional.sessionDuration} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                {formatPrice(professional.sessionPrice)}
                                            </span>
                                            {professional.linkedinUrl && (
                                                <a
                                                    href={professional.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                                                >
                                                    <Linkedin className="w-4 h-4" />
                                                    LinkedIn
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Para quién es útil - Human-centered UX */}
                            {professional.targetAudience && (
                                <div className="card p-8">
                                    <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                                        Para quién suele ser útil
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed border-l-2 border-primary-200 pl-4 italic">
                                        {professional.targetAudience}
                                    </p>
                                </div>
                            )}

                            {/* Cómo acompaña - Human-centered UX */}
                            {professional.approachDescription && (
                                <div className="card p-8">
                                    <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                                        Cómo acompaña
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {professional.approachDescription}
                                    </p>
                                </div>
                            )}

                            {/* Bio */}
                            <div className="card p-8">
                                <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                                    Acerca de mí
                                </h2>
                                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                                    {professional.bio}
                                </p>
                            </div>

                            {/* Specialties */}
                            <div className="card p-8">
                                <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                                    Áreas de trabajo
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {professional.specialties.map((specialty) => (
                                        <span
                                            key={specialty}
                                            className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Book Appointment */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-24">
                                <div className="text-center mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Valor por sesión</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatPrice(professional.sessionPrice)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {professional.sessionDuration} minutos
                                    </p>
                                </div>

                                <Link
                                    href={`/reservar/${professional.slug}`}
                                    className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Agendar sesión
                                </Link>

                                {/* Primera sesión info */}
                                {professional.firstSessionInfo && (
                                    <p className="text-sm text-primary-600 text-center font-medium mb-2">
                                        {professional.firstSessionInfo}
                                    </p>
                                )}

                                <p className="text-xs text-gray-500 text-center">
                                    Sin compromiso. Puedes cancelar hasta 24h antes.
                                </p>

                                {/* Trust badges */}
                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span>Pagos seguros con Flow.cl</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span>Recordatorios automáticos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}

// Generate static params for known professionals
export async function generateStaticParams() {
    const professionals = await prisma.professional.findMany({
        where: { isPublic: true },
        select: { slug: true },
    })

    return professionals.map((p) => ({
        slug: p.slug,
    }))
}
