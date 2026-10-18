'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
    titleClassName?: string
    descriptionClassName?: string
    actionsClassName?: string
}

export function PageHeader({
    title,
    description,
    actions,
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    actionsClassName = '',
}: PageHeaderProps) {
    return (
        <div className={`page-header ${className}`}>
            <div className={`page-header-title ${titleClassName}`}>
                <h1 className="text-2xl font-heading font-bold text-gray-900 truncate">{title}</h1>
                {description && (
                    <p className={`text-gray-600 mt-1 ${descriptionClassName}`}>{description}</p>
                )}
            </div>
            {actions && (
                <div className={`page-header-actions flex flex-wrap items-center gap-2 shrink-0 ${actionsClassName}`}>
                    {actions}
                </div>
            )}
        </div>
    )
}

interface SectionHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
}

export function SectionHeader({ title, description, actions, className = '' }: SectionHeaderProps) {
    return (
        <div className={`section-header ${className}`}>
            <div className="section-header-title">
                <h2 className="text-xl font-heading font-semibold text-gray-900">{title}</h2>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    )
}

interface CardHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
}

export function CardHeader({ title, description, actions, className = '' }: CardHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 ${className}`}>
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    )
}