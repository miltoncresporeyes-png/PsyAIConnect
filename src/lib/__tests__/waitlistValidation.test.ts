import { waitlistPatientSchema, waitlistProfessionalSchema } from '@/lib/validation/waitlist'

describe('Waitlist Validation Schemas (Zod)', () => {
    describe('waitlistPatientSchema', () => {
        const validPatient = {
            name: 'Carolina Gómez',
            email: 'carolina.gomez@gmail.com',
            whatsapp: '+56912345678',
            comuna: 'Providencia',
            motivoCategoria: 'ANSIEDAD',
            prevision: 'FONASA',
            consentAccepted: true,
            consentVersion: 'v1.0-waitlist-2026',
            website: '',
            renderedAt: Date.now() - 5000,
        }

        it('acepta un payload de paciente válido', () => {
            const result = waitlistPatientSchema.safeParse(validPatient)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.email).toBe('carolina.gomez@gmail.com')
            }
        })

        it('normaliza el email a minúsculas', () => {
            const result = waitlistPatientSchema.safeParse({
                ...validPatient,
                email: 'CAROLINA.GOMEZ@GMAIL.COM',
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.email).toBe('carolina.gomez@gmail.com')
            }
        })

        it('rechaza si no se acepta el consentimiento', () => {
            const result = waitlistPatientSchema.safeParse({
                ...validPatient,
                consentAccepted: false,
            })
            expect(result.success).toBe(false)
        })

        it('falla con honeypot completado (bot detectado)', () => {
            const result = waitlistPatientSchema.safeParse({
                ...validPatient,
                website: 'https://spam-bot.xyz',
            })
            expect(result.success).toBe(false)
        })

        it('rechaza email inválido', () => {
            const result = waitlistPatientSchema.safeParse({
                ...validPatient,
                email: 'no-es-un-email',
            })
            expect(result.success).toBe(false)
        })
    })

    describe('waitlistProfessionalSchema', () => {
        const validPro = {
            name: 'Dr. Roberto Soto',
            email: 'roberto.soto@medicina.cl',
            whatsapp: '+56987654321',
            profesion: 'PSIQUIATRA',
            registroSuperintendencia: '123456',
            especialidades: ['Psiquiatría Adultos', 'Trastornos del Ánimo'],
            aniosExperiencia: 7,
            ciudad: 'Santiago',
            atiendeOnline: true,
            consentAccepted: true,
            consentVersion: 'v1.0-waitlist-2026',
            website: '',
            renderedAt: Date.now() - 6000,
        }

        it('acepta un profesional válido con registro SIS', () => {
            const result = waitlistProfessionalSchema.safeParse(validPro)
            expect(result.success).toBe(true)
        })

        it('rechaza si la lista de especialidades está vacía', () => {
            const result = waitlistProfessionalSchema.safeParse({
                ...validPro,
                especialidades: [],
            })
            expect(result.success).toBe(false)
        })

        it('rechaza teléfono inválido', () => {
            const result = waitlistProfessionalSchema.safeParse({
                ...validPro,
                whatsapp: '12345',
            })
            expect(result.success).toBe(false)
        })
    })
})
