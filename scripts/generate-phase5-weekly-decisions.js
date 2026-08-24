/*
  Genera acta de decisiones semanal de Fase 5.
  Uso:
    npm run ops:decisions
*/

const fs = require('fs')
const path = require('path')

const reportsDir = path.join(process.cwd(), 'docs', 'reports')

function currentYearWeek(date = new Date()) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function parseBacklogItems(backlogPath) {
  if (!fs.existsSync(backlogPath)) {
    return []
  }

  const lines = fs.readFileSync(backlogPath, 'utf8').split(/\r?\n/)
  const rows = lines.filter(line => line.startsWith('| ') && !line.includes('|---|'))

  return rows
    .map(row => row.split('|').map(part => part.trim()).filter(Boolean))
    .filter(cols => cols.length >= 5)
    .filter(cols => cols[0].toLowerCase() !== 'prioridad')
    .map(cols => ({
      priority: cols[0],
      area: cols[1],
      task: cols[2],
      owner: cols[3],
      eta: cols[4],
    }))
}

function run() {
  const weekCode = currentYearWeek()
  const backlogPath = path.join(reportsDir, `${weekCode}_phase5_priority_backlog.md`)
  const reviewPath = path.join(reportsDir, `${weekCode}_phase5_weekly_review.md`)
  const outputPath = path.join(reportsDir, `${weekCode}_phase5_decisions.md`)

  const items = parseBacklogItems(backlogPath)

  const content = `# Acta de Decisiones - Fase 5\n\n` +
    `Semana: ${weekCode}\n\n` +
    `## Contexto\n\n` +
    `- Review semanal: docs/reports/${weekCode}_phase5_weekly_review.md\n` +
    `- Backlog priorizado: docs/reports/${weekCode}_phase5_priority_backlog.md\n\n` +
    `## Decision de estado\n\n` +
    `- Estado semanal acordado: \n` +
    `- Justificacion: \n\n` +
    `## Compromisos de ejecucion (semana siguiente)\n\n` +
    (items.length > 0
      ? items.map((item, idx) => `${idx + 1}. [${item.priority}] ${item.task} | Owner: ${item.owner} | ETA: ${item.eta}`).join('\n') + '\n\n'
      : '- Sin items detectados en backlog automatico.\n\n') +
    `## Riesgos escalados\n\n` +
    `- Riesgo 1: \n` +
    `- Mitigacion 1: \n\n` +
    `## Aprobaciones\n\n` +
    `- Ops: \n` +
    `- Tech Lead: \n` +
    `- Product: \n\n` +
    `## Notas\n\n` +
    `- Completar este acta inmediatamente despues del ritual semanal.\n` +
    `- Si hubo incidentes P1/P2, anexar IDs de incidentes al cierre.\n`

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, content, 'utf8')

  if (!fs.existsSync(reviewPath)) {
    console.warn(`Aviso: no se encontro review semanal en ${reviewPath}`)
  }

  if (!fs.existsSync(backlogPath)) {
    console.warn(`Aviso: no se encontro backlog semanal en ${backlogPath}`)
  }

  console.log(`Acta semanal generada: ${outputPath}`)
}

run()
