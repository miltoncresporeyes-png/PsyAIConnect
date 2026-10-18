import React from 'react'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: 1 | 2 | 3 | 4
    className?: string
    children: React.ReactNode
    editorial?: boolean
}

export function Heading({
    level = 2,
    className = '',
    children,
    editorial = false,
    ...props
}: HeadingProps) {
    const fontClass = editorial ? 'font-serif-warm' : 'font-heading'
    const colorClass = 'text-tinta'

    const sizeStyles = {
        1: 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] break-words',
        2: 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.2]',
        3: 'text-xl sm:text-2xl font-semibold tracking-tight leading-[1.25]',
        4: 'text-base sm:text-lg font-semibold leading-snug',
    }

    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

    return (
        <Tag
            className={`${fontClass} ${colorClass} ${sizeStyles[level]} ${className}`}
            {...props}
        >
            {children}
        </Tag>
    )
}
