/**
 * Tests for Utility Functions
 */
import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
    describe('cn (classNames)', () => {
        it('should merge class names', () => {
            const result = cn('foo', 'bar')
            expect(result).toBe('foo bar')
        })

        it('should handle conditional classes', () => {
            const isActive = true
            const isDisabled = false

            const result = cn(
                'base-class',
                isActive && 'active',
                isDisabled && 'disabled'
            )

            expect(result).toBe('base-class active')
        })

        it('should handle undefined and null values', () => {
            const result = cn('foo', undefined, null, 'bar')
            expect(result).toBe('foo bar')
        })

        it('should merge conflicting Tailwind classes correctly', () => {
            const result = cn('px-4', 'px-2')
            // tailwind-merge should keep only the last conflicting class
            expect(result).toBe('px-2')
        })

        it('should handle array of classes', () => {
            const result = cn(['foo', 'bar'], 'baz')
            expect(result).toBe('foo bar baz')
        })

        it('should handle object notation', () => {
            const result = cn({
                'active': true,
                'disabled': false,
                'highlighted': true,
            })
            expect(result).toBe('active highlighted')
        })

        it('should return empty string for no arguments', () => {
            const result = cn()
            expect(result).toBe('')
        })
    })
})
