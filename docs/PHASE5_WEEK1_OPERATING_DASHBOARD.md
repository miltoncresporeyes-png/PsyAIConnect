# Fase 5 - Tablero Operativo Semana 1

Fecha de inicio: 2026-02-12

## Objetivo

Operar la primera semana post-lanzamiento con visibilidad diaria de estabilidad, incidentes y conversion.

## Tablero minimo (actualizar diariamente)

### Salud tecnica

- Estado `/api/health/launch`.
- Error rate global API (%).
- p95 latencia endpoints core (`/api/auth/*`, `/api/pre-reservation/*`, `/api/citas/*`).
- Disponibilidad global (%).

### Incidentes

- Cantidad incidentes P1/P2 por dia.
- TTD (Time To Detect) promedio.
- MTTR (Mean Time To Recover) promedio.
- Estado de mitigaciones activas.

### Producto

- Registros nuevos diarios.
- Conversion `registro -> reserva`.
- Conversion `reserva -> pago`.
- Tasa de no-show y cancelaciones.

## Cadencia de reporte

- Corte diario sugerido: 18:00 CLT.
- Responsable primario: Ops.
- Revisor: Tech Lead + Product.

## Comandos operativos

```bash
# 0) Validacion local integral (recomendado)
npm run ops:local:validate

# 1) Smoke base
npm run smoke:golive

# 2) Reporte diario fase 5
npm run ops:report

# 2.1) Backfill de 3 dias (bootstrap baseline)
npm run ops:backfill:3

# 3) Review semanal fase 5
npm run ops:weekly

# 4) Baseline y ajuste de umbrales
npm run ops:baseline

# 5) Snapshot ejecutivo de avance
npm run ops:status
```

Salida esperada del reporte:

- Archivo en `docs/reports/YYYY-MM-DD_phase5_ops_report.md`.
- Incluye bloque de KPIs calculados automaticamente desde DB (registro/reserva/pago/no-show/cancelaciones).
- Incluye comparativa dia contra dia (delta %) vs dia anterior.
- Genera CSV de KPIs en `docs/reports/YYYY-MM-DD_phase5_kpis.csv`.
- Genera review semanal en `docs/reports/YYYY-Www_phase5_weekly_review.md`.
- Genera backlog priorizado semanal en `docs/reports/YYYY-Www_phase5_priority_backlog.md`.
- Genera baseline/umbrales en `docs/reports/phase5_baseline_thresholds.md`.

## Semaforo semanal (automatico)

El review semanal calcula semaforo de salud con estos umbrales:

- Conversion `registro -> reserva`: VERDE >= 20%, AMARILLO >= 10%, ROJO < 10%.
- Conversion `reserva -> pago`: VERDE >= 60%, AMARILLO >= 40%, ROJO < 40%.
- No-show: VERDE <= 10%, AMARILLO <= 20%, ROJO > 20%.
- Cancelaciones: VERDE <= 15%, AMARILLO <= 25%, ROJO > 25%.

Nota: si hay menos de 3 dias de datos, el estado general se marca AMARILLO por muestra limitada.

## Criterio de exito Semana 1

- 7 reportes diarios consecutivos.
- 0 incidentes criticos repetitivos sin accion correctiva.
- KPIs operativos y de conversion con linea base documentada.

## Ritual semanal

- Ejecutar `docs/PHASE5_WEEKLY_REVIEW_RITUAL.md` para cerrar prioridades de la semana siguiente.
