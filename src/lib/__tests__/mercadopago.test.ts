/** @jest-environment node */
import crypto from 'crypto'

const findUnique = jest.fn()
const updateMany = jest.fn()
const professionalUpdate = jest.fn()
const sendEmail = jest.fn()

jest.mock('@/lib/prisma', () => {
    const tx = { subscriptionOrder: { updateMany: (...a: unknown[]) => updateMany(...a) }, professional: { update: (...a: unknown[]) => professionalUpdate(...a) } }
    return {
        prisma: {
            subscriptionOrder: { findUnique: (...a: unknown[]) => findUnique(...a), updateMany: (...a: unknown[]) => updateMany(...a) },
            $transaction: async (fn: (t: typeof tx) => unknown) => fn(tx),
        },
    }
})
jest.mock('@/lib/email', () => ({ sendEmail: (...a: unknown[]) => sendEmail(...a) }))
jest.mock('@/lib/appointmentPolicy', () => ({ baseUrl: () => 'https://psydoctor.cl', layout: (t: string, b: string) => `${t}${b}` }))

import { verifyMercadoPagoSignature } from '../mercadopagoWebhook'
import { applySubscriptionPayment, subscriptionOrderIdFrom } from '../subscriptionPayments'

const secret = 'clave-de-prueba'
function sign(dataId: string, requestId: string, ts: string) {
    return crypto.createHmac('sha256', secret).update(`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`).digest('hex')
}

describe('firma de la webhook', () => {
    it('acepta una firma válida y rechaza una alterada o ausente', () => {
        const v1 = sign('123456', 'req-1', '1700000000')
        const base = { xRequestId: 'req-1', dataId: '123456', secret }
        expect(verifyMercadoPagoSignature({ ...base, xSignature: `ts=1700000000,v1=${v1}` })).toBe(true)
        expect(verifyMercadoPagoSignature({ ...base, xSignature: `ts=1700000000,v1=${v1.replace(/.$/, '0')}` })).toBe(false)
        expect(verifyMercadoPagoSignature({ ...base, dataId: '999', xSignature: `ts=1700000000,v1=${v1}` })).toBe(false)
        expect(verifyMercadoPagoSignature({ ...base, xSignature: null })).toBe(false)
        expect(verifyMercadoPagoSignature({ ...base, xSignature: 'basura' })).toBe(false)
    })
})

const order = {
    id: 'ord1',
    status: 'PENDING',
    amount: 29900,
    months: 1,
    toTier: 'PRO',
    newEnds: new Date('2027-01-01T00:00:00Z'),
    professionalId: 'p1',
    professional: { id: 'p1', user: { email: 'pro@x.cl', name: 'Ana' } },
}

beforeEach(() => jest.clearAllMocks())

describe('applySubscriptionPayment', () => {
    it('extrae el id de la orden de la referencia externa', () => {
        expect(subscriptionOrderIdFrom('sub_abc')).toBe('abc')
        expect(subscriptionOrderIdFrom('cita123')).toBeNull()
        expect(subscriptionOrderIdFrom(null)).toBeNull()
    })

    it('un pago de cita no es de suscripción', async () => {
        expect(await applySubscriptionPayment({ id: 1, status: 'approved', external_reference: 'cita1' })).toEqual({ handled: false, reason: 'not_subscription' })
    })

    it('activa el plan, envía comprobante y es idempotente', async () => {
        findUnique.mockResolvedValue(order)
        updateMany.mockResolvedValueOnce({ count: 1 })
        const res = await applySubscriptionPayment({ id: 555, status: 'approved', transaction_amount: 29900, currency_id: 'CLP', external_reference: 'sub_ord1' })
        expect(res).toEqual({ handled: true, orderId: 'ord1', result: 'activated' })
        expect(professionalUpdate).toHaveBeenCalledWith({
            where: { id: 'p1' },
            data: { subscriptionTier: 'PRO', subscriptionEnds: order.newEnds, subscriptionCancelledAt: null },
        })
        expect(sendEmail).toHaveBeenCalledTimes(1)

        // Segunda llamada concurrente: otra ya reclamó la orden
        updateMany.mockResolvedValueOnce({ count: 0 })
        const again = await applySubscriptionPayment({ id: 555, status: 'approved', transaction_amount: 29900, external_reference: 'sub_ord1' })
        expect(again).toEqual({ handled: true, orderId: 'ord1', result: 'already_paid' })
        expect(professionalUpdate).toHaveBeenCalledTimes(1)
    })

    it('no activa si el monto o la moneda no coinciden', async () => {
        findUnique.mockResolvedValue(order)
        expect(await applySubscriptionPayment({ id: 1, status: 'approved', transaction_amount: 100, external_reference: 'sub_ord1' })).toEqual({ handled: false, reason: 'amount_mismatch' })
        expect(await applySubscriptionPayment({ id: 1, status: 'approved', transaction_amount: 29900, currency_id: 'USD', external_reference: 'sub_ord1' })).toEqual({ handled: false, reason: 'currency_mismatch' })
        expect(professionalUpdate).not.toHaveBeenCalled()
    })

    it('una orden ya pagada no se vuelve a activar', async () => {
        findUnique.mockResolvedValue({ ...order, status: 'PAID' })
        const res = await applySubscriptionPayment({ id: 1, status: 'approved', transaction_amount: 29900, external_reference: 'sub_ord1' })
        expect(res).toEqual({ handled: true, orderId: 'ord1', result: 'already_paid' })
        expect(professionalUpdate).not.toHaveBeenCalled()
    })

    it('rechazado solo marca órdenes pendientes y reembolso avisa sin quitar el plan', async () => {
        findUnique.mockResolvedValue(order)
        updateMany.mockResolvedValue({ count: 1 })
        expect((await applySubscriptionPayment({ id: 1, status: 'rejected', external_reference: 'sub_ord1' }))).toMatchObject({ result: 'failed' })
        expect(updateMany).toHaveBeenCalledWith({ where: { id: 'ord1', status: 'PENDING' }, data: { status: 'FAILED' } })

        expect((await applySubscriptionPayment({ id: 2, status: 'refunded', external_reference: 'sub_ord1' }))).toMatchObject({ result: 'refunded' })
        expect(professionalUpdate).not.toHaveBeenCalled()
        expect(sendEmail).toHaveBeenCalledTimes(1)
    })
})
