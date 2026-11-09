import { useId } from 'react'

/**
 * Marca PsyDoctor.
 *
 * Isotipo: una Ψ (psi) de trazo grueso, para que se lea bien incluso a 24 px,
 * sobre una baldosa verde profundo. El punto sobre el eje es la persona: la
 * Ψ forma el abrazo y el eje, que es el sostén profesional.
 *
 * Es SVG en línea: sin petición de red, nítido a cualquier tamaño y sin
 * parpadeo de carga. Los archivos public/logo.svg y public/icon.svg replican
 * el mismo dibujo para favicon, datos estructurados y redes.
 */

interface LogoMarkProps {
  size?: number
  className?: string
  title?: string
}

export function LogoMark({ size = 36, className = '', title }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '')
  const bg = `psy-bg-${uid}`
  const shine = `psy-shine-${uid}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id={bg} x1="8" y1="0" x2="92" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F8B80" />
          <stop offset="1" stopColor="#0B4F4A" />
        </linearGradient>
        <linearGradient id={shine} x1="50" y1="0" x2="50" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="28" fill={`url(#${bg})`} />
      <rect width="100" height="100" rx="28" fill={`url(#${shine})`} />

      {/* Ψ: abrazo y eje */}
      <path
        d="M30 34 V47 C30 61 38 68 50 68 C62 68 70 61 70 47 V34"
        stroke="#FFFFFF"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M50 36 V80" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />

      {/* La persona */}
      <circle cx="50" cy="21" r="7.5" fill="#99F6E4" />
    </svg>
  )
}

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: number
  /** `dark`: texto claro para fondos oscuros (footer). */
  tone?: 'light' | 'dark'
  className?: string
}

export function Logo({ variant = 'full', size = 36, tone = 'light', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return <LogoMark size={size} className={className} title="PsyDoctor" />
  }

  const onDark = tone === 'dark'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} style={{ height: size }}>
      <LogoMark size={size} className="shrink-0" />
      <span
        className="font-heading leading-none tracking-[-0.03em]"
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        <span className={`font-bold ${onDark ? 'text-white' : 'text-slate-900'}`}>Psy</span>
        <span className={`font-semibold ${onDark ? 'text-teal-300' : 'text-teal-700'}`}>Doctor</span>
      </span>
      <span className="sr-only">PsyDoctor</span>
    </span>
  )
}
