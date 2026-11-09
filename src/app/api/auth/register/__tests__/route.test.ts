/** @jest-environment node */

import { POST } from '../route'

describe('POST /api/auth/register (retirada)', () => {
  it('responde 410 y no crea cuentas sin verificar el correo', async () => {
    const response = await POST()

    expect(response.status).toBe(410)
  })
})
