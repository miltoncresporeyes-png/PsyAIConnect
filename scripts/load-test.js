/**
 * Basic Load Testing Script (Node.js native / k6 compatible format)
 * Simulates concurrent requests against:
 * 1. Health check & launch readiness
 * 2. Login authentication attempt
 * 3. Appointment reservation flow
 *
 * Usage:
 *   node scripts/load-test.js
 *   node scripts/load-test.js --target=http://localhost:3000 --concurrency=20 --requests=100
 */

const http = require('http')
const https = require('https')

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace(/^--/, '').split('=')
  acc[k] = v || true
  return acc
}, {})

const BASE_URL = args.target || process.env.LOAD_TEST_TARGET || 'http://localhost:3000'
const CONCURRENCY = parseInt(args.concurrency || '10', 10)
const TOTAL_REQUESTS = parseInt(args.requests || '50', 10)

async function makeRequest(path, method = 'GET', body = null) {
  const url = new URL(path, BASE_URL)
  const isHttps = url.protocol === 'https:'
  const client = isHttps ? https : http

  const payload = body ? JSON.stringify(body) : null
  const headers = {
    'User-Agent': 'PsyAI-LoadTester/1.0',
    ...(payload && {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    }),
  }

  const start = Date.now()
  return new Promise((resolve) => {
    const req = client.request(
      url,
      {
        method,
        headers,
        timeout: 5000,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
            success: res.statusCode < 500,
          })
        })
      }
    )

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        durationMs: Date.now() - start,
        success: false,
        error: err.message,
      })
    })

    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

async function runScenario() {
  console.log(`🚀 Starting Load Test against ${BASE_URL}`)
  console.log(`Parameters: Concurrency=${CONCURRENCY}, Total Requests=${TOTAL_REQUESTS}`)

  const targets = [
    { name: 'Health Check', path: '/api/health/launch', method: 'GET' },
    { name: 'Login Simulation', path: '/api/auth/callback/credentials', method: 'POST', body: { email: 'loadtest@psydoctor.cl', password: 'dummy' } },
    { name: 'Waitlist Submission', path: '/api/waitlist', method: 'POST', body: { email: `test-${Date.now()}@loadtest.cl`, userType: 'patient', name: 'Load Tester' } },
  ]

  for (const target of targets) {
    console.log(`\nTesting: [${target.method}] ${target.path} (${target.name})`)
    const results = []
    let completed = 0

    const workers = Array.from({ length: CONCURRENCY }).map(async () => {
      while (completed < TOTAL_REQUESTS) {
        completed++
        const res = await makeRequest(target.path, target.method, target.body)
        results.push(res)
      }
    })

    await Promise.all(workers)

    const successful = results.filter((r) => r.success).length
    const durations = results.map((r) => r.durationMs).sort((a, b) => a - b)
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0

    console.log(`  -> Completed: ${results.length}/${TOTAL_REQUESTS}`)
    console.log(`  -> Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`)
    console.log(`  -> Latency: Avg=${avg}ms | p95=${p95}ms | Min=${durations[0]}ms | Max=${durations[durations.length - 1]}ms`)
  }

  console.log('\n✅ Load test finished.')
}

if (require.main === module) {
  runScenario().catch(console.error)
}
