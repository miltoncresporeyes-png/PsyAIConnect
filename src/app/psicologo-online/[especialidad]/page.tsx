import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PatientSeoLanding } from '@/components/landing/PatientSeoLanding'
import { SITE_URL, SPECIALTY_LANDINGS, getSpecialty } from '@/lib/seoLandings'

export const dynamicParams = false

export function generateStaticParams() {
    return SPECIALTY_LANDINGS.map((s) => ({ especialidad: s.slug }))
}

export function generateMetadata({ params }: { params: { especialidad: string } }): Metadata {
    const s = getSpecialty(params.especialidad)
    if (!s) return {}
    const url = `${SITE_URL}/psicologo-online/${s.slug}`
    const title = `Psicólogo online para ${s.short} en Chile | PsyDoctor`
    return {
        title: { absolute: title },
        description: s.metaDescription,
        alternates: { canonical: url },
        openGraph: {
            title,
            description: s.metaDescription,
            url,
            siteName: 'PsyDoctor',
            locale: 'es_CL',
            type: 'website',
        },
    }
}

export default function EspecialidadPage({ params }: { params: { especialidad: string } }) {
    const s = getSpecialty(params.especialidad)
    if (!s) notFound()

    return (
        <PatientSeoLanding
            path={`/psicologo-online/${s.slug}`}
            breadcrumbLabel={s.name}
            breadcrumbParent={{ label: 'Profesionales', href: '/profesionales' }}
            eyebrow="Psicólogos verificados en Chile"
            h1={`Psicólogo online para ${s.short}`}
            intro={s.intro}
            blocks={[
                { title: 'Señales que pueden indicar que es momento de consultar', items: s.signs },
                { title: 'Cómo suele abordarse', items: s.approach },
            ]}
            faq={s.faq}
            primaryCta={{ href: '/orientador', label: 'Encuentra tu profesional ideal' }}
            secondaryCta={{ href: '/buscar', label: 'Ver profesionales disponibles' }}
            related={[
                ...SPECIALTY_LANDINGS.filter((o) => o.slug !== s.slug).map((o) => ({
                    href: `/psicologo-online/${o.slug}`,
                    label: `Psicólogo para ${o.short}`,
                })),
                { href: '/psicologo-con/fonasa', label: 'Psicólogo con Fonasa' },
                { href: '/buscar-con-cobertura', label: 'Buscar por cobertura' },
            ]}
        />
    )
}
