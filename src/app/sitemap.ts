import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://psydoctor.cl'

// El sitemap debe regenerarse en cada request: los perfiles públicos cambian
// (altas, bajas, edición de perfil) y un sitemap prerenderizado en el build
// los omitiría hasta el siguiente despliegue.
export const dynamic = 'force-dynamic'

/**
 * Sólo el home y la raíz de los locales existen como rutas localizadas
 * (ver src/app/[locale]/page.tsx). El resto de secciones vive en la raíz del
 * dominio, por lo que NO se declaran alternates de idioma para ellas: apuntar a
 * rutas que redirigen (307 en middleware.ts) invalidaría el hreflang.
 */
function homeAlternates() {
    return {
        languages: {
            'es-CL': BASE_URL,
            en: `${BASE_URL}/en`,
            fr: `${BASE_URL}/fr`,
            pt: `${BASE_URL}/pt`,
        },
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
            alternates: homeAlternates(),
        },
        {
            url: `${BASE_URL}/buscar`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/profesionales`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/orientador`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/planes`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/faq`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/privacidad`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${BASE_URL}/terminos`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        ...(['en', 'fr', 'pt'] as const).map((locale) => ({
            url: `${BASE_URL}/${locale}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.5,
            alternates: homeAlternates(),
        })),
    ]

    let professionalRoutes: MetadataRoute.Sitemap = []

    try {
        const professionals = await prisma.professional.findMany({
            where: { isPublic: true, isActive: true },
            select: {
                slug: true,
                updatedAt: true,
                verificationStatus: true,
                profileImageUrl: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 5000,
        })

        professionalRoutes = professionals.map((professional) => ({
            url: `${BASE_URL}/profesional/${professional.slug}`,
            lastModified: professional.updatedAt,
            changeFrequency: 'weekly',
            priority: professional.verificationStatus === 'VERIFIED' ? 0.7 : 0.5,
            images: professional.profileImageUrl ? [professional.profileImageUrl] : undefined,
        }))
    } catch (error) {
        console.error('[sitemap] No se pudieron leer los perfiles públicos:', error)
    }

    return [...staticRoutes, ...professionalRoutes]
}