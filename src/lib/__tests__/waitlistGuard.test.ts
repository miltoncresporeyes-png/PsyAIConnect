/** @jest-environment node */

import { isWaitlistMode, getWaitlistBlockedResponse } from '../waitlistGuard'

describe('waitlistGuard', () => {
    const originalEnv = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...originalEnv }
    })

    afterAll(() => {
        process.env = originalEnv
    })

    describe('isWaitlistMode', () => {
        it('debe retornar true cuando WAITLIST_MODE es "true"', () => {
            process.env.WAITLIST_MODE = 'true'
            expect(isWaitlistMode()).toBe(true)
        })

        it('debe retornar false cuando WAITLIST_MODE es "false"', () => {
            process.env.WAITLIST_MODE = 'false'
            expect(isWaitlistMode()).toBe(false)
        })

        it('debe retornar false cuando WAITLIST_MODE no está definida', () => {
            delete process.env.WAITLIST_MODE
            expect(isWaitlistMode()).toBe(false)
        })

        it('debe retornar false para cualquier otro valor', () => {
            process.env.WAITLIST_MODE = '1'
            expect(isWaitlistMode()).toBe(false)
        })
    })

    describe('getWaitlistBlockedResponse', () => {
        it('debe retornar NextResponse con 404 y JSON { error: "Not found" } en modo waitlist', async () => {
            process.env.WAITLIST_MODE = 'true'
            const response = getWaitlistBlockedResponse()

            expect(response).not.toBeNull()
            expect(response?.status).toBe(404)
            expect(response?.headers.get('Cache-Control')).toBe('no-store, max-age=0')

            const data = await response?.json()
            expect(data).toEqual({ error: 'Not found' })
        })

        it('debe retornar null cuando WAITLIST_MODE no es "true"', () => {
            process.env.WAITLIST_MODE = 'false'
            const response = getWaitlistBlockedResponse()
            expect(response).toBeNull()
        })

        it('debe retornar null cuando WAITLIST_MODE está indefinida', () => {
            delete process.env.WAITLIST_MODE
            const response = getWaitlistBlockedResponse()
            expect(response).toBeNull()
        })
    })
})
