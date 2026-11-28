/** @jest-environment node */
const findMany = jest.fn()
const update = jest.fn()
const sendPlanExpiringEmail = jest.fn()

jest.mock('@/lib/prisma', () => ({ prisma: { professional: { findMany: (...a: any[]) => findMany(...a), update: (...a: any[]) => update(...a) } } }))
jest.mock('@/lib/email', () => ({ sendPlanExpiringEmail: (...a: any[]) => sendPlanExpiringEmail(...a) }))

import { runPlanExpiryReminders } from '../subscriptionReminders'

const now = new Date('2026-12-01T12:00:00Z')
const ends = new Date('2026-12-07T12:00:00Z')
const base = { id: 'p1', subscriptionTier: 'PRO', subscriptionEnds: ends, subscriptionCancelledAt: null, renewalReminderFor: null, user: { name: 'Ana', email: 'a@x.cl', isActive: true } }

beforeEach(() => jest.clearAllMocks())

describe('runPlanExpiryReminders', () => {
    it('envía y marca la fecha avisada', async () => {
        findMany.mockResolvedValue([base])
        sendPlanExpiringEmail.mockResolvedValue({ success: true })
        expect(await runPlanExpiryReminders(now)).toEqual({ sent: 1, failed: 0 })
        expect(update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { renewalReminderFor: ends } })
        const where = findMany.mock.calls[0][0].where
        expect(where.subscriptionTier).toEqual({ not: 'STARTER' })
        expect(where.subscriptionEnds.lte.getTime()).toBe(now.getTime() + 7 * 86400000)
    })

    it('no repite para la misma fecha, pero sí si cambió tras renovar', async () => {
        findMany.mockResolvedValue([{ ...base, renewalReminderFor: new Date(ends) }])
        expect(await runPlanExpiryReminders(now)).toEqual({ sent: 0, failed: 0 })
        expect(sendPlanExpiringEmail).not.toHaveBeenCalled()

        findMany.mockResolvedValue([{ ...base, renewalReminderFor: new Date('2026-11-07T12:00:00Z') }])
        sendPlanExpiringEmail.mockResolvedValue({ success: true })
        expect((await runPlanExpiryReminders(now)).sent).toBe(1)
    })

    it('si el correo falla no marca y reintenta luego', async () => {
        findMany.mockResolvedValue([base])
        sendPlanExpiringEmail.mockResolvedValue({ success: false })
        expect(await runPlanExpiryReminders(now)).toEqual({ sent: 0, failed: 1 })
        expect(update).not.toHaveBeenCalled()
    })

    it('omite usuarios desactivados', async () => {
        findMany.mockResolvedValue([{ ...base, user: { ...base.user, isActive: false } }])
        expect(await runPlanExpiryReminders(now)).toEqual({ sent: 0, failed: 0 })
    })
})
