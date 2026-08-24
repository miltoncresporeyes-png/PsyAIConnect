'use client'

import Link from 'next/link'
import { Home, ChevronLeft, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BackButtonProps {
    href?: string
    variant?: 'home' | 'back' | 'chevron'
    className?: string
    children?: React.ReactNode
}

const defaultStyles = "inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"

export function BackButton({ 
    href = '/', 
    variant = 'home',
    className = defaultStyles,
    children 
}: BackButtonProps) {
    const t = useTranslations('backButton')
    const label = children || (variant === 'home' ? t('home') : t('back'))

    if (variant === 'chevron') {
        return (
            <Link href={href} className={className}>
                <ChevronLeft className="w-4 h-4" />
                {label}
            </Link>
        )
    }

    if (variant === 'back') {
        return (
            <Link href={href} className={className}>
                <ArrowLeft className="w-4 h-4" />
                {label}
            </Link>
        )
    }

    return (
        <Link href={href} className={className}>
            <Home className="w-4 h-4" />
            {label}
        </Link>
    )
}
