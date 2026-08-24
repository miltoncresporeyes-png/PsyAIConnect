# Programacion diaria de `ops:report` (Windows)

## Crear tarea programada

```bash
npm run ops:schedule
```

Por defecto crea la tarea `PsyConnect-Phase5-OpsReport` a las `18:00` (hora local).

## Verificar tarea

```bash
schtasks /Query /TN PsyConnect-Phase5-OpsReport /V /FO LIST
```

## Ejecutar manualmente la tarea

```bash
schtasks /Run /TN PsyConnect-Phase5-OpsReport
```

## Eliminar tarea

```bash
npm run ops:unschedule
```

## Crear tarea semanal (review)

```bash
npm run ops:weekly:schedule
```

Por defecto crea la tarea `PsyConnect-Phase5-WeeklyReview` cada viernes a las `18:30`.

## Verificar tarea semanal

```bash
schtasks /Query /TN PsyConnect-Phase5-WeeklyReview /V /FO LIST
```

## Ejecutar manualmente la tarea semanal

```bash
schtasks /Run /TN PsyConnect-Phase5-WeeklyReview
```

## Eliminar tarea semanal

```bash
npm run ops:weekly:unschedule
```

## Crear tarea semanal (acta de decisiones)

```bash
npm run ops:decisions:schedule
```

Por defecto crea la tarea `PsyConnect-Phase5-WeeklyDecisions` cada viernes a las `18:45`.

## Verificar tarea de decisiones

```bash
schtasks /Query /TN PsyConnect-Phase5-WeeklyDecisions /V /FO LIST
```

## Ejecutar manualmente la tarea de decisiones

```bash
schtasks /Run /TN PsyConnect-Phase5-WeeklyDecisions
```

## Eliminar tarea de decisiones

```bash
npm run ops:decisions:unschedule
```

## Logs y salidas

- Runner: `scripts/run-ops-report.bat`
- Log de ejecucion: `docs/reports/ops_report_task.log`
- Reporte diario: `docs/reports/YYYY-MM-DD_phase5_ops_report.md`
- CSV diario: `docs/reports/YYYY-MM-DD_phase5_kpis.csv`
- Runner semanal: `scripts/run-ops-weekly.bat`
- Log semanal: `docs/reports/ops_weekly_task.log`
- El runner semanal ejecuta pipeline completo (`ops:baseline --apply` + `ops:weekly` + `ops:decisions` + snapshots).
- Weekly review: `docs/reports/YYYY-Www_phase5_weekly_review.md`
- Backlog semanal: `docs/reports/YYYY-Www_phase5_priority_backlog.md`
- Runner decisiones: `scripts/run-ops-decisions.bat`
- Log decisiones: `docs/reports/ops_decisions_task.log`
- Acta semanal: `docs/reports/YYYY-Www_phase5_decisions.md`
- Snapshot F5: `docs/reports/phase5_progress_snapshot.md`
- Snapshot go-live local: `docs/reports/go_live_readiness_snapshot_local.md`
- Snapshot go-live estricto: `docs/reports/go_live_readiness_snapshot_strict.md`

Nota: el snapshot de go-live del pipeline corre en modo local. Para validacion de lanzamiento real, ejecutar manualmente:

```bash
npm run ops:golive:status:strict
```
