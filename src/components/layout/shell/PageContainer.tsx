'use client'

import { ReactNode } from 'react'

interface PageContainerProps {
    children: ReactNode
    className?: string
    variant?: 'default' | 'alt' | 'white' | 'dashboard'
    size?: 'narrow' | 'medium' | 'wide' | 'full'
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function PageContainer({
    children,
    className = '',
    variant = 'default',
    size = 'wide',
    padding = 'md',
}: PageContainerProps) {
    const variantClasses = {
        default: 'page-shell',
        alt: 'page-shell-alt',
        white: 'bg-white',
        dashboard: 'dashboard-shell',
    }

    const sizeClasses = {
        narrow: 'content-container-narrow',
        medium: 'content-container-medium',
        wide: 'content-container-wide',
        full: 'content-container-full',
    }

    const paddingClasses = {
        none: '',
        sm: 'py-6 sm:py-8',
        md: 'py-10 md:py-14',
        lg: 'py-12 md:py-16 lg:py-20',
        xl: 'py-16 md:py-20 lg:py-24',
    }

    return (
        <div className={`w-full max-w-full min-w-0 ${variantClasses[variant]} ${sizeClasses[size]} ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    )
}

interface PageFrameProps {
    children: ReactNode
    className?: string
    narrow?: boolean
}

export function PageFrame({ children, className = '', narrow = false }: PageFrameProps) {
    return (
        <div className={`w-full max-w-full min-w-0 ${narrow ? 'page-frame-narrow' : 'page-frame'} ${className}`}>
            {children}
        </div>
    )
}

interface ContentContainerProps {
    children: ReactNode
    className?: string
    size?: 'narrow' | 'medium' | 'wide' | 'full'
}

export function ContentContainer({
    children,
    className = '',
    size = 'wide',
}: ContentContainerProps) {
    const sizeClasses = {
        narrow: 'content-container-narrow',
        medium: 'content-container-medium',
        wide: 'content-container-wide',
        full: 'content-container-full',
    }

    return (
        <div className={`w-full max-w-full min-w-0 ${sizeClasses[size]} ${className}`}>
            {children}
        </div>
    )
}

interface WorkAreaProps {
    children: ReactNode
    className?: string
    constrained?: boolean
}

export function WorkArea({ children, className = '', constrained = true }: WorkAreaProps) {
    return (
        <div className={`work-area ${constrained ? 'work-area-constrained' : ''} ${className}`}>
            {children}
        </div>
    )
}