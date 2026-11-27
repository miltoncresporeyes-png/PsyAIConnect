/** @jest-environment node */

import { buildAuthUrl, createMeetSpace, getRedirectUri, GoogleMeetError, MEET_SCOPE } from '@/lib/googleMeet'

jest.mock('@/lib/prisma', () => ({
    prisma: {
        googleMeetConnection: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
        },
    },
}))
jest.mock('@/lib/encryption', () => ({
    encrypt: jest.fn((s: string) => Buffer.from(`enc:${s}`)),
    decrypt: jest.fn((b: Buffer) => b.toString().replace(/^enc:/, '')),
}))

import { prisma } from '@/lib/prisma'

const fetchMock = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    process.env.GOOGLE_MEET_CLIENT_ID = 'client-id'
    process.env.GOOGLE_MEET_CLIENT_SECRET = 'client-secret'
    process.env.NEXTAUTH_URL = 'https://psydoctor.cl/'
    global.fetch = fetchMock as unknown as typeof fetch
})

describe('buildAuthUrl', () => {
    it('pide acceso offline, el permiso de Meet y usa la URI de callback de produccion', () => {
        const url = new URL(buildAuthUrl('abc'))
        expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
        expect(url.searchParams.get('client_id')).toBe('client-id')
        expect(url.searchParams.get('redirect_uri')).toBe('https://psydoctor.cl/api/google/callback')
        expect(url.searchParams.get('access_type')).toBe('offline')
        expect(url.searchParams.get('prompt')).toBe('select_account consent')
        expect(url.searchParams.get('state')).toBe('abc')
        expect(url.searchParams.get('scope')).toContain(MEET_SCOPE)
        expect(getRedirectUri()).toBe('https://psydoctor.cl/api/google/callback')
    })

    it('falla si faltan las credenciales', () => {
        delete process.env.GOOGLE_MEET_CLIENT_ID
        expect(() => buildAuthUrl('x')).toThrow(GoogleMeetError)
    })
})

describe('createMeetSpace', () => {
    it('falla con NOT_CONNECTED si no hay cuenta conectada', async () => {
        ;(prisma.googleMeetConnection.findUnique as jest.Mock).mockResolvedValue(null)
        await expect(createMeetSpace()).rejects.toMatchObject({ code: 'NOT_CONNECTED' })
    })

    it('renueva el token y crea una sala de acceso abierto', async () => {
        ;(prisma.googleMeetConnection.findUnique as jest.Mock).mockResolvedValue({
            refreshToken: Buffer.from('enc:refresh-123'),
        })
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'at-1', expires_in: 3600 }) })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ name: 'spaces/abc', meetingUri: 'https://meet.google.com/abc-defg-hij' }),
            })

        const space = await createMeetSpace()
        expect(space).toEqual({ name: 'spaces/abc', meetingUri: 'https://meet.google.com/abc-defg-hij', meetingCode: undefined })

        const [tokenUrl, tokenInit] = fetchMock.mock.calls[0]
        expect(tokenUrl).toBe('https://oauth2.googleapis.com/token')
        expect((tokenInit.body as URLSearchParams).get('refresh_token')).toBe('refresh-123')
        expect((tokenInit.body as URLSearchParams).get('grant_type')).toBe('refresh_token')

        const [spaceUrl, spaceInit] = fetchMock.mock.calls[1]
        expect(spaceUrl).toBe('https://meet.googleapis.com/v2/spaces')
        expect(JSON.parse(spaceInit.body)).toEqual({ config: { accessType: 'OPEN' } })
        expect(spaceInit.headers.Authorization).toBe('Bearer at-1')
    })

    it('informa API_FAILED cuando Google rechaza la creacion', async () => {
        ;(prisma.googleMeetConnection.findUnique as jest.Mock).mockResolvedValue({
            refreshToken: Buffer.from('enc:refresh-123'),
        })
        // el access token anterior sigue en cache dentro de la misma suite
        fetchMock.mockResolvedValue({ ok: false, status: 403, json: async () => ({ error: { message: 'Meet API no habilitada' } }) })
        await expect(createMeetSpace()).rejects.toMatchObject({ code: 'API_FAILED', message: 'Meet API no habilitada' })
    })
})
