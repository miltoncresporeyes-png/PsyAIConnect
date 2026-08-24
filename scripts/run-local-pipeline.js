/*
  Pipeline completo en entorno local.
  Uso:
    npm run ops:local:pipeline
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
  runStep('Validacion local integral', ['run', 'ops:local:validate'])
  runStep('Pipeline semanal local', ['run', 'ops:weekly:pipeline'])
  console.log('\nPipeline local completado correctamente.')
}

run()
