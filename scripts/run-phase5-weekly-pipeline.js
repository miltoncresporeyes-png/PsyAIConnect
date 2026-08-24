/*
  Ejecuta pipeline semanal completo de Fase 5:
  1) Baseline (apply)
  2) Weekly review + backlog
  3) Weekly decisions
*/

const { spawnSync } = require('child_process')

function runStep(stepName, args) {
  console.log(`\n==> ${stepName}`)

  let result
  if (process.platform === 'win32') {
    const cmdLine = ['npm', ...args].join(' ')
    result = spawnSync('cmd.exe', ['/d', '/s', '/c', cmdLine], {
      stdio: 'inherit',
      env: process.env,
    })
  } else {
    result = spawnSync('npm', args, {
      stdio: 'inherit',
      env: process.env,
    })
  }

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

function run() {
  runStep('Aplicando baseline', ['run', 'ops:baseline', '--', '--apply'])
  runStep('Generando weekly review', ['run', 'ops:weekly'])
  runStep('Generando acta decisiones', ['run', 'ops:decisions'])
  runStep('Generando snapshot fase 5', ['run', 'ops:status'])
  runStep('Generando snapshot go-live', ['run', 'ops:golive:status'])
  console.log('\nPipeline semanal completado.')
}

run()
