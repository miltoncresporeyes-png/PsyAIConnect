/*
  Genera reportes diarios retroactivos para construir baseline.
  Uso:
    npm run ops:backfill:3
*/

const { spawnSync } = require('child_process')

function formatDate(date) {
  const y = String(date.getFullYear())
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function run() {
  const days = 3

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const reportDate = formatDate(date)

    console.log(`Generando reporte para ${reportDate}...`)
    const result = spawnSync('npm', ['run', 'ops:report'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        REPORT_DATE: reportDate,
      },
    })

    if (result.status !== 0) {
      process.exit(result.status || 1)
    }
  }

  console.log('Backfill completado.')
}

run()
