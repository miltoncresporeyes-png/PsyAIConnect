/*
  Genera reporte diario operativo para Fase 5.
  Uso:
    BASE_URL=http://localhost:3000 npm run ops:report
*/

const fs = require('fs')
const path = require('path')

function loadPrismaClient() {
  const generatedClientPath = path.join(__dirname, '..', 'src', 'generated', 'client')

  try {
    // Prefer project generated client
    return require(generatedClientPath).PrismaClient
  } catch {
    // Fallback when generated client is not available in workspace
    return require('@prisma/client').PrismaClient
  }
}

const PrismaClient = loadPrismaClient()

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

function resolveBaseDate(raw) {
  if (!raw) {
    return new Date()
  }

  const simpleDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (simpleDate) {
    const year = Number(simpleDate[1])
    const month = Number(simpleDate[2])
    const day = Number(simpleDate[3])
    const localDate = new Date(year, month - 1, day)

    if (!Number.isNaN(localDate.getTime())) {
      return localDate
    }
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`REPORT_DATE invalida: ${raw}`)
  }

  return parsed
}

const baseDate = resolveBaseDate(process.env.REPORT_DATE)
const yyyy = String(baseDate.getFullYear())
const mm = String(baseDate.getMonth() + 1).padStart(2, '0')
const dd = String(baseDate.getDate()).padStart(2, '0')
const reportDate = `${yyyy}-${mm}-${dd}`

