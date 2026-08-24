/**
 * Test script for SII Webhook
 * Use this to test the webhook endpoint locally
 */

const WEBHOOK_URL = process.env.SII_WEBHOOK_URL || 'http://localhost:3000/api/sii/webhook'
const WEBHOOK_SECRET = process.env.SII_WEBHOOK_SECRET || 'test-secret'

import { createHash } from 'crypto'

function generateSignature(payload: string): string {
  return createHash('sha256')
    .update(payload + WEBHOOK_SECRET)
    .digest('hex')
}

const testCases = [
  {
    name: 'Boleta aceptada',
    payload: {
      tipo_dte: 41,
      folio: '5001',
      estado: 'ACEPTADO',
      mensaje: 'Documento recibido exitosamente',
      id_referencia: 'appointment-123',
      fecha_emision: '2026-02-13',
      url_pdf: 'https://api.lioren.cl/documentos/5001.pdf',
      track_id: 'TRACK-5001',
    },
  },
  {
    name: 'Boleta rechazada',
    payload: {
      tipo_dte: 41,
      folio: '5002',
      estado: 'RECHAZADO',
      mensaje: 'RUT receptor inválido',
      id_referencia: 'appointment-124',
    },
  },
  {
    name: 'Boleta anulada',
    payload: {
      tipo_dte: 41,
      folio: '5003',
      estado: 'ANULADO',
      mensaje: 'Documento anulado por el emisor',
      id_referencia: 'appointment-125',
    },
  },
]

async function testWebhook(testCase: typeof testCases[0]) {
  const payload = JSON.stringify(testCase.payload)
  const signature = generateSignature(payload)

  console.log(`\n📤 Testing: ${testCase.name}`)
  console.log('Payload:', JSON.stringify(testCase.payload, null, 2))

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sii-signature': signature,
      },
      body: payload,
    })

    const result = await response.json()
    console.log(`Response (${response.status}):`, result)

    if (response.ok) {
      console.log('✅ Test passed')
    } else {
      console.log('❌ Test failed')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function main() {
  console.log('🧪 SII Webhook Test Suite')
  console.log('========================')

  for (const testCase of testCases) {
    await testWebhook(testCase)
  }

  console.log('\n✅ All tests completed')
}

main()
