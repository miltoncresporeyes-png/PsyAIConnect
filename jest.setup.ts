/**
 * Jest Setup - runs before each test file
 */
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
            prefetch: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
        data: null,
        status: 'unauthenticated',
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') ||
                args[0].includes('Warning: An update to'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})
