/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    signOut: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}))

jest.mock('@/i18n/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

jest.mock('@/components/ui/LanguageSwitcher', () => ({
    LanguageSwitcher: () => <div data-testid="language-switcher">ES</div>,
}))

// Mock child components that might access server/window specifics
jest.mock('@/lib/track', () => ({
    track: jest.fn(),
}))

import WaitlistLandingPage from '@/components/waitlist/WaitlistLandingPage'

describe('WaitlistLandingPage Visible Text Snapshot Contract', () => {
    it('extrae todo el texto visible de la landing y coincide exactamente con el snapshot', () => {
        const { container } = render(<WaitlistLandingPage />)

        // Extraer todos los elementos con texto y normalizar espacios
        const textNodes: string[] = []
        const walk = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const val = (node.textContent || '').trim().replace(/\s+/g, ' ')
                if (val.length > 0) {
                    textNodes.push(val)
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement
                // Omitir script o style tags
                if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                    for (let i = 0; i < el.childNodes.length; i++) {
                        walk(el.childNodes[i])
                    }
                }
            }
        }

        walk(container)

        // Comprobación de snapshot Jest: debe mantenerse idéntico antes y después
        expect(textNodes).toMatchSnapshot()
    })
})
