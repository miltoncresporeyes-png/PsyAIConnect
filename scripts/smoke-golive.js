/*
  Smoke tests de Go-Live (Fase 4)
  Uso:
  BASE_URL=http://localhost:3000 node scripts/smoke-golive.js
*/

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function check(name, fn) {
  const startedAt = Date.now()
  try {
    const result = await fn()
    const elapsed = Date.now() - startedAt
    console.log(`PASS ${name} (${elapsed}ms)`, result ? `- ${result}` : '')
    return { name, ok: true, elapsed }
  } catch (error) {
    const elapsed = Date.now() - startedAt
    console.error(`FAIL ${name} (${elapsed}ms)`, error.message)
    return { name, ok: false, elapsed, error: error.message }
  }
}

async function expectStatus(path, options, expectedStatuses) {
  const response = await fetch(`${baseUrl}${path}`, options)
  if (!expectedStatuses.includes(response.status)) {
    const body = await response.text()
    throw new Error(`status ${response.status}, expected ${expectedStatuses.join(', ')}. body=${body}`)
  }

  return `status ${response.status}`
}

async function run() {
  console.log(`Running smoke tests against ${baseUrl}`)

  const results = []

  results.push(
    await check('Health launch endpoint', () =>
      expectStatus('/api/health/launch', { method: 'GET' }, [200, 503])
    )
  )

  results.push(
    await check('Auth verify-code validates payload', () =>
      expectStatus(
        '/api/auth/verify-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send' }),
        },
        [400, 429]
      )
    )
  )

  results.push(
    await check('Pre-reservation confirm requires auth', () =>
      expectStatus(
        '/api/pre-reservation/confirm',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'smoke-test-token' }),
        },
        [401, 429]
      )
    )
  )

  const failed = results.filter(item => !item.ok)
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed`)

  if (failed.length > 0) {
    process.exitCode = 1
  }
}

run().catch(error => {
  console.error('Smoke run failed:', error)
  process.exit(1)
})
