/*
  Genera resumen semanal de Fase 5 a partir de CSV diarios.
  Uso:
    npm run ops:weekly
*/

const fs = require('fs')
const path = require('path')

const reportsDir = path.join(process.cwd(), 'docs', 'reports')
const thresholdsPath = path.join(process.cwd(), 'scripts', 'phase5-thresholds.json')

const defaultThresholds = {
  conversion_registro_a_reserva_pct: {
    direction: 'higher_better',
    green: 20,
    yellow: 10,
  },
  conversion_reserva_a_pago_pct: {
    direction: 'higher_better',
    green: 60,
    yellow: 40,
  },
  no_show_pct: {
    direction: 'lower_better',
    green: 10,
    yellow: 20,
  },
  cancelaciones_pct: {
    direction: 'lower_better',
    green: 15,
    yellow: 25,
  },
}

function loadThresholds() {
  if (!fs.existsSync(thresholdsPath)) {
    return defaultThresholds
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'))
    return {
      ...defaultThresholds,
      ...parsed,
    }
  } catch {
    return defaultThresholds
  }
}

function parseNumber(value) {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = String(value).trim()
  if (!normalized || normalized.toUpperCase() === 'N/A') {
    return null
  }

  const numeric = Number(normalized.replace('%', ''))
  return Number.isFinite(numeric) ? numeric : null
}

function avg(values) {
  const valid = values.filter(v => v !== null)
  if (valid.length === 0) {
    return null
  }

  const total = valid.reduce((sum, value) => sum + value, 0)
  return Number((total / valid.length).toFixed(2))
}

function metricTrend(first, last) {
  if (first === null || last === null) {
    return 'N/A'
  }

  const diff = Number((last - first).toFixed(2))
  if (diff === 0) {
    return 'estable (0.00)'
  }

  return diff > 0 ? `alza (+${diff})` : `baja (${diff})`
}

function signalStatus(value, thresholds) {
  if (value === null || value === undefined) {
    return {
      status: 'GRIS',
      reason: 'sin datos',
    }
  }

  if (thresholds.direction === 'higher_better') {
    if (value >= thresholds.green) {
      return { status: 'VERDE', reason: `>= ${thresholds.green}` }
    }

    if (value >= thresholds.yellow) {
      return { status: 'AMARILLO', reason: `>= ${thresholds.yellow} y < ${thresholds.green}` }
    }

    return { status: 'ROJO', reason: `< ${thresholds.yellow}` }
  }

  if (value <= thresholds.green) {
    return { status: 'VERDE', reason: `<= ${thresholds.green}` }
  }

  if (value <= thresholds.yellow) {
    return { status: 'AMARILLO', reason: `> ${thresholds.green} y <= ${thresholds.yellow}` }
  }

  return { status: 'ROJO', reason: `> ${thresholds.yellow}` }
}

function statusRank(status) {
  const rank = {
    ROJO: 3,
    AMARILLO: 2,
    VERDE: 1,
    GRIS: 0,
  }

  return rank[status] ?? 0
}

function summarizeSemaphore(signals, sampleDays) {
  if (sampleDays < 3) {
    return {
      overall: 'AMARILLO',
      note: `muestra limitada (${sampleDays} dia(s))`,
    }
  }

  const statuses = Object.values(signals).map(s => s.status)
  const worst = statuses.sort((a, b) => statusRank(b) - statusRank(a))[0] || 'GRIS'

  if (worst === 'ROJO') {
    return {
      overall: 'ROJO',
      note: 'al menos una metrica critica fuera de umbral',
    }
  }

  if (worst === 'AMARILLO') {
    return {
      overall: 'AMARILLO',
      note: 'tendencia con riesgo moderado, requiere seguimiento',
    }
  }

  if (worst === 'VERDE') {
    return {
      overall: 'VERDE',
      note: 'metricas principales dentro de umbrales',
    }
  }

  return {
    overall: 'GRIS',
    note: 'sin datos suficientes para clasificar',
  }
}

