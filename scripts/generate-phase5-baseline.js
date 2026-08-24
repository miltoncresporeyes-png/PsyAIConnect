/*
  Genera baseline de 3+ dias y sugiere ajuste de umbrales.
  Uso:
    npm run ops:baseline
    npm run ops:baseline -- --apply
*/

const fs = require('fs')
const path = require('path')

const reportsDir = path.join(process.cwd(), 'docs', 'reports')
const thresholdsPath = path.join(process.cwd(), 'scripts', 'phase5-thresholds.json')

const metricDefinitions = [
  { key: 'conversion_registro_a_reserva_pct', label: 'Conversion registro -> reserva', direction: 'higher_better' },
  { key: 'conversion_reserva_a_pago_pct', label: 'Conversion reserva -> pago', direction: 'higher_better' },
  { key: 'no_show_pct', label: 'No-show', direction: 'lower_better' },
  { key: 'cancelaciones_pct', label: 'Cancelaciones', direction: 'lower_better' },
]

function parseNumber(value) {
  if (value === undefined || value === null) return null
  const str = String(value).trim()
  if (!str || str.toUpperCase() === 'N/A') return null
  const n = Number(str.replace('%', ''))
  return Number.isFinite(n) ? n : null
}

function avg(values) {
  const valid = values.filter(v => v !== null)
  if (valid.length === 0) return null
  return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
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

function collectDailyMetrics() {
  if (!fs.existsSync(reportsDir)) return []

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('_phase5_kpis.csv')).sort()
  return files.map(file => {
    const rows = readCsvRows(path.join(reportsDir, file))
    const date = rows[0]?.date || file.slice(0, 10)
    const values = {}
    rows.forEach(row => {
      values[row.metric] = parseNumber(row.current_value)
    })
    return { file, date, values }
  })
}

function loadCurrentThresholds() {
  if (!fs.existsSync(thresholdsPath)) {
    throw new Error(`No se encontro archivo de umbrales: ${thresholdsPath}`)
  }
  return JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'))
}

function suggestThreshold(definition, baselineAvg, current) {
  if (baselineAvg === null) {
    return { ...current }
  }

  if (definition.direction === 'higher_better') {
    const green = clamp(Math.round(baselineAvg * 1.1), 5, 95)
    const yellow = clamp(Math.round(green * 0.6), 3, green - 1)
    return {
      direction: definition.direction,
      green,
      yellow,
    }
  }

  const green = clamp(Math.round(baselineAvg * 0.9), 0, 80)
  const yellow = clamp(Math.round(Math.max(green + 1, baselineAvg * 1.3)), green + 1, 95)
  return {
    direction: definition.direction,
    green,
    yellow,
  }
}

function buildReport(slice, baseline, currentThresholds, suggestedThresholds, canCalibrate) {
  const weekHint = slice.length > 0 ? `${slice[0].date} -> ${slice[slice.length - 1].date}` : 'sin datos'
  const lines = [
    '# Baseline y Ajuste de Umbrales - Fase 5',
    '',
    `Cobertura usada: ${weekHint} (${slice.length} dia(s))`,
    '',
    '## Estado de baseline',
    '',
    canCalibrate
      ? '- Baseline suficiente: SI (>= 3 dias).'
      : '- Baseline suficiente: NO (se requieren al menos 3 dias para calibrar).',
    '',
    '## Promedios observados (DB)',
    '',
    ...metricDefinitions.map(def => `- ${def.label}: ${baseline[def.key] === null ? 'N/A' : `${baseline[def.key]}%`}`),
    '',
    '## Umbrales actuales',
    '',
    ...metricDefinitions.map(def => {
      const t = currentThresholds[def.key]
      return `- ${def.label}: verde ${def.direction === 'higher_better' ? '>=' : '<='} ${t.green}, amarillo ${def.direction === 'higher_better' ? '>=' : '<='} ${t.yellow}`
    }),
    '',
    '## Umbrales sugeridos',
    '',
    ...metricDefinitions.map(def => {
      const t = suggestedThresholds[def.key]
      return `- ${def.label}: verde ${def.direction === 'higher_better' ? '>=' : '<='} ${t.green}, amarillo ${def.direction === 'higher_better' ? '>=' : '<='} ${t.yellow}`
    }),
    '',
    '## Recomendacion',
    '',
    canCalibrate
      ? '- Puedes aplicar umbrales sugeridos con: `npm run ops:baseline -- --apply`.'
      : '- Mantener umbrales actuales y volver a ejecutar cuando haya >= 3 dias.',
    '',
  ]

  return lines.join('\n')
}

function run() {
  const shouldApply = process.argv.includes('--apply')
  const daily = collectDailyMetrics()
  const slice = daily.slice(-7)
  const canCalibrate = slice.length >= 3

  const currentThresholds = loadCurrentThresholds()

  const baseline = {}
  metricDefinitions.forEach(def => {
    baseline[def.key] = avg(slice.map(day => day.values[def.key] ?? null))
  })

  const suggestedThresholds = {}
  metricDefinitions.forEach(def => {
    suggestedThresholds[def.key] = suggestThreshold(
      def,
      canCalibrate ? baseline[def.key] : null,
      currentThresholds[def.key]
    )
  })

  const outputPath = path.join(reportsDir, 'phase5_baseline_thresholds.md')
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(
    outputPath,
    buildReport(slice, baseline, currentThresholds, suggestedThresholds, canCalibrate),
    'utf8'
  )

  if (shouldApply && canCalibrate) {
    fs.writeFileSync(thresholdsPath, JSON.stringify(suggestedThresholds, null, 2) + '\n', 'utf8')
    console.log(`Umbrales actualizados: ${thresholdsPath}`)
  } else if (shouldApply && !canCalibrate) {
    console.log('No se aplicaron cambios: baseline insuficiente (< 3 dias).')
  }

  console.log(`Reporte baseline generado: ${outputPath}`)
}

run()
