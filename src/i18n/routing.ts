import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en', 'fr', 'pt'],
  defaultLocale: 'es',
  // Default locale (es) sin prefijo en URL, los demás con /en /fr /pt
  localePrefix: 'as-needed',
  // Sin detección automática por Accept-Language: / siempre es español
  localeDetection: false,
})

export const locales = routing.locales
export type Locale = (typeof routing.locales)[number]
export const defaultLocale = routing.defaultLocale
