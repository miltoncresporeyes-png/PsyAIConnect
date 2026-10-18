import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    className?: string
    children: React.ReactNode
    asAnchor?: boolean
    href?: string
}

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    asAnchor = false,
    href,
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pino disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none'

    const variantStyles = {
        primary:
            'bg-ambar text-tinta hover:bg-amber-500 font-semibold shadow-sm hover:shadow-md border border-amber-600/10',
        secondary:
            'bg-pino text-white hover:bg-teal-800 shadow-sm hover:shadow',
        outline:
            'border border-bruma bg-white text-tinta hover:bg-niebla hover:border-slate-300 shadow-xs',
        ghost:
            'text-tinta hover:bg-niebla',
    }

    const sizeStyles = {
        sm: 'px-3.5 py-1.5 text-xs gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-7 py-3.5 text-base gap-2.5',
    }

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    if (asAnchor && href) {
        return (
            <a href={href} className={combinedClassName} {...(props as any)}>
                {children}
            </a>
        )
    }

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    )
}
