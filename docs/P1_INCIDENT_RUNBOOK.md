# Runbook P1 - PsyConnect

## Alcance

Este runbook cubre incidentes P1 en produccion para:

- Autenticacion y registro (`/api/auth/*`)
- Reserva y confirmacion (`/api/pre-reservation/*`, `/api/citas/*`)
- Pagos y confirmaciones de webhook

## Severidad P1

Clasifica como P1 si ocurre cualquiera de estos casos:

- Error masivo que bloquea registro/reserva/pago en mas del 20% del trafico.
- Exposicion de datos sensibles o bypass de autorizacion.
- Indisponibilidad total de flujo paciente-profesional por mas de 5 minutos.

## Respuesta Inicial (0-10 min)

1. Declarar incidente en canal de guardia y asignar Incident Commander.
2. Congelar despliegues mientras se contiene impacto.
3. Verificar estado de APIs criticas y errores 5xx/429 por endpoint.
4. Definir mitigacion inmediata:
   - rollback de release,
   - deshabilitar feature flag,
   - reducir trafico a endpoint afectado.

## Diagnostico Rapido (10-30 min)

- Revisar logs de:
  - `verify-code`,
  - `pre-reservation/confirm`,
  - `consent/clinical`,
  - `citas`,
  - webhook de pagos.
- Confirmar dependencias externas (correo, pagos, DB).
- Identificar si es regresion, saturacion, o abuso automatizado.

## Mitigaciones Estandar

- **Auth comprometido o abuso:** endurecer temporalmente rate limits y bloquear IPs origen.
- **Reserva inconsistente:** pausar confirmaciones y forzar reintento controlado.
- **Pagos inestables:** habilitar fallback de reintento y marcar citas en estado pendiente auditado.

## Comunicacion

- Actualizacion cada 15 minutos a stakeholders clave.
- Mensaje corto a soporte con impacto, workaround y ETA.

## Cierre y Postmortem (24-48h)

1. Publicar timeline de evento.
2. Definir causa raiz y acciones preventivas.
3. Agregar test de regresion para el escenario gatillador.
4. Actualizar este runbook si hubo pasos faltantes.
