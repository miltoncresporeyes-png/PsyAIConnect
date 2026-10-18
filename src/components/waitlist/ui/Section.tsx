import React from 'react'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    id?: string
    className?: string
    children: React.ReactNode
    variant?: 'default' | 'niebla' | 'white' | 'subtle'
}

export function Section({
    id,
    className = '',
    children,
    variant = 'default',
    ...props
}: SectionProps) {
    const bgStyles = {
        default: 'bg-white',
        niebla: 'bg-niebla',
        white: 'bg-white',
        subtle: 'bg-[#fafcfc] border-t border-bruma/50',
    }

    return (
        <section
            id={id}
            className={`w-full max-w-full overflow-hidden py-14 sm:py-20 ${bgStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </section>
    )
}
