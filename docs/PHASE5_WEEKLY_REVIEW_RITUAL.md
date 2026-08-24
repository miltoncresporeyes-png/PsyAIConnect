# Fase 5 - Ritual de Revision Semanal

## Objetivo

Convertir datos operativos semanales en decisiones concretas de prioridad (que se ejecuten la semana siguiente).

## Cadencia

- Dia/hora sugerido: viernes 19:00 CLT (despues de `ops:weekly`).
- Duracion objetivo: 30-45 minutos.
- Frecuencia: semanal.

## Participantes y roles

- Incident Commander (Ops): presenta estabilidad, incidentes y riesgos.
- Tech Lead: valida impacto tecnico y capacidad de ejecucion.
- Product Lead: prioriza impacto en conversion y experiencia.
- Backend/Frontend owners: toman acciones y fechas comprometidas.

## Inputs obligatorios

- `docs/reports/YYYY-Www_phase5_weekly_review.md`
- `docs/reports/YYYY-Www_phase5_priority_backlog.md`
- `docs/reports/YYYY-MM-DD_phase5_ops_report.md` (ultima semana)
- `docs/reports/YYYY-MM-DD_phase5_kpis.csv` (ultima semana)
- `docs/INCIDENT_P1_P2_TEMPLATE.md` (si hubo incidentes)

## Agenda ejecutable (45 min)

1. Semaforo de salud (10 min)
- Confirmar estado general (VERDE/AMARILLO/ROJO/GRIS).
- Validar si hubo desviaciones fuertes en conversion/no-show/cancelaciones.

2. Incidentes y mitigaciones (10 min)
- Revisar P1/P2 de la semana.
- Validar acciones correctivas abiertas con owner + fecha.

3. Priorizacion semanal (15 min)
- Seleccionar maximo 3 iniciativas HIGH y 2 MEDIUM.
- Congelar alcance de la semana siguiente (evitar sobrecarga).

4. Compromisos y cierre (10 min)
- Confirmar responsables por tarea.
- Confirmar fecha de entrega y criterio de exito por item.

## Reglas de decision

- Si semaforo = ROJO: prioridad absoluta a estabilidad y pago, se congela trabajo no critico.
- Si semaforo = AMARILLO: ejecutar hardening focalizado + 1 mejora de conversion.
- Si semaforo = VERDE: mantener estabilidad y acelerar mejoras de conversion.
- Si semaforo = GRIS: priorizar captura de datos (minimo 3 dias utiles) antes de cambios mayores.

## Output esperado (obligatorio)

- Backlog semanal final con maximo 5 items, owner y ETA.
- Decisiones registradas en acta breve (puede ser al final del weekly review).
- Riesgos escalados al Tech Lead/Product cuando aplique.

## Comandos de apoyo

```bash
# 0) Pipeline semanal completo (recomendado)
npm run ops:weekly:pipeline

# 1) Generar review + backlog automatico
npm run ops:weekly

# 2) Generar acta de decisiones semanal
npm run ops:decisions

# 3) Revisar baseline y propuesta de umbrales
npm run ops:baseline

# 4) Snapshot de estado (F5 + go-live)
npm run ops:status
npm run ops:golive:status
```
