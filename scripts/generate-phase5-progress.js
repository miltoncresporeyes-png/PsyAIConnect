/*
  Snapshot rapido del avance de Fase 5.
  Uso:
    npm run ops:status
*/

const fs = require('fs')
const path = require('path')

const reportsDir = path.join(process.cwd(), 'docs', 'reports')

function parseNumber(value) {
  if (value === undefined || value === null) return null
  const str = String(value).trim()
  if (!str || str.toUpperCase() === 'N/A') return null
  const n = Number(str.replace('%', ''))
  return Number.isFinite(n) ? n : null
}

function readCsvRows(csvPath) {
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const header = lines[0].split(',')
  return lines.slice(1).map(line => {
    const cols = line.split(',')
    const row = {}
    header.forEach((h, i) => {
      row[h] = cols[i] ?? ''
    })
    return row
  })
}

function readLatestWeeklyReview() {
  if (!fs.existsSync(reportsDir)) return null
  const file = fs
    .readdirSync(reportsDir)
    .filter(name => name.endsWith('_phase5_weekly_review.md'))
    .sort()
    .pop()

  if (!file) return null

  const content = fs.readFileSync(path.join(reportsDir, file), 'utf8')
  const overallMatch = content.match(/- Estado general:\s*(.+)/)
  const noteMatch = content.match(/- Nota:\s*(.+)/)

  return {
    file,
    overall: overallMatch ? overallMatch[1].trim() : 'N/A',
    note: noteMatch ? noteMatch[1].trim() : 'N/A',
  }
}

function run() {
  if (!fs.existsSync(reportsDir)) {
    throw new Error('No existe docs/reports. Ejecuta ops:report primero.')
  }

  const csvFiles = fs
    .readdirSync(reportsDir)
    .filter(name => name.endsWith('_phase5_kpis.csv'))
    .sort()

  const recent = csvFiles.slice(-7)
  const byDay = recent.map(file => {
    const rows = readCsvRows(path.join(reportsDir, file))
    const date = rows[0]?.date || file.slice(0, 10)
    const map = {}
    rows.forEach(row => {
      map[row.metric] = parseNumber(row.current_value)
    })
    return {
      date,
      conversionRegistroReserva: map.conversion_registro_a_reserva_pct,
      conversionReservaPago: map.conversion_reserva_a_pago_pct,
      noShow: map.no_show_pct,
      cancelaciones: map.cancelaciones_pct,
    }
  })

  const usableDays = byDay.filter(day => {
    return [
      day.conversionRegistroReserva,
      day.conversionReservaPago,
      day.noShow,
      day.cancelaciones,
    ].some(v => v !== null)
  }).length

  const weekly = readLatestWeeklyReview()
  const readyForCalibration = byDay.length >= 3
  const readyForSignal = usableDays >= 3

  const output = [
    '# Snapshot de Avance - Fase 5',
    '',
    `Fecha de ejecucion: ${new Date().toISOString()}`,
    '',
    '## Estado de datos',
    '',
    `- CSV diarios detectados (ultimos 7): ${byDay.length}`,
    `- Dias con senal util (al menos una metrica no N/A): ${usableDays}`,
    `- Listo para calibrar umbrales (>=3 dias): ${readyForCalibration ? 'SI' : 'NO'}`,
    `- Listo para semaforo robusto (>=3 dias con senal): ${readyForSignal ? 'SI' : 'NO'}`,
    '',
    '## Semaforo semanal actual',
    '',
    weekly
      ? `- Archivo: docs/reports/${weekly.file}`
      : '- Archivo: N/A',
    weekly ? `- Estado general: ${weekly.overall}` : '- Estado general: N/A',
    weekly ? `- Nota: ${weekly.note}` : '- Nota: N/A',
    '',
    '## Proxima accion recomendada',
    '',
    readyForSignal
      ? '- Ejecutar `npm run ops:weekly:pipeline` y priorizar backlog automatico por semaforo.'
      : '- Mantener ejecucion diaria de `ops:report` hasta alcanzar >=3 dias con senal util.',
    '',
  ].join('\n')

  const outputPath = path.join(reportsDir, 'phase5_progress_snapshot.md')
  fs.writeFileSync(outputPath, output, 'utf8')
  console.log(`Snapshot generado: ${outputPath}`)
}

run()
