import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PatientSeoLanding } from '@/components/landing/PatientSeoLanding'
import { PREVISION_LANDINGS, SITE_URL, SPECIALTY_LANDINGS, getPrevision } from '@/lib/seoLandings'

export const dynamicParams = false

export function generateStaticParams() {
    return PREVISION_LANDINGS.map((p) => ({ prevision: p.slug }))
}

function titleFor(name: string, kind: 'fonasa' | 'isapre') {
    return kind === 'fonasa'
        ? `Psicólogo con ${name} en Chile | PsyDoctor`
        : `Psicólogo con reembolso ${name} | PsyDoctor`
}

export function generateMetadata({ params }: { params: { prevision: string } }): Metadata {
    const p = getPrevision(params.prevision)
    if (!p) return {}
    const url = `${SITE_URL}/psicologo-con/${p.slug}`
    const title = titleFor(p.name, p.kind)
    return {
        title: { absolute: title },
        description: p.metaDescription,
        alternates: { canonical: url },
        openGraph: {
            title,
            description: p.metaDescription,
            url,
            siteName: 'PsyDoctor',
            locale: 'es_CL',
            type: 'website',
        },
    }
}

export default function PrevisionPage({ params }: { params: { prevision: string } }) {
    const p = getPrevision(params.prevision)
    if (!p) notFound()

    const h1 =
        p.kind === 'fonasa'
            ? 'Psicólogo con Fonasa: cómo atenderte y qué debes saber'
            : `Psicólogo con reembolso ${p.name}: guía para pacientes`

    return (
        <PatientSeoLanding
            path={`/psicologo-con/${p.slug}`}
            breadcrumbLabel={p.name}
            breadcrumbParent={{ label: 'Buscar por cobertura', href: '/buscar-con-cobertura' }}
            eyebrow="Cobertura de salud"
            h1={h1}
            intro={p.intro}
            blocks={[
                { title: 'Paso a paso', items: p.steps, ordered: true },
                { title: 'Documentos que suelen pedir', items: p.documents },
            ]}
            faq={p.faq}
            primaryCta={{ href: '/buscar-con-cobertura', label: 'Buscar por mi cobertura' }}
            secondaryCta={{ href: '/orientador', label: 'Ayúdame a elegir' }}
            related={[
                ...PREVISION_LANDINGS.filter((o) => o.slug !== p.slug).map((o) => ({
                    href: `/psicologo-con/${o.slug}`,
                    label: `Psicólogo con ${o.name}`,
                })),
                ...SPECIALTY_LANDINGS.slice(0, 2).map((s) => ({
                    href: `/psicologo-online/${s.slug}`,
                    label: `Psicólogo para ${s.short}`,
                })),
            ]}
        />
    )
}
