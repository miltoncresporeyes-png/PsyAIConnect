import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

interface Props {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  // Genera rutas estáticas para todos los locales soportados
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Tratar locales inválidos como 404 para evitar loops de redirección.
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Habilita traducciones en Server Components de este segmento
  setRequestLocale(locale)
  return <>{children}</>
}
