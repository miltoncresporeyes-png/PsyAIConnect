# Mercado Pago: cobro de suscripciones de profesionales

Mercado Pago cobra **solo las suscripciones de los profesionales** (planes Pro y Premium). El paciente no paga nada a PsyDoctor y no hay comisión por sesión.

## 1. Credenciales (una sola vez)
1. Entra a https://www.mercadopago.cl/developers/panel/app y crea (o abre) la aplicación de PsyDoctor → producto **Checkout Pro**.
2. **Credenciales de producción** → copia el **Access Token** y guárdalo en Railway como `MERCADOPAGO_ACCESS_TOKEN` (empieza con `APP_USR-`). No lo compartas por chat.
3. Para probar antes, usa las **credenciales de prueba** (`TEST-`) en staging y las cuentas de prueba de Mercado Pago.

## 2. Webhook (notificaciones)
1. Panel de la aplicación → **Webhooks** → **Configurar notificaciones**.
2. **URL de producción:** `https://psydoctor.cl/api/pagos/mercadopago/webhook`
3. **Evento:** `Pagos`.
4. Guarda y copia la **Clave secreta** en Railway como `MERCADOPAGO_WEBHOOK_SECRET`. Con esa clave PsyDoctor valida la firma de cada notificación (`x-signature`).
5. Usa "Simular notificación" del panel: debe responder **200**. Con una firma incorrecta responde **401**.

## 3. Cómo fluye el pago
1. El profesional elige plan y ciclo en `/dashboard/suscripcion` → se crea una orden (`SubscriptionOrder`, estado `PENDING`) y una preferencia de Checkout Pro (enlace vigente 48 h).
2. Paga en Mercado Pago y vuelve a `/dashboard/suscripcion?pago=ok&payment_id=...`.
3. Al volver, la página confirma el pago al instante (`POST /api/profesional/suscripcion/verificar`). Además llega la notificación a la webhook. **Ambas usan la misma lógica idempotente** (`src/lib/subscriptionPayments.ts`): solo una activa el plan, la otra ve "ya pagado".
4. Se activa el plan (`subscriptionTier`, `subscriptionEnds`), la orden pasa a `PAID` y el profesional recibe un comprobante por correo.

## 4. Reglas de seguridad
- Nunca se confía en el cliente: el pago se consulta a la API de Mercado Pago y el **monto y la moneda (CLP)** deben coincidir con la orden.
- Rechazado/cancelado solo marca la orden si seguía `PENDING`; un pago aprobado no se revierte.
- **Reembolso o contracargo:** el plan **no** se quita solo. Se envía un aviso a `ADMIN_ALERT_EMAIL` para decidir (Admin → Suscripciones).
- Errores transitorios devuelven 500 y Mercado Pago reintenta; el procesamiento es seguro de repetir.

## 5. Revisión rápida
- Admin → **Salud del sistema** muestra si están definidos `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET`.
- Prueba de punta a punta (staging con credenciales `TEST-`): comprar un plan con una tarjeta de prueba, confirmar que `/dashboard/suscripcion` muestra el plan activo y que llega el comprobante.
- Las suscripciones activas de fundadores (Pro gratis 12 meses) no pasan por Mercado Pago.