function buildRecommendedActions(signals, sampleDays) {
  const actions = []

  if (sampleDays < 3) {
    actions.push('Aumentar muestra operativa a minimo 3 dias para validar tendencia real.')
  }

  if (signals.conversion_registro_a_reserva_pct.status === 'ROJO') {
    actions.push('Priorizar mejora del embudo de registro: revisar friccion en onboarding y abandono por paso.')
  } else if (signals.conversion_registro_a_reserva_pct.status === 'AMARILLO') {
    actions.push('Ejecutar experimento rapido de UX en registro para empujar conversion a >= 20%.')
  }

  if (signals.conversion_reserva_a_pago_pct.status === 'ROJO') {
    actions.push('Auditar flujo de pago end-to-end (errores, rechazos y tiempos) y aplicar hardening inmediato.')
  } else if (signals.conversion_reserva_a_pago_pct.status === 'AMARILLO') {
    actions.push('Monitorear rechazos de pago por metodo y reducir pasos manuales en checkout.')
  }

  if (signals.no_show_pct.status === 'ROJO') {
    actions.push('Implementar recordatorios y confirmacion previa de cita para reducir no-show > 20%.')
  } else if (signals.no_show_pct.status === 'AMARILLO') {
    actions.push('Refinar politica de recordatorios en ventanas de 24h y 2h antes de la cita.')
  }

  if (signals.cancelaciones_pct.status === 'ROJO') {
    actions.push('Analizar causas top de cancelacion y ajustar reglas de reagendamiento/cancelacion.')
  } else if (signals.cancelaciones_pct.status === 'AMARILLO') {
    actions.push('Segmentar cancelaciones por canal y profesional para detectar cuellos de agenda.')
  }

  if (actions.length === 0) {
    actions.push('Mantener monitoreo y preparar iteraciones de optimizacion incremental.')
  }

  return actions.slice(0, 5)
}

function buildPriorityBacklog(signals, weekCode) {
  const items = []

  if (signals.conversion_registro_a_reserva_pct.status === 'AMARILLO' || signals.conversion_registro_a_reserva_pct.status === 'ROJO') {
    items.push({
      priority: 'HIGH',
      area: 'Embudo',
      task: 'Optimizar conversion registro -> reserva',
      owner: 'Product + Frontend',
      eta: '7 dias',
    })
  }

  if (signals.conversion_reserva_a_pago_pct.status === 'AMARILLO' || signals.conversion_reserva_a_pago_pct.status === 'ROJO') {
    items.push({
      priority: 'HIGH',
      area: 'Pagos',
      task: 'Reducir friccion y fallas en reserva -> pago',
      owner: 'Backend + Payments',
      eta: '7 dias',
    })
  }

  if (signals.no_show_pct.status === 'AMARILLO' || signals.no_show_pct.status === 'ROJO') {
    items.push({
      priority: 'MEDIUM',
      area: 'Operaciones',
      task: 'Reducir no-show con recordatorios y confirmacion previa',
      owner: 'Ops + Product',
      eta: '14 dias',
    })
  }

  if (signals.cancelaciones_pct.status === 'AMARILLO' || signals.cancelaciones_pct.status === 'ROJO') {
    items.push({
      priority: 'MEDIUM',
      area: 'Agenda',
      task: 'Reducir cancelaciones por ajustes en politicas y UX de reagenda',
      owner: 'Product + Backend',
      eta: '14 dias',
    })
  }

  if (items.length === 0) {
    items.push({
      priority: 'LOW',
      area: 'Monitoreo',
      task: 'Mantener baseline estable y ejecutar mejoras incrementales',
      owner: 'Ops + Product',
      eta: 'Continuo',
    })
  }

  const lines = [
    '# Backlog Priorizado - Fase 5',
    '',
    `Semana: ${weekCode}`,
    '',
    '| Prioridad | Area | Tarea | Owner | ETA |',
    '|---|---|---|---|---|',
    ...items.map(item => `| ${item.priority} | ${item.area} | ${item.task} | ${item.owner} | ${item.eta} |`),
    '',
  ]

  return lines.join('\n')
}

function readCsvRows(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8')
  const lines = content.split(/\r?\n/).filter(Boolean)

  if (lines.length < 2) {
    return []
  }

  const header = lines[0].split(',')
  return lines.slice(1).map(line => {
    const cols = line.split(',')
    const row = {}
    header.forEach((key, idx) => {
      row[key] = cols[idx] ?? ''
    })
    return row
  })
}

