/*
  Snapshot de readiness para cierre total de Fase 4.
  Uso:
    npm run ops:golive:status
*/

const fs = require('fs')
const path = require('path')

const reportsDir = path.join(process.cwd(), 'docs', 'reports')

function isStrictMode() {
  return process.argv.includes('--strict')
}

function exists(relPath) {
  return fs.existsSync(path.join(process.cwd(), relPath))
}

function getEnvFlag(name) {
  const value = process.env[name]
  if (!value || !value.trim()) return { ok: false, reason: 'no configurada' }

  const normalized = value.trim().toLowerCase()
  if (normalized.includes('placeholder')) {
    return { ok: false, reason: 'valor placeholder detectado' }
  }

  return { ok: true, reason: 'configurada' }
}

function readLatestTaskResult(taskName) {
  const cmd = require('child_process').spawnSync(
    'powershell',
    ['-Command', `schtasks /Query /TN ${taskName} /V /FO LIST`],
    { encoding: 'utf8' }
  )

  if (cmd.status !== 0 || !cmd.stdout) {
    return 'N/A'
  }

  const match = cmd.stdout.match(/Último resultado:\s*([^\r\n]+)/)
  return match ? match[1].trim() : 'N/A'
}

function run() {
  const strictMode = isStrictMode()
  const webhook = getEnvFlag('OPS_ALERT_WEBHOOK_URL')
  const taskDailyResult = readLatestTaskResult('PsyConnect-Phase5-OpsReport')
  const taskWeeklyResult = readLatestTaskResult('PsyConnect-Phase5-WeeklyReview')

  const checks = [
    {
      id: 'F4-CHECK-001',
      name: 'Evidencia smoke local',
      ok: exists('docs/PHASE4_SMOKE_EVIDENCE.md'),
      detail: 'docs/PHASE4_SMOKE_EVIDENCE.md',
    },
    {
      id: 'F4-CHECK-002',
      name: 'Playbook/acta cierre parcial',
      ok: exists('docs/PHASE4_CIERRE_PARCIAL_Y_PLAN_FASE5.md'),
      detail: 'docs/PHASE4_CIERRE_PARCIAL_Y_PLAN_FASE5.md',
    },
    {
      id: 'F4-CHECK-003',
      name: 'Webhook OPS real',
      ok: strictMode ? webhook.ok : true,
      detail: strictMode ? webhook.reason : `omitido en local (${webhook.reason})`,
    },
    {
      id: 'F4-CHECK-004',
      name: 'Scheduler diario operativo',
      ok: taskDailyResult === '0',
      detail: `ultimo resultado=${taskDailyResult}`,
    },
    {
      id: 'F4-CHECK-005',
      name: 'Scheduler semanal operativo',
      ok: taskWeeklyResult === '0',
      detail: `ultimo resultado=${taskWeeklyResult}`,
    },
    {
      id: 'F4-CHECK-006',
      name: 'Snapshot readiness generado',
      ok: exists('docs/reports/phase5_progress_snapshot.md'),
      detail: 'docs/reports/phase5_progress_snapshot.md',
    },
  ]

  const done = checks.filter(item => item.ok).length
  const total = checks.length
  const blockers = checks.filter(item => !item.ok)
  const ready = blockers.length === 0

  const output = [
    '# Go-Live Readiness Snapshot',
    '',
    `Fecha: ${new Date().toISOString()}`,
    `Modo: ${strictMode ? 'STRICT' : 'LOCAL'}`,
    `Estado: ${ready ? (strictMode ? 'READY' : 'LOCAL_READY') : 'BLOCKED'}`,
    `Progreso: ${done}/${total}`,
    '',
    '## Checks',
    '',
    ...checks.map(item => `- [${item.ok ? 'x' : ' '}] ${item.id} ${item.name} (${item.detail})`),
    '',
    '## Bloqueantes',
    '',
    ...(blockers.length === 0
      ? ['- Ninguno.']
      : blockers.map(item => `- ${item.id} ${item.name}: ${item.detail}`)),
    '',
  ].join('\n')

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })
  const outputFile = strictMode
    ? 'go_live_readiness_snapshot_strict.md'
    : 'go_live_readiness_snapshot_local.md'
  const outputPath = path.join(reportsDir, outputFile)
  fs.writeFileSync(outputPath, output, 'utf8')

  console.log(`Readiness generado: ${outputPath}`)
}

run()
