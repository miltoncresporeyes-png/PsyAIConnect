# Fase 4 - Go-Live Readiness Checklist

## Operacion y Observabilidad

- [ ] Sentry/Datadog conectados a frontend y backend.
- [ ] Alertas de error rate y latencia configuradas (Slack/Email).
- [ ] Dashboard operativo con APIs core (`/api/auth/*`, `/api/pre-reservation/*`, `/api/citas/*`).
- [x] Logging estructurado con correlacion por request id.
- [x] Webhook OPS con placeholder documentado para activacion rapida.

## Evidencia tecnica implementada

- `src/lib/observability.ts`: logger estructurado + captura de errores + notificacion opcional a webhook.
- `src/app/api/health/launch/route.ts`: endpoint de salud de lanzamiento con chequeos de DB/config.
- `scripts/smoke-golive.js`: smoke tests base para API core.
- `package.json`: script `smoke:golive`.
- `.env.local.template`: `OPS_ALERT_WEBHOOK_URL` con valor placeholder.

## Seguridad de Produccion

- [ ] Secretos rotados para salida a produccion (auth, correo, pagos).
- [ ] Variables de entorno validadas por entorno (dev/staging/prod).
- [ ] Politicas de CORS/CSP revisadas con dominios definitivos.
- [ ] Plan de respuesta ante incidente y contactos on-call confirmados.

## Despliegue y Recuperacion

- [ ] Backup reciente de base de datos verificado.
- [ ] Plan de rollback probado (app + esquema de datos).
- [ ] Smoke test post-deploy ejecutado en staging y produccion.
- [ ] Runbook P1 enlazado desde panel operativo.

## Criterio de Salida Fase 4

- [ ] 0 bloqueantes de seguridad en pendiente.
- [ ] Alertas activas con umbrales calibrados.
- [ ] Smoke tests de go-live en verde.
- [ ] Aprobacion formal Go/No-Go por Tech Lead + Ops.

## Estado actual (cierre parcial)

- ✅ Completado: observabilidad base, request-id, health endpoint y smoke local 3/3.
- ⚠️ Pendiente para cierre total: activar webhook real (`OPS_ALERT_WEBHOOK_URL`) en staging/prod y calibrar alertas.
- ⚠️ Pendiente para cierre total: ejecutar smoke post-deploy en staging y produccion con evidencia.
- ⚠️ Pendiente para cierre total: aprobacion formal Go/No-Go por Tech Lead + Ops.

## Comando de control

```bash
npm run ops:golive:status
# En lanzamiento real (modo estricto)
npm run ops:golive:status:strict
```

Genera snapshot consolidado en:
- `docs/reports/go_live_readiness_snapshot_local.md` (modo local)
- `docs/reports/go_live_readiness_snapshot_strict.md` (modo lanzamiento real)
