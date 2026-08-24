# Evidencia Simulaciones P1 - Fase 3

Fecha: 2026-02-12

## Escenarios Ejecutados

1. `P1-AUTH-VERIFY-CODE-FAIL`
   - Endpoint: `/api/auth/verify-code`
   - Falla inyectada: error de persistencia en `emailVerificationCode.create` (`db down`).
   - Resultado esperado: API retorna `500` con mensaje de error controlado.
   - Evidencia automatizada: `src/app/api/auth/verify-code/__tests__/route.test.ts`.

2. `P1-RESERVATION-CONFIRM-FAIL`
   - Endpoint: `/api/pre-reservation/confirm`
   - Falla inyectada: error de escritura en `appointment.create` (`db down`).
   - Resultado esperado: API retorna `500` con mensaje de error controlado.
   - Evidencia automatizada: `src/app/api/pre-reservation/confirm/__tests__/route.test.ts`.

## Comando Ejecutado

```bash
npm run test -- src/app/api/auth/verify-code/__tests__/route.test.ts src/app/api/pre-reservation/confirm/__tests__/route.test.ts
```

## Resultado

- Test suites: `2 passed, 2 total`
- Tests: `6 passed, 6 total`
- Duracion total reportada por Jest: `1.871 s`

## Tiempos Operativos Medidos (drill en entorno de test)

- Deteccion: inmediata por resultado de test (`< 1 min`).
- Mitigacion: manejo controlado por bloque `catch` y respuesta de error (`500`) en ambos endpoints.
- Accion de seguimiento: mantener alertas de error rate para detectar estos patrones en produccion.

## Runbook Referenciado

- `docs/P1_INCIDENT_RUNBOOK.md`
