import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatCLP } from '@/lib/format'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** @deprecated usa formatCLP de '@/lib/format' */
export const formatPrice = (amount: number): string => formatCLP(amount)
