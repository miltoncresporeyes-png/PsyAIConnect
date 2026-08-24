# Fase 3 - QA Checklist

## Flujos Core

- [ ] Registro por email + verificacion de codigo.
- [ ] Registro profesional crea perfil placeholder.
- [ ] Consentimiento clinico se registra una sola vez y habilita avance.
- [ ] Reserva de cita crea pago pendiente y redirige a confirmacion.
- [x] Confirmacion de pre-reserva requiere sesion autenticada.

## Seguridad y Hardening

- [x] Rate limits devuelven 429 + headers cuando corresponde.
- [x] Endpoints de seed bloqueados en produccion.
- [x] Endpoints admin sensibles requieren rol ADMIN.
- [x] CSP y Permissions-Policy aplicadas en entorno productivo.

## Fiabilidad Operativa

- [x] Simulacion P1: fallo en auth/verify-code.
- [x] Simulacion P1: fallo en confirmacion de reserva.
- [x] Runbook ejecutado y tiempos de respuesta medidos.

## Criterio de Salida Fase 3

- [x] Todos los tests criticos en verde.
- [x] Simulaciones P1 completadas con evidencia.
- [ ] Sin bloqueantes abiertos en seguridad o autorizacion.
