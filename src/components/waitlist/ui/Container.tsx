import React from 'react'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
    children: React.ReactNode
    size?: 'narrow' | 'default' | 'wide'
}

export function Container({
    className = '',
    children,
    size = 'default',
    ...props
}: ContainerProps) {
    const sizeStyles = {
        narrow: 'max-w-2xl',
        default: 'max-w-4xl',
        wide: 'max-w-5xl',
    }

    return (
        <div
            className={`w-full mx-auto px-4 sm:px-6 ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
