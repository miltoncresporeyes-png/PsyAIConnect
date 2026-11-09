import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { SITE_URL, type FaqItem } from '@/lib/seoLandings'

export interface LandingBlock {
    title: string
    items: string[]
    ordered?: boolean
}

interface RelatedLink {
    href: string
    label: string
}

interface PatientSeoLandingProps {
    path: string
    breadcrumbLabel: string
    breadcrumbParent: { label: string; href: string }
    eyebrow: string
    h1: string
    intro: string
    blocks: LandingBlock[]
    faq: FaqItem[]
    primaryCta: { href: string; label: string }
    secondaryCta: { href: string; label: string }
    related: RelatedLink[]
}

export function PatientSeoLanding({
    path,
    breadcrumbLabel,
    breadcrumbParent,
    eyebrow,
    h1,
    intro,
    blocks,
    faq,
    primaryCta,
    secondaryCta,
    related,
}: PatientSeoLandingProps) {
    const url = `${SITE_URL}${path}`

    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: breadcrumbParent.label,
                    item: `${SITE_URL}${breadcrumbParent.href}`,
                },
                { '@type': 'ListItem', position: 3, name: breadcrumbLabel, item: url },
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
        },
    ]

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />

            <main className="flex-1">
                <section className="py-14 md:py-20 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border-b border-slate-200/60">
                    <div className="container-wide max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-200">
                            {eyebrow}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-6 leading-tight">
                            {h1}
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">{intro}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={primaryCta.href}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-950/15 hover:bg-teal-900 transition-all"
                            >
                                <span>{primaryCta.label}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href={secondaryCta.href}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                {secondaryCta.label}
                            </Link>
                        </div>
                    </div>
                </section>

                {blocks.map((block) => (
                    <section key={block.title} className="py-10 md:py-12 border-b border-slate-200/60">
                        <div className="container-wide max-w-3xl mx-auto">
                            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-5">{block.title}</h2>
                            {block.ordered ? (
                                <ol className="space-y-3 list-decimal pl-5 text-slate-700 leading-relaxed marker:font-semibold marker:text-teal-800">
                                    {block.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ol>
                            ) : (
                                <ul className="space-y-3">
                                    {block.items.map((item) => (
                                        <li key={item} className="flex gap-3 text-slate-700 leading-relaxed">
                                            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-teal-700" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                ))}

                <section className="py-10 md:py-12 bg-slate-50 border-b border-slate-200/60">
                    <div className="container-wide max-w-3xl mx-auto">
                        <h2 className="text-2xl font-heading font-bold text-slate-900 mb-5">Preguntas frecuentes</h2>
                        <div className="space-y-4">
                            {faq.map((f) => (
                                <div key={f.q} className="bg-white rounded-2xl border border-slate-200 p-5">
                                    <h3 className="font-semibold text-slate-900 mb-2">{f.q}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-xs text-slate-500 leading-relaxed">
                            Este contenido es informativo y no reemplaza la evaluación de un profesional de salud.
                            Si estás en una situación de urgencia, llama a Salud Responde al 600 360 7777 o a la
                            línea de prevención del suicidio *4141.
                        </p>
                    </div>
                </section>

                <section className="py-10 md:py-12">
                    <div className="container-wide max-w-3xl mx-auto">
                        <h2 className="text-lg font-heading font-bold text-slate-900 mb-4">También te puede interesar</h2>
                        <ul className="flex flex-wrap gap-2">
                            {related.map((r) => (
                                <li key={r.href}>
                                    <Link
                                        href={r.href}
                                        className="inline-block rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                                    >
                                        {r.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
