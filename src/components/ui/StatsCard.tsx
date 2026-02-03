import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    value: string | number
    label: string
    icon?: LucideIcon
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'purple' | 'indigo' | 'teal'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const variantStyles = {
    default: 'bg-white border-gray-200',
    primary: 'bg-primary-50 border-primary-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    teal: 'bg-teal-50 border-teal-200',
}

const sizeStyles = {
    sm: {
        container: 'p-3',
        value: 'text-xl',
        label: 'text-xs',
        icon: 'w-4 h-4',
    },
    md: {
        container: 'p-4',
        value: 'text-2xl',
        label: 'text-sm',
        icon: 'w-5 h-5',
    },
    lg: {
        container: 'p-6',
        value: 'text-3xl',
        label: 'text-base',
        icon: 'w-6 h-6',
    },
}

const textColorVariants = {
    default: 'text-gray-900',
    primary: 'text-primary-700',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    purple: 'text-purple-700',
    indigo: 'text-indigo-700',
    teal: 'text-teal-700',
}

export function StatsCard({
    value,
    label,
    icon: Icon,
    variant = 'default',
    size = 'md',
    className,
}: StatsCardProps) {
    const styles = sizeStyles[size]
    const textColor = textColorVariants[variant]

    return (
        <div
            className={cn(
                'rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md',
                variantStyles[variant],
                styles.container,
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className={cn('font-bold tracking-tight', styles.value, textColor)}>
                        {value}
                    </div>
                    <div className={cn('text-gray-600 font-medium', styles.label)}>
                        {label}
                    </div>
                </div>
                {Icon && (
                    <div className={cn('flex-shrink-0 ml-3', textColor)}>
                        <Icon className={styles.icon} strokeWidth={2} />
                    </div>
                )}
            </div>
        </div>
    )
}

// Specialized variants for common use cases
export function StatsCardWithTrend({
    value,
    label,
    trend,
    trendDirection,
    icon,
}: {
    value: string | number
    label: string
    trend: string
    trendDirection: 'up' | 'down'
    icon?: LucideIcon
}) {
    return (
        <StatsCard
            value={value}
            label={label}
            icon={icon}
            variant={trendDirection === 'up' ? 'success' : 'warning'}
            className="relative"
        >
            <div
                className={cn(
                    'absolute top-2 right-2 text-xs font-semibold',
                    trendDirection === 'up' ? 'text-emerald-600' : 'text-amber-600'
                )}
            >
                {trendDirection === 'up' ? '↗' : '↘'} {trend}
            </div>
        </StatsCard>
    )
}
