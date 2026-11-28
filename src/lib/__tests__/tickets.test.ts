import { cleanText, createTicketSchema, sanitizePagePath, updateTicketSchema } from '@/lib/tickets'

describe('cleanText', () => {
    it('quita caracteres de control pero conserva saltos de linea', () => {
        expect(cleanText('Hola\u0000 mundo\u0007\nLinea 2')).toBe('Hola mundo\nLinea 2')
    })

    it('normaliza CRLF y limita los saltos de linea seguidos', () => {
        expect(cleanText('a\r\nb\n\n\n\n\n\nc')).toBe('a\nb\n\n\nc')
    })

    it('recorta espacios en los extremos', () => {
        expect(cleanText('   texto   ')).toBe('texto')
    })
})

describe('sanitizePagePath', () => {
    it('deja solo la ruta: sin dominio, parametros ni fragmento', () => {
        expect(sanitizePagePath('https://psydoctor.cl/dashboard/citas/abc?token=secreto&x=1#frag')).toBe('/dashboard/citas/abc')
        expect(sanitizePagePath('/reservar/ana?email=a@b.cl')).toBe('/reservar/ana')
    })

    it('devuelve null para valores vacios o invalidos', () => {
        expect(sanitizePagePath('')).toBeNull()
        expect(sanitizePagePath(undefined)).toBeNull()
        expect(sanitizePagePath('no es una url')).toBeNull()
    })

    it('limita el largo de la ruta', () => {
        expect(sanitizePagePath('/' + 'a'.repeat(500))!.length).toBeLessThanOrEqual(200)
    })
})

describe('createTicketSchema', () => {
    const valid = { type: 'PROBLEM', subject: 'No carga mi cita', message: 'Al abrir el detalle se queda en blanco.' }

    it('acepta un ticket valido', () => {
        expect(createTicketSchema.safeParse(valid).success).toBe(true)
    })

    it('rechaza tipo, asunto o mensaje invalidos con un mensaje claro', () => {
        expect(createTicketSchema.safeParse({ ...valid, type: 'HACK' }).success).toBe(false)
        const short = createTicketSchema.safeParse({ ...valid, subject: 'ab' })
        expect(short.success).toBe(false)
        expect(!short.success && short.error.errors[0].message).toMatch(/asunto/i)
        expect(createTicketSchema.safeParse({ ...valid, message: 'corto' }).success).toBe(false)
        expect(createTicketSchema.safeParse({ ...valid, message: 'x'.repeat(3001) }).success).toBe(false)
    })

    it('valida el correo solo si se envia', () => {
        expect(createTicketSchema.safeParse({ ...valid, email: 'no-es-correo' }).success).toBe(false)
        expect(createTicketSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
        expect(createTicketSchema.safeParse({ ...valid, email: 'ana@correo.cl' }).success).toBe(true)
    })
})

describe('updateTicketSchema', () => {
    it('exige al menos un cambio y valores validos', () => {
        expect(updateTicketSchema.safeParse({}).success).toBe(false)
        expect(updateTicketSchema.safeParse({ status: 'RESOLVED' }).success).toBe(true)
        expect(updateTicketSchema.safeParse({ status: 'BORRADO' }).success).toBe(false)
        expect(updateTicketSchema.safeParse({ priority: 'HIGH', adminNotes: null }).success).toBe(true)
    })
})
