'use client'

import { Globe, ChevronDown } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

const langs = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'pt', label: 'Português', short: 'PT' },
] as const satisfies ReadonlyArray<{ code: Locale; label: string; short: string }>

const localeCodes = new Set(langs.map((lang) => lang.code))

interface Props {
  compact?: boolean
  variant?: 'dark' | 'light'
}

type IdleDeadline = {
  didTimeout: boolean
  timeRemaining: () => number
}

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: (deadline: IdleDeadline) => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

function buildLocalizedPath(pathname: string, queryString: string) {
  const normalizedPath = normalizeLocalePath(pathname)
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath
}

function normalizeLocalePath(pathname: string) {
  const safePathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  const segments = safePathname.split('/').filter(Boolean)

  while (segments.length > 0 && localeCodes.has(segments[0] as Locale)) {
    segments.shift()
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

async function prefetchLocale(
  router: ReturnType<typeof useRouter>,
  pathWithQuery: string,
  nextLocale: Locale
) {
  try {
    await router.prefetch(pathWithQuery, { locale: nextLocale })
  } catch {
    // Prefetch es una optimización no crítica.
  }
}

function isLocale(value: string): value is Locale {
  return langs.some((lang) => lang.code === value)
}

function LanguageSwitcherInner({ compact, variant = 'dark' }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const search = searchParams?.toString() ?? ''
  const pathWithQuery = useMemo(() => buildLocalizedPath(pathname, search), [pathname, search])

  const currentLocale = isLocale(locale) ? locale : 'es'
  const current = langs.find((l) => l.code === currentLocale) ?? langs[0]

  useEffect(() => {
    const windowWithIdle = window as WindowWithIdleCallback

    const warmup = () => {
      langs.forEach((lang) => {
        if (lang.code !== currentLocale) {
          void prefetchLocale(router, pathWithQuery, lang.code)
        }
      })
    }

    if (windowWithIdle.requestIdleCallback) {
      const id = windowWithIdle.requestIdleCallback(() => {
        warmup()
      }, { timeout: 800 })

      return () => {
        if (windowWithIdle.cancelIdleCallback) {
          windowWithIdle.cancelIdleCallback(id)
        }
      }
    }

    const timeoutId = window.setTimeout(warmup, 250)
    return () => window.clearTimeout(timeoutId)
  }, [currentLocale, router, pathWithQuery])

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) {
      setOpen(false)
      return
    }

setOpen(false)

    // 1. Guardar la cookie del locale para el middleware
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`

    // 2. Sólo el home tiene variante localizada (/en, /fr, /pt). En el resto de
    //    secciones el middleware redirige cualquier prefijo de idioma hacia la
    //    ruta base, por lo que generar /en/buscar sólo añade un salto de
    //    redirección y expone URLs que redirigen. Basta con recargar la ruta
    //    actual: la cookie ya fuerza el idioma en el servidor.
    const unlocalizedPath = normalizeLocalePath(pathname)
    const searchStr = search ? `?${search}` : ''
    const finalUrl =
        unlocalizedPath === '/'
            ? `${nextLocale === 'es' ? '' : `/${nextLocale}`}${searchStr}`
            : `${unlocalizedPath}${searchStr}`

    // 3. Recargar físicamente para aplicar las traducciones del servidor
    window.location.href = finalUrl || '/'
  }

  useEffect(() => {
    if (!open) return

    langs.forEach((lang) => {
      if (lang.code !== currentLocale) {
        void prefetchLocale(router, pathWithQuery, lang.code)
      }
    })
  }, [open, currentLocale, router, pathWithQuery])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (compact) {
    return (
      <div className="flex items-center gap-0.5" role="navigation" aria-label="Idioma">
        {langs.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLocaleChange(lang.code)}
            onMouseEnter={() => {
              if (lang.code !== currentLocale) {
                void prefetchLocale(router, pathWithQuery, lang.code)
              }
            }}
            aria-current={currentLocale === lang.code ? 'true' : undefined}
            disabled={isPending}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors disabled:cursor-wait disabled:opacity-70 ${
              currentLocale === lang.code
                ? 'bg-teal-600 text-white'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {lang.short}
          </button>
        ))}
      </div>
    )
  }

  const isDark = variant === 'dark'

  return (
    <div ref={ref} className="relative" role="navigation" aria-label="Idioma">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
          isDark
            ? 'text-teal-100/80 hover:bg-white/10'
            : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
        }`}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {current.short}
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Seleccionar idioma"
          className="absolute right-0 top-full z-[200] mt-2 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-900/10"
        >
          {langs.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={currentLocale === lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              onMouseEnter={() => {
                if (lang.code !== currentLocale) {
                  void prefetchLocale(router, pathWithQuery, lang.code)
                }
              }}
              disabled={isPending}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors disabled:cursor-wait disabled:opacity-70 ${
                currentLocale === lang.code
                  ? 'bg-teal-50 font-semibold text-teal-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {lang.label}
              {currentLocale === lang.code && (
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function LanguageSwitcher(props: Props) {
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherInner {...props} />
    </Suspense>
  )
}
