/** @jest-environment node */

import { codeDigitsHtml, sendLoginCodeEmail, sendVerificationCodeEmail } from '@/lib/email'

const fetchMock = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 're_test_key_123456789'
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: 'msg_1' }) })
    global.fetch = fetchMock as unknown as typeof fetch
})

function sentHtml(): string {
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    return body.html as string
}

describe('codigo de un solo uso en correos', () => {
    it('los digitos van en una sola linea y no usan el tamano que se partia', () => {
        const html = codeDigitsHtml('482915')
        expect(html).toContain('white-space: nowrap')
        expect(html).toContain('word-break: keep-all')
        expect(html).toContain('482915')
        expect(html).not.toContain('letter-spacing: 8px')
        expect(html).not.toContain('font-size: 40px')
    })

    it('el ancho estimado de 6 digitos cabe en una pantalla angosta (320 px)', () => {
        const fontPx = Number(/font-size: (\d+)px/.exec(codeDigitsHtml('123456'))![1])
        const spacingPx = Number(/letter-spacing: (\d+)px/.exec(codeDigitsHtml('123456'))![1])
        const widthPx = 6 * (fontPx * 0.6 + spacingPx) // Courier New: cada caracter mide 0,6 em
        // 320 - 40 (margen del cuerpo) - 62 (relleno y borde del contenedor) - 28 (relleno y borde del recuadro)
        expect(widthPx).toBeLessThan(320 - 40 - 62 - 28)
    })

    it('escapa el contenido para no inyectar HTML', () => {
        expect(codeDigitsHtml('<b>1</b>')).not.toContain('<b>')
    })

    it('el correo de verificacion de registro usa el bloque corregido', async () => {
        await sendVerificationCodeEmail('ana@correo.cl', 'Ana', '482915')
        const html = sentHtml()
        expect(html).toContain('482915')
        expect(html).toContain('white-space: nowrap')
        expect(html).not.toContain('letter-spacing: 8px')
    })

    it('el correo del segundo paso de inicio de sesion usa el bloque corregido', async () => {
        await sendLoginCodeEmail('ana@correo.cl', 'Ana', '739204')
        const html = sentHtml()
        expect(html).toContain('739204')
        expect(html).toContain('white-space: nowrap')
        expect(html).not.toContain('letter-spacing: 8px')
    })
})
