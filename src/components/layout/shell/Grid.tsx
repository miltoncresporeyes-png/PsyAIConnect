'use client'

import { ReactNode } from 'react'

interface GridProps {
    children: ReactNode
    columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fit' | 'auto-fill'
    gap?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    responsive?: boolean
}

const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
    12: 'grid-cols-12',
    'auto-fit': 'grid-auto-fit',
    'auto-fill': 'grid-auto-fill',
}

const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-5 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-10',
}

export function Grid({
    children,
    columns = 'auto-fit',
    gap = 'md',
    className = '',
    responsive = true,
}: GridProps) {
    const baseClasses = responsive
        ? 'grid w-full max-w-full min-w-0'
        : 'grid w-full max-w-full'

    return (
        <div className={`${baseClasses} ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    )
}

interface FlexGridProps {
    children: ReactNode
    minItemWidth?: string
    gap?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function FlexGrid({
    children,
    minItemWidth = '280px',
    gap = 'md',
    className = '',
}: FlexGridProps) {
    return (
        <div
            className={`grid gap-4 sm:gap-5 lg:gap-6 ${className}`}
            style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}), 1fr))`,
            }}
        >
            {children}
        </div>
    )
}

interface KPIGridProps {
    children: ReactNode
    count?: 2 | 3 | 4
    gap?: 'sm' | 'md' | 'lg'
    className?: string
}

const kpiColumnClasses = {
    2: 'kpi-grid-2',
    3: 'kpi-grid-3',
    4: 'kpi-grid-4',
}

const kpiGapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-5 sm:gap-6 lg:gap-8',
}

export function KPIGrid({
    children,
    count = 4,
    gap = 'md',
    className = '',
}: KPIGridProps) {
    return (
        <div className={`kpi-grid ${kpiColumnClasses[count] || 'kpi-grid'} ${kpiGapClasses[gap]} ${className}`}>
            {children}
        </div>
    )
}

interface CardGridProps {
    children: ReactNode
    count?: 2 | 3 | 4
    gap?: 'sm' | 'md' | 'lg'
    className?: string
}

const cardColumnClasses = {
    2: 'card-grid-2',
    3: 'card-grid-3',
    4: 'card-grid-4',
}

export function CardGrid({
    children,
    count = 4,
    gap = 'md',
    className = '',
}: CardGridProps) {
    return (
        <div className={`card-grid ${cardColumnClasses[count] || 'card-grid'} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    )
}

interface FormGridProps {
    children: ReactNode
    columns?: 2 | 3
    gap?: 'sm' | 'md' | 'lg'
    className?: string
}

const formColumnClasses = {
    2: 'form-grid-2',
    3: 'form-grid-3',
}

export function FormGrid({
    children,
    columns = 2,
    gap = 'md',
    className = '',
}: FormGridProps) {
    return (
        <div className={`form-grid ${formColumnClasses[columns] || 'form-grid'} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    )
}

interface ListContainerProps {
    children: ReactNode
    className?: string
    divided?: boolean
}

export function ListContainer({ children, className = '', divided = false }: ListContainerProps) {
    return (
        <div className={`list-container ${divided ? 'divide-y divide-gray-100' : 'space-y-3 sm:space-y-4'} ${className}`}>
            {children}
        </div>
    )
}

interface ListItemProps {
    children: ReactNode
    className?: string
    action?: ReactNode
}

export function ListItem({ children, className = '', action }: ListItemProps) {
    return (
        <div className={`list-item ${className}`}>
            <div className="list-item-content min-w-0">{children}</div>
            {action && <div className="list-item-actions">{action}</div>}
        </div>
    )
}