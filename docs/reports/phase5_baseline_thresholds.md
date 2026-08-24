# Baseline y Ajuste de Umbrales - Fase 5

Cobertura usada: 2026-02-10 -> 2026-02-12 (3 dia(s))

## Estado de baseline

- Baseline suficiente: SI (>= 3 dias).

## Promedios observados (DB)

- Conversion registro -> reserva: N/A
- Conversion reserva -> pago: N/A
- No-show: N/A
- Cancelaciones: N/A

## Umbrales actuales

- Conversion registro -> reserva: verde >= 20, amarillo >= 10
- Conversion reserva -> pago: verde >= 60, amarillo >= 40
- No-show: verde <= 10, amarillo <= 20
- Cancelaciones: verde <= 15, amarillo <= 25

## Umbrales sugeridos

- Conversion registro -> reserva: verde >= 20, amarillo >= 10
- Conversion reserva -> pago: verde >= 60, amarillo >= 40
- No-show: verde <= 10, amarillo <= 20
- Cancelaciones: verde <= 15, amarillo <= 25

## Recomendacion

- Puedes aplicar umbrales sugeridos con: `npm run ops:baseline -- --apply`.
