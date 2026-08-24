import { MetadataRoute } from 'next'

const BASE_URL = 'https://psydoctor.cl'
const LOCALES = ['en', 'fr', 'pt'] // 'es' is the default (no prefix)
const TODAY = new Date().toISOString().split('T')[0]

function buildAlternates(path: string) {
  const localeEntries: Record<string, string> = {
    'es-CL': `${BASE_URL}${path}`,
    'x-default': `${BASE_URL}${path}`,
  }
  LOCALES.forEach((lang) => {
    localeEntries[lang] = `${BASE_URL}/${lang}${path === '/' ? '' : path}`
  })
  return localeEntries
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    // --- Homepage ---
    {
      url: `${BASE_URL}/`,
      lastModified: TODAY,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: buildAlternates('/') },
    },
    // --- Buscador (alta conversión) ---
    {
      url: `${BASE_URL}/buscar`,
      lastModified: TODAY,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: { languages: buildAlternates('/buscar') },
    },
    // --- Orientador de bienestar ---
    {
      url: `${BASE_URL}/orientador`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: { languages: buildAlternates('/orientador') },
    },
    // --- Profesionales ---
    {
      url: `${BASE_URL}/profesionales`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: buildAlternates('/profesionales') },
    },
    // --- Planes ---
    {
      url: `${BASE_URL}/planes`,
      lastModified: TODAY,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: { languages: buildAlternates('/planes') },
    },
    // --- FAQ ---
    {
      url: `${BASE_URL}/faq`,
      lastModified: TODAY,
      changeFrequency: 'monthly',
      priority: 0.65,
      alternates: { languages: buildAlternates('/faq') },
    },
    // --- Términos y Privacidad ---
    {
      url: `${BASE_URL}/terminos`,
      lastModified: TODAY,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: TODAY,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  return routes
}
