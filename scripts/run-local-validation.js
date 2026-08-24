/*
  Validacion integral para pruebas locales.
  Uso:
    npm run ops:local:validate
*/

const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

const reportsDir = path.join(process.cwd(), 'docs', 'reports')
const localValidatePort = process.env.LOCAL_VALIDATE_PORT || '3100'
const baseUrl = process.env.LOCAL_VALIDATE_BASE_URL || `http://localhost:${localValidatePort}`

function validationEnv() {
  const env = {
    ...process.env,
    BASE_URL: baseUrl,
  }

  if (!env.PORT) {
    try {
      const parsed = new URL(baseUrl)
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        env.PORT = parsed.port || localValidatePort
      }
    } catch {
      env.PORT = localValidatePort
    }
  }

  return env
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function runNpm(args, label) {
  let result
  if (process.platform === 'win32') {
    result = spawnSync('cmd.exe', ['/d', '/s', '/c', ['npm', ...args].join(' ')], {
      stdio: 'inherit',
      env: validationEnv(),
    })
  } else {
    const command = npmCommand()
    result = spawnSync(command, args, {
      stdio: 'inherit',
      env: validationEnv(),
    })
  }

  if (result.status !== 0) {
    throw new Error(`${label} fallo con codigo ${result.status || 1}`)
  }
}

async function waitForHealth(url, timeoutMs = 120000) {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' })
      if (response.status === 200 || response.status === 503) {
        return
      }
    } catch {
      // keep polling
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  throw new Error(`Timeout esperando health endpoint: ${url}`)
}

function startDevServer() {
  let child
  if (process.platform === 'win32') {
    child = spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev'], {
      stdio: 'inherit',
      env: validationEnv(),
    })
  } else {
    const command = npmCommand()
    child = spawn(command, ['run', 'dev'], {
      stdio: 'inherit',
      env: validationEnv(),
    })
  }

  return child
}

function stopDevServer(child) {
  if (!child || child.killed) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }

  child.kill('SIGTERM')
}

async function run() {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const steps = []
  const startedAt = new Date().toISOString()
  const dev = startDevServer()

  try {
    await waitForHealth(`${baseUrl}/api/health/launch`)
    steps.push({ step: 'dev_server_ready', ok: true })

    runNpm(['run', 'test'], 'tests')
    steps.push({ step: 'tests', ok: true })

    runNpm(['run', 'smoke:golive'], 'smoke_golive')
    steps.push({ step: 'smoke_golive', ok: true })

    runNpm(['run', 'ops:report'], 'ops_report')
    steps.push({ step: 'ops_report', ok: true })

    runNpm(['run', 'ops:status'], 'ops_status')
    steps.push({ step: 'ops_status', ok: true })

    runNpm(['run', 'ops:golive:status'], 'ops_golive_status_local')
    steps.push({ step: 'ops_golive_status_local', ok: true })
  } catch (error) {
    steps.push({
      step: 'pipeline',
      ok: false,
      error: error instanceof Error ? error.message : 'error desconocido',
    })
    throw error
  } finally {
    stopDevServer(dev)
  }

  const finishedAt = new Date().toISOString()
  const output = [
    '# Validacion Local - Resultado',
    '',
    `Inicio: ${startedAt}`,
    `Fin: ${finishedAt}`,
    `Base URL: ${baseUrl}`,
    '',
    '## Pasos',
    '',
    ...steps.map(s => `- [${s.ok ? 'x' : ' '}] ${s.step}${s.error ? ` (${s.error})` : ''}`),
    '',
  ].join('\n')

  fs.writeFileSync(path.join(reportsDir, 'local_validation_latest.md'), output, 'utf8')
  console.log('Validacion local completada: docs/reports/local_validation_latest.md')
}

run().catch(error => {
  const output = [
    '# Validacion Local - Error',
    '',
    `Fecha: ${new Date().toISOString()}`,
    `Error: ${error instanceof Error ? error.message : 'desconocido'}`,
    '',
  ].join('\n')

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  fs.writeFileSync(path.join(reportsDir, 'local_validation_latest.md'), output, 'utf8')
  process.exit(1)
})
