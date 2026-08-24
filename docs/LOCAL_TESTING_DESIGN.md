# Diseno de Pruebas Locales

## Objetivo

Ejecutar un ciclo completo de validacion en entorno local sin depender de nube ni credenciales productivas.

## Flujo recomendado

1. `npm run ops:local:validate`
2. Revisar `docs/reports/local_validation_latest.md`
3. Revisar `docs/reports/phase5_progress_snapshot.md`
4. Revisar `docs/reports/go_live_readiness_snapshot_local.md`

## Flujo one-shot (recomendado para trabajo diario)

```bash
npm run ops:local:pipeline
```

Este comando ejecuta:
- validacion local integral,
- pipeline semanal local (baseline + weekly + decisions + snapshots).

## Que valida el comando integrado

- Levanta app local (`next dev`) y espera `/api/health/launch`.
- Ejecuta tests (`npm run test`).
- Ejecuta smoke base (`npm run smoke:golive`).
- Genera reporte diario (`npm run ops:report`).
- Genera snapshot de Fase 5 (`npm run ops:status`).
- Genera snapshot go-live en modo local (`npm run ops:golive:status`).

## Resultado esperado

- Archivo `docs/reports/local_validation_latest.md` con todos los pasos en `OK`.
- Estado local de go-live en `LOCAL_READY`.
- Progreso de Fase 5 actualizado con datos del dia.

## Nota de alcance

Mientras estemos en modo local, no se exige webhook real de alertas OPS.
La validacion estricta para lanzamiento se ejecuta aparte con:

```bash
npm run ops:golive:status:strict
```
