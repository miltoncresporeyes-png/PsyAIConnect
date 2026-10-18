'use client'

import Image from 'next/image'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: number
  className?: string
}

export function Logo({ variant = 'full', size = 32, className = '' }: LogoProps) {
  const iconSize = Math.round(size * 0.8)

  if (variant === 'icon') {
    return (
      <Image
        src="/logo.svg"
        alt="PsyDoctor"
        width={iconSize}
        height={iconSize}
        className={className}
        priority
      />
    )
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ height: size }}>
      <Image
        src="/logo.svg"
        alt="PsyDoctor"
        width={iconSize}
        height={iconSize}
        className="flex-shrink-0"
        priority
      />
      <span
        className="font-heading font-semibold text-slate-900 leading-none tracking-tight"
        style={{ fontSize: Math.round(size * 0.52) }}
      >
        Psy<span className="text-teal-800">Doctor</span>
      </span>
    </div>
  )
}