function isoDate(date) {
  const y = String(date.getFullYear())
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function getHealthStatus() {
  try {
    const response = await fetch(`${baseUrl}/api/health/launch`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    const body = await response.json().catch(() => ({}))

    return {
      ok: true,
      statusCode: response.status,
      status: body.status || 'unknown',
      checks: body.checks || {},
    }
  } catch (error) {
    return {
      ok: false,
      statusCode: 0,
      status: 'unreachable',
      checks: {},
      error: error instanceof Error ? error.message : 'unknown error',
    }
  }
}

function dayWindow(date = new Date()) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function percent(part, total) {
  if (!total || total <= 0) {
    return null
  }

  return Number(((part / total) * 100).toFixed(2))
}

async function getDbKpis() {
  return getDbKpisForDate(baseDate)
}

async function getDbKpisForDate(targetDate) {
  const prisma = new PrismaClient()
  const { start, end } = dayWindow(targetDate)

  try {
    const [
      newRegistrations,
      reservations,
      completedPayments,
      noShowAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.appointment.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.payment.count({
        where: {
          status: 'COMPLETED',
          OR: [
            {
              paidAt: {
                gte: start,
                lte: end,
              },
            },
            {
              paidAt: null,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          ],
        },
      }),
      prisma.appointment.count({
        where: {
          status: 'NO_SHOW',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.appointment.count({
        where: {
          status: 'CANCELLED',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
    ])

    return {
      ok: true,
      date: isoDate(targetDate),
      dateWindow: { start: start.toISOString(), end: end.toISOString() },
      newRegistrations,
      reservations,
      completedPayments,
      conversionRegisterToReservation: percent(reservations, newRegistrations),
      conversionReservationToPayment: percent(completedPayments, reservations),
      noShowRate: percent(noShowAppointments, reservations),
      cancellationRate: percent(cancelledAppointments, reservations),
    }
  } catch (error) {
    return {
      ok: false,
      date: isoDate(targetDate),
      error: error instanceof Error ? error.message : 'unknown error',
    }
  } finally {
    await prisma.$disconnect()
  }
}

function formatMetric(value, suffix = '') {
  if (value === null || value === undefined) {
    return 'N/A'
  }

  return `${value}${suffix}`
}

function dayOverDayDelta(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return null
  }

  if (previous === 0) {
    if (current === 0) {
      return 0
    }
    return null
  }

  return Number((((current - previous) / previous) * 100).toFixed(2))
}

function formatDelta(delta) {
  if (delta === null || delta === undefined) {
    return 'N/A'
  }

  if (delta === 0) {
    return '0.00%'
  }

  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(2)}%`
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsvReport(current, previous) {
  const fields = [
    {
      key: 'newRegistrations',
      label: 'registros_nuevos',
    },
    {
      key: 'reservations',
      label: 'reservas_creadas',
    },
    {
      key: 'completedPayments',
      label: 'pagos_completados',
    },
    {
      key: 'conversionRegisterToReservation',
      label: 'conversion_registro_a_reserva_pct',
    },
    {
      key: 'conversionReservationToPayment',
      label: 'conversion_reserva_a_pago_pct',
    },
    {
      key: 'noShowRate',
      label: 'no_show_pct',
    },
    {
      key: 'cancellationRate',
      label: 'cancelaciones_pct',
    },
  ]

  const header = [
    'date',
    'metric',
    'current_value',
    'previous_date',
    'previous_value',
    'delta_pct',
  ].join(',')

  const lines = fields.map(field => {
    const currentValue = current[field.key]
    const previousValue = previous.ok ? previous[field.key] : ''
    const delta = previous.ok ? dayOverDayDelta(currentValue, previousValue) : null

    return [
      csvEscape(current.date),
      csvEscape(field.label),
      csvEscape(currentValue ?? 'N/A'),
      csvEscape(previous.ok ? previous.date : 'N/A'),
      csvEscape(previous.ok ? (previousValue ?? 'N/A') : 'N/A'),
      csvEscape(formatDelta(delta)),
    ].join(',')
  })

  return [header, ...lines].join('\n') + '\n'
}

function boolMark(value) {
  return value ? 'OK' : 'PENDING'
}

async function run() {
  const health = await getHealthStatus()
  const dbKpis = await getDbKpis()

  const yesterday = new Date(baseDate)
  yesterday.setDate(yesterday.getDate() - 1)
  const previousDbKpis = await getDbKpisForDate(yesterday)

  const deltaLines = dbKpis.ok && previousDbKpis.ok
    ? [
        `- Delta registros nuevos (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.newRegistrations, previousDbKpis.newRegistrations))}`,
        `- Delta reservas creadas (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.reservations, previousDbKpis.reservations))}`,
        `- Delta pagos completados (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.completedPayments, previousDbKpis.completedPayments))}`,
        `- Delta conversion registro -> reserva (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.conversionRegisterToReservation, previousDbKpis.conversionRegisterToReservation))}`,
        `- Delta conversion reserva -> pago (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.conversionReservationToPayment, previousDbKpis.conversionReservationToPayment))}`,
        `- Delta no-show (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.noShowRate, previousDbKpis.noShowRate))}`,
        `- Delta cancelaciones (vs ${previousDbKpis.date}): ${formatDelta(dayOverDayDelta(dbKpis.cancellationRate, previousDbKpis.cancellationRate))}`,
      ].join('\n')
    : `- No se pudo calcular comparativa diaria (hoy: ${dbKpis.ok ? 'OK' : 'ERROR'}, ayer: ${previousDbKpis.ok ? 'OK' : 'ERROR'}).`

  const dbKpisBlock = dbKpis.ok
    ? [
        `- Registros nuevos (DB): ${dbKpis.newRegistrations}`,
        `- Reservas creadas (DB): ${dbKpis.reservations}`,
        `- Pagos completados (DB): ${dbKpis.completedPayments}`,
        `- Conversion registro -> reserva (DB): ${formatMetric(dbKpis.conversionRegisterToReservation, '%')}`,
        `- Conversion reserva -> pago (DB): ${formatMetric(dbKpis.conversionReservationToPayment, '%')}`,
        `- No-show (DB): ${formatMetric(dbKpis.noShowRate, '%')}`,
        `- Cancelaciones (DB): ${formatMetric(dbKpis.cancellationRate, '%')}`,
        `- Ventana analizada (DB): ${dbKpis.dateWindow.start} a ${dbKpis.dateWindow.end}`,
      ].join('\n')
    : `- No se pudieron calcular KPIs desde DB: ${dbKpis.error}`

  const report = `# Reporte Operativo Diario - Fase 5\n\n` +
    `Fecha: ${reportDate}\n` +
    `Base URL: ${baseUrl}\n\n` +
    `## Resumen Ejecutivo\n\n` +
    `- Estado general salud: ${health.status} (HTTP ${health.statusCode || 'N/A'})\n` +
    `- Endpoint de salud accesible: ${health.ok ? 'SI' : 'NO'}\n` +
    `- Check DB: ${boolMark(Boolean(health.checks.database))}\n` +
    `- Check Auth config: ${boolMark(Boolean(health.checks.authConfig))}\n` +
    `- Check Email config: ${boolMark(Boolean(health.checks.emailConfig))}\n` +
    `- Check Alerting config: ${boolMark(Boolean(health.checks.alertingConfig))}\n\n` +
    `## KPIs Operativos (completar manualmente)\n\n` +
    `- Error rate API (%): \n` +
    `- p95 latencia endpoints core (ms): \n` +
    `- Disponibilidad (%): \n` +
    `- Incidentes P1/P2 del dia: \n` +
    `- TTD promedio (min): \n` +
    `- MTTR promedio (min): \n\n` +
    `## KPIs Producto (completar manualmente)\n\n` +
    `- Registros nuevos: \n` +
    `- Conversion registro -> reserva (%): \n` +
    `- Conversion reserva -> pago (%): \n` +
    `- No-show (%): \n` +
    `- Cancelaciones (%): \n\n` +
    `## KPIs calculados automaticamente (DB)\n\n` +
    `${dbKpisBlock}\n\n` +
    `## Variacion diaria (DB)\n\n` +
    `${deltaLines}\n\n` +
    `## Riesgos y Acciones\n\n` +
    `- Riesgo 1: \n` +
    `- Mitigacion 1: \n` +
    `- Riesgo 2: \n` +
    `- Mitigacion 2: \n\n` +
    `## Evidencia\n\n` +
    `- Adjuntar links a dashboards (Sentry/Datadog/Grafana).\n` +
    `- Adjuntar enlaces a incidentes abiertos/cerrados del dia.\n` +

    (health.ok ? '' : `\nObservacion: no se pudo consultar /api/health/launch (${health.error || 'error desconocido'}).\n`)

  const reportsDir = path.join(process.cwd(), 'docs', 'reports')
  fs.mkdirSync(reportsDir, { recursive: true })

  const reportPath = path.join(reportsDir, `${reportDate}_phase5_ops_report.md`)
  fs.writeFileSync(reportPath, report, 'utf8')

  if (dbKpis.ok) {
    const csv = buildCsvReport(dbKpis, previousDbKpis)
    const csvPath = path.join(reportsDir, `${reportDate}_phase5_kpis.csv`)
    fs.writeFileSync(csvPath, csv, 'utf8')
    console.log(`CSV KPI generado: ${csvPath}`)
  }

  console.log(`Reporte generado: ${reportPath}`)
}

run().catch(error => {
  console.error('Error generando reporte:', error)
  process.exit(1)
})