function collectDailyKpis() {
  if (!fs.existsSync(reportsDir)) {
    return []
  }

  const files = fs
    .readdirSync(reportsDir)
    .filter(file => file.endsWith('_phase5_kpis.csv'))
    .sort()

  return files.map(file => {
    const fullPath = path.join(reportsDir, file)
    const rows = readCsvRows(fullPath)

    const byMetric = {}
    rows.forEach(row => {
      byMetric[row.metric] = parseNumber(row.current_value)
    })

    const date = rows[0]?.date || file.slice(0, 10)

    return {
      date,
      file,
      metrics: {
        registros_nuevos: byMetric.registros_nuevos ?? null,
        reservas_creadas: byMetric.reservas_creadas ?? null,
        pagos_completados: byMetric.pagos_completados ?? null,
        conversion_registro_a_reserva_pct: byMetric.conversion_registro_a_reserva_pct ?? null,
        conversion_reserva_a_pago_pct: byMetric.conversion_reserva_a_pago_pct ?? null,
        no_show_pct: byMetric.no_show_pct ?? null,
        cancelaciones_pct: byMetric.cancelaciones_pct ?? null,
      },
    }
  })
}

function currentYearWeek(date = new Date()) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function run() {
  const thresholds = loadThresholds()
  const daily = collectDailyKpis()
  const weeklySlice = daily.slice(-7)

  if (weeklySlice.length === 0) {
    console.error('No hay CSV diarios para generar review semanal.')
    process.exit(1)
  }

  const firstDay = weeklySlice[0]
  const lastDay = weeklySlice[weeklySlice.length - 1]

  const metrics = {
    registros_nuevos: weeklySlice.map(d => d.metrics.registros_nuevos),
    reservas_creadas: weeklySlice.map(d => d.metrics.reservas_creadas),
    pagos_completados: weeklySlice.map(d => d.metrics.pagos_completados),
    conversion_registro_a_reserva_pct: weeklySlice.map(d => d.metrics.conversion_registro_a_reserva_pct),
    conversion_reserva_a_pago_pct: weeklySlice.map(d => d.metrics.conversion_reserva_a_pago_pct),
    no_show_pct: weeklySlice.map(d => d.metrics.no_show_pct),
    cancelaciones_pct: weeklySlice.map(d => d.metrics.cancelaciones_pct),
  }

  const averages = {
    conversion_registro_a_reserva_pct: avg(metrics.conversion_registro_a_reserva_pct),
    conversion_reserva_a_pago_pct: avg(metrics.conversion_reserva_a_pago_pct),
    no_show_pct: avg(metrics.no_show_pct),
    cancelaciones_pct: avg(metrics.cancelaciones_pct),
  }

  const semaphoreSignals = {
    conversion_registro_a_reserva_pct: signalStatus(averages.conversion_registro_a_reserva_pct, thresholds.conversion_registro_a_reserva_pct),
    conversion_reserva_a_pago_pct: signalStatus(averages.conversion_reserva_a_pago_pct, thresholds.conversion_reserva_a_pago_pct),
    no_show_pct: signalStatus(averages.no_show_pct, thresholds.no_show_pct),
    cancelaciones_pct: signalStatus(averages.cancelaciones_pct, thresholds.cancelaciones_pct),
  }

  const semaphore = summarizeSemaphore(semaphoreSignals, weeklySlice.length)
  const recommendedActions = buildRecommendedActions(semaphoreSignals, weeklySlice.length)

  const weekCode = currentYearWeek(new Date(lastDay.date))
  const outputPath = path.join(reportsDir, `${weekCode}_phase5_weekly_review.md`)

  const review = `# Weekly Review - Fase 5\n\n` +
    `Semana: ${weekCode}\n` +
    `Cobertura de datos: ${firstDay.date} a ${lastDay.date} (${weeklySlice.length} dia(s))\n\n` +
    `## Semaforo de salud\n\n` +
    `- Estado general: ${semaphore.overall}\n` +
    `- Nota: ${semaphore.note}\n` +
    `- Conversion registro -> reserva: ${semaphoreSignals.conversion_registro_a_reserva_pct.status} (${semaphoreSignals.conversion_registro_a_reserva_pct.reason})\n` +
    `- Conversion reserva -> pago: ${semaphoreSignals.conversion_reserva_a_pago_pct.status} (${semaphoreSignals.conversion_reserva_a_pago_pct.reason})\n` +
    `- No-show: ${semaphoreSignals.no_show_pct.status} (${semaphoreSignals.no_show_pct.reason})\n` +
    `- Cancelaciones: ${semaphoreSignals.cancelaciones_pct.status} (${semaphoreSignals.cancelaciones_pct.reason})\n\n` +
    `## Umbrales aplicados\n\n` +
    `- Conversion registro -> reserva: verde >= ${thresholds.conversion_registro_a_reserva_pct.green}, amarillo >= ${thresholds.conversion_registro_a_reserva_pct.yellow}.\n` +
    `- Conversion reserva -> pago: verde >= ${thresholds.conversion_reserva_a_pago_pct.green}, amarillo >= ${thresholds.conversion_reserva_a_pago_pct.yellow}.\n` +
    `- No-show: verde <= ${thresholds.no_show_pct.green}, amarillo <= ${thresholds.no_show_pct.yellow}.\n` +
    `- Cancelaciones: verde <= ${thresholds.cancelaciones_pct.green}, amarillo <= ${thresholds.cancelaciones_pct.yellow}.\n\n` +
    `## Resumen ejecutivo\n\n` +
    `- Registros nuevos promedio/dia: ${avg(metrics.registros_nuevos) ?? 'N/A'}\n` +
    `- Reservas creadas promedio/dia: ${avg(metrics.reservas_creadas) ?? 'N/A'}\n` +
    `- Pagos completados promedio/dia: ${avg(metrics.pagos_completados) ?? 'N/A'}\n` +
    `- Conversion registro -> reserva promedio: ${avg(metrics.conversion_registro_a_reserva_pct) ?? 'N/A'}%\n` +
    `- Conversion reserva -> pago promedio: ${avg(metrics.conversion_reserva_a_pago_pct) ?? 'N/A'}%\n` +
    `- No-show promedio: ${avg(metrics.no_show_pct) ?? 'N/A'}%\n` +
    `- Cancelaciones promedio: ${avg(metrics.cancelaciones_pct) ?? 'N/A'}%\n\n` +
    `## Tendencia (primer dia vs ultimo dia)\n\n` +
    `- Registros nuevos: ${metricTrend(firstDay.metrics.registros_nuevos, lastDay.metrics.registros_nuevos)}\n` +
    `- Reservas creadas: ${metricTrend(firstDay.metrics.reservas_creadas, lastDay.metrics.reservas_creadas)}\n` +
    `- Pagos completados: ${metricTrend(firstDay.metrics.pagos_completados, lastDay.metrics.pagos_completados)}\n` +
    `- Conversion registro -> reserva: ${metricTrend(firstDay.metrics.conversion_registro_a_reserva_pct, lastDay.metrics.conversion_registro_a_reserva_pct)}\n` +
    `- Conversion reserva -> pago: ${metricTrend(firstDay.metrics.conversion_reserva_a_pago_pct, lastDay.metrics.conversion_reserva_a_pago_pct)}\n` +
    `- No-show: ${metricTrend(firstDay.metrics.no_show_pct, lastDay.metrics.no_show_pct)}\n` +
    `- Cancelaciones: ${metricTrend(firstDay.metrics.cancelaciones_pct, lastDay.metrics.cancelaciones_pct)}\n\n` +
    `## Riesgos detectados\n\n` +
    `- Completar con hallazgos cualitativos de reportes diarios e incidentes.\n\n` +
    `## Acciones propuestas (semana siguiente)\n\n` +
    `${recommendedActions.map((action, idx) => `${idx + 1}. ${action}`).join('\n')}\n\n` +
    `## Fuentes\n\n` +
    `${weeklySlice.map(day => `- docs/reports/${day.file}`).join('\n')}\n`

  fs.writeFileSync(outputPath, review, 'utf8')
  const backlogPath = path.join(reportsDir, `${weekCode}_phase5_priority_backlog.md`)
  fs.writeFileSync(backlogPath, buildPriorityBacklog(semaphoreSignals, weekCode), 'utf8')
  console.log(`Weekly review generado: ${outputPath}`)
  console.log(`Backlog priorizado generado: ${backlogPath}`)
}

run()
