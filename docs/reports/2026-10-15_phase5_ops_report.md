# Reporte Operativo Diario - Fase 5

Fecha: 2026-10-15
Base URL: http://localhost:3000

## Resumen Ejecutivo

- Estado general salud: degraded (HTTP 503)
- Endpoint de salud accesible: SI
- Check DB: PENDING
- Check Auth config: OK
- Check Email config: OK
- Check Alerting config: PENDING

## KPIs Operativos (completar manualmente)

- Error rate API (%): 
- p95 latencia endpoints core (ms): 
- Disponibilidad (%): 
- Incidentes P1/P2 del dia: 
- TTD promedio (min): 
- MTTR promedio (min): 

## KPIs Producto (completar manualmente)

- Registros nuevos: 
- Conversion registro -> reserva (%): 
- Conversion reserva -> pago (%): 
- No-show (%): 
- Cancelaciones (%): 

## KPIs calculados automaticamente (DB)

- No se pudieron calcular KPIs desde DB: 
Invalid `prisma.user.count()` invocation in
C:\workspace\PsyAI\scripts\generate-phase5-daily-report.js:124:19

  121   noShowAppointments,
  122   cancelledAppointments,
  123 ] = await Promise.all([
→ 124   prisma.user.count(
Can't reach database server at `localhost:5432`

Please make sure your database server is running at `localhost:5432`.

## Variacion diaria (DB)

- No se pudo calcular comparativa diaria (hoy: ERROR, ayer: ERROR).

## Riesgos y Acciones

- Riesgo 1: 
- Mitigacion 1: 
- Riesgo 2: 
- Mitigacion 2: 

## Evidencia

- Adjuntar links a dashboards (Sentry/Datadog/Grafana).
- Adjuntar enlaces a incidentes abiertos/cerrados del dia.
