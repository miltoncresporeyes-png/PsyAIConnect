'use client'

import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

interface TableContainerProps {
    children: ReactNode
    className?: string
    wrap?: boolean
    stickyHeader?: boolean
    maxHeight?: string
}

export function TableContainer({
    children,
    className = '',
    wrap = false,
    stickyHeader = false,
    maxHeight,
}: TableContainerProps) {
    return (
        <div
            className={`w-full max-w-full min-w-0 overflow-x-auto table-container ${wrap ? 'table-wrap' : ''} ${className}`}
            style={{ maxHeight }}
        >
            <table className="w-full min-w-full divide-y divide-gray-200" role="grid">
                {children}
            </table>
            {stickyHeader && (
                <style jsx>{`
                    .table-container thead th {
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        background: white;
                    }
                `}</style>
            )}
        </div>
    )
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps) {
    return (
        <thead className={`bg-gray-50 ${className}`} {...props}>
            {children}
        </thead>
    )
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ children, className = '', ...props }: TableBodyProps) {
    return (
        <tbody className={`divide-y divide-gray-100 ${className}`} {...props}>
            {children}
        </tbody>
    )
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    hover?: boolean
    clickable?: boolean
}

export function TableRow({ children, className = '', hover = true, clickable = false, ...props }: TableRowProps) {
    return (
        <tr
            className={`
                ${hover ? 'hover:bg-gray-50' : ''}
                ${clickable ? 'cursor-pointer' : ''}
                transition-colors
                ${className}
            `}
            {...props}
        >
            {children}
        </tr>
    )
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
    align?: 'left' | 'center' | 'right'
    nowrap?: boolean
    font?: 'normal' | 'mono' | 'semibold'
}

export function TableHeaderCell({
    children,
    className = '',
    align = 'left',
    nowrap = true,
    font = 'semibold',
    ...props
}: TableHeaderCellProps) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }

    const fontClasses = {
        normal: '',
        mono: 'font-mono',
        semibold: 'font-semibold',
    }

    const baseClasses = 'px-4 py-3 text-sm font-semibold text-gray-700 border-b-2 border-gray-200'

    return (
        <th
            className={`${baseClasses} ${alignClasses[align]} ${fontClasses[font]} ${nowrap ? 'whitespace-nowrap' : 'whitespace-normal'} ${className}`}
            {...props}
        >
            {children}
        </th>
    )
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    align?: 'left' | 'center' | 'right'
    nowrap?: boolean
    font?: 'normal' | 'mono' | 'semibold'
    color?: 'default' | 'muted' | 'success' | 'warning' | 'error'
}

export function TableCell({
    children,
    className = '',
    align = 'left',
    nowrap = true,
    font = 'normal',
    color = 'default',
    ...props
}: TableCellProps) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }

    const fontClasses = {
        normal: '',
        mono: 'font-mono',
        semibold: 'font-semibold',
    }

    const colorClasses = {
        default: 'text-gray-900',
        muted: 'text-gray-500',
        success: 'text-green-600',
        warning: 'text-amber-600',
        error: 'text-red-600',
    }

    const baseClasses = 'px-4 py-3 text-sm'

    return (
        <td
            className={`${baseClasses} ${alignClasses[align]} ${fontClasses[font]} ${colorClasses[color]} ${nowrap ? 'whitespace-nowrap' : 'whitespace-normal'} ${className}`}
            {...props}
        >
            {children}
        </td>
    )
}

interface TablePaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export function TablePagination({ currentPage, totalPages, onPageChange, className = '' }: TablePaginationProps) {
    if (totalPages <= 1) return null

    return (
        <div className={`flex items-center justify-between px-4 py-3 border-t border-gray-200 ${className}`}>
            <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    Anterior
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    Siguiente
                </button>
            </div>
        </div>
    )
}

interface TableEmptyStateProps {
    message: string
    icon?: ReactNode
    action?: ReactNode
    colSpan?: number
}

export function TableEmptyState({ message, icon, action, colSpan = 6 }: TableEmptyStateProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12 text-center">
                <div className="space-y-4">
                    {icon && (
                        <div className="flex justify-center text-gray-300">
                            {icon}
                        </div>
                    )}
                    <p className="text-gray-500">{message}</p>
                    {action && <div className="flex justify-center">{action}</div>}
                </div>
            </td>
        </tr>
    )
}