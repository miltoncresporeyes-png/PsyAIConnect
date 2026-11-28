# PsyDoctor — guía para agentes

Marketplace chileno de salud mental (pacientes ↔ psicólogos/psiquiatras). Producción: https://psydoctor.cl (Railway). Idioma de la UI y los mensajes: español (es-CL).

## Modelo de negocio (no lo contradigas en textos ni código)
- El **paciente no paga nada** a la plataforma; el profesional **cobra directo** al paciente. **Sin comisión por sesión.**
- Ingreso = **suscripción del profesional** (planes STARTER / PRO / PREMIUM, ver `src/lib/plans.ts`).
- **Programa Fundadores:** 20 cupos, plan **Pro gratis 12 meses**. Lógica en `src/lib/founders.ts` y `src/app/api/admin/fundadores/route.ts` (cupo = primer número libre 1–20, en transacción). Al aprobar o al crearse la cuenta (`src/lib/founderBenefit.ts`) se activa Pro hasta `fechaFinBeneficio`. Rechazar a un aprobado libera el cupo y quita el plan solo si sigue siendo el concedido.
- Evita copy que prometa reembolsos de Isapre o resultados clínicos; el tono es informativo.

> **La app ya está en producción:** todo cambio va a producción. Ya no hay ventana de "acceso anticipado" ni botones "Avísame cuando abran" (se eliminaron `NewsletterPopup` y `PatientWaitlistModal`; los CTA llevan a `/profesionales`). `WAITLIST_MODE` debe estar sin definir en producción.

## Stack y comandos
Next.js 14 (App Router) · Prisma 5 + Postgres · NextAuth v4 (JWT; credenciales + Google + código por correo) · Tailwind · jest · zod.
- `npm run dev` · `npx tsc --noEmit` · `npx next lint` · `npx jest` (2 pruebas fallan desde antes: correo en modo dev y snapshot de la landing) · `npm run build`.
- Esquema: `npx prisma db push` + `npx prisma generate` (Railway ejecuta `db push --accept-data-loss` al iniciar: **cuidado con cambios destructivos**). El cliente se genera en `src/generated/client`.
- **No corras `next build` con el servidor de desarrollo activo** (corrompe `.next`). Usa un solo servidor en el puerto 3000; si cambias el esquema, detén el servidor antes de `prisma generate`.
- Windows: los heredocs de bash pierden barras invertidas; para scripts con regex usa archivos.

## Estructura relevante
- `src/app/admin/*` panel de administración (layout propio, `h-dvh`, sidebar + `main` con scroll interno). Piezas reutilizables en `src/components/admin/` (`ui.tsx`, `format.ts`, `useAdminData.ts`). Toda página admin nueva: `useAdminData`, `Card/Pill/Th/Td`, lista de tarjetas en móvil (`md:hidden`) + tabla en escritorio, botones de 44 px.
- `src/app/api/admin/*` APIs admin: **siempre** `requireAdmin()` de `src/lib/adminGuard.ts` (verifica en BD rol y `isActive`). Acciones sensibles → `logAdminAction` (`src/lib/adminLogs.ts`).
- `src/lib/admin/` métricas, salud del sistema, heartbeat del cron.
- Formatos: **`src/lib/format.ts`** (`formatCLP`, `formatNumber`, `formatPercent`) es la fuente única; no uses `toLocaleString('es-CL')` suelto. Fechas admin en `components/admin/format.ts` (zona `America/Santiago`).
- `src/lib/paymentMethods.ts` catálogo de medios de pago del profesional; `src/lib/paymentMethodSettings.ts` interruptor global (admin → `/admin/medios-de-pago`, tabla `PaymentMethodSetting`; un medio inactivo se oculta en perfil público, confirmación y detalle de cita, y no se puede guardar).
- Citas y antiinasistencia: `src/lib/appointmentPolicy.ts` (recordatorios 24 h/2 h, liberación sin reconfirmación, caducidad de solicitudes).
- Videollamada: una sala de **Google Meet por cita** (OAuth de la cuenta de PsyDoctor guardado cifrado, `GoogleMeetConnection`; admin en `/admin/salas`).
- Soporte: tickets (`SupportTicket`, `src/lib/tickets.ts`, `/soporte`, botón de feedback en el dashboard, bandeja en `/admin/tickets`). Avisa por correo a `ADMIN_ALERT_EMAIL`.
- Correos: `src/lib/email.ts` (Resend). El código de 6 dígitos usa `codeDigitsHtml` (no se parte en dos líneas).

## Opiniones y reputación (ver `docs/design/opiniones_verificadas.md`)
- Opiniones **verificadas**: una por cita `COMPLETED`, solo del paciente de esa cita; se muestran siempre como "Paciente verificado". Texto moderado: `moderateComment` (`src/lib/reviews.ts`) envía a `PENDING_REVIEW` datos de contacto, insultos, crisis y contenido clínico; el admin publica/retira en `/admin/opiniones` (auditado, `REMOVE_REVIEW`).
- Puntuación bayesiana + niveles Nuevo/Confiable/Destacado/Excelencia en `src/lib/reputation.ts` (umbrales provisorios: **ajustar tras el primer mes**). Se guarda desnormalizada en `Professional` (`ratingScore`, `ratingCount`, `reputationTier`, `attendanceRate`) vía `src/lib/reputationSync.ts`. Con menos de 5 opiniones se muestra "Nuevo en PsyDoctor".
- El cron (`/api/cron/recordatorios-citas`) invita a opinar 24 h después de la sesión (recordatorio a los 3 días, vence a los 14) y recalcula niveles (`src/lib/reviewInvites.ts`).
- UI: `/opinar/[appointmentId]` (paciente), `ReputationBadge` + `ReviewsSection` (perfil y búsqueda), `/dashboard/reputacion` (profesional responde una vez). Insignia "Fundador": `Professional.isFounder`.
- Fase 2: el profesional puede **reportar** una opinión (`ReviewReport`; no la oculta) y el admin decide en `/admin/opiniones` ("Mantener publicada" / "Retirar", auditado `DISMISS_REVIEW_REPORT`). Excelencia exige responder solicitudes en ≤ 24 h (`Professional.responseHours`, mediana solicitud→aceptación).
- Búsqueda: `/api/professionals` ordena por mejor valoradas; el plan de pago no altera la nota ni el orden.

## Pagos: Mercado Pago (solo suscripciones de profesionales)
- Checkout Pro: `src/lib/mercadopago.ts`; órdenes `SubscriptionOrder`; inicio en `POST /api/profesional/suscripcion`. Guía de configuración y flujo: `docs/deploy/mercadopago.md`.
- Un solo procesador idempotente, `applySubscriptionPayment` (`src/lib/subscriptionPayments.ts`), usado por la webhook (`/api/pagos/mercadopago/webhook`, firma `x-signature` con `MERCADOPAGO_WEBHOOK_SECRET`, `src/lib/mercadopagoWebhook.ts`) y por `POST /api/profesional/suscripcion/verificar` (al volver del checkout). Exige que monto y moneda (CLP) coincidan con la orden; reembolso/contracargo **no** quita el plan, avisa a `ADMIN_ALERT_EMAIL`.
- Variables: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`. El pago de citas por Mercado Pago (patrones antiguos de la webhook) sigue deshabilitado: el paciente no paga.

## Sesión y seguridad
- `src/lib/auth.ts`: el JWT revalida **rol y `isActive` contra la BD cada 60 s** (`SESSION_RECHECK_MS`); una cuenta desactivada o eliminada deja de tener sesión (`deactivated`) sin esperar la expiración. Segundo factor por correo (`mfa`); `middleware.ts` bloquea `/api/admin*` sin rol ADMIN y con MFA pendiente.
- Rutas con `getServerSession` deben declarar `export const dynamic = 'force-dynamic'`.
- Datos de salud: el service worker **nunca** cachea `/api`, HTML ni páginas autenticadas.

## Cron y operaciones
- GitHub Actions (`.github/workflows/cron-recordatorios.yml`) llama cada 10 min a `GET /api/cron/recordatorios-citas` con `Bearer CRON_SECRET`. Ese ciclo: recordatorios de citas, y **aviso por correo 7 días antes del vencimiento del plan de pago** (`src/lib/subscriptionReminders.ts`, una vez por fecha vía `Professional.renewalReminderFor`). Registra un heartbeat visible en `/admin/sistema`.
- Variables nuevas relevantes: `CRON_SECRET`, `ADMIN_ALERT_EMAIL`, `GOOGLE_MEET_CLIENT_ID/SECRET`. Checklist de despliegue: `docs/deploy/staging_checklist.md`.
- Usa siempre el dominio `https://psydoctor.cl` (sin `www`) en `NEXTAUTH_URL` y en los redirect URI de Google.

## PWA
`src/app/manifest.ts`, `public/sw.js` (solo estáticos públicos + `public/offline.html`), registro solo en producción (`PwaRegister`), botón "Instalar app" (`InstallPwaButton`, en el menú de usuario). Íconos en `public/icons/`. El service worker no se puede probar en el navegador integrado de Claude (Electron); probar en Chrome.

## Material solo local (no se sube a git)
`scripts/local/` (admin de prueba y datos simulados) está en `.git/info/exclude`; `.env.local`, `.claude/` tampoco se commitean. Admin local: `admin-local@psydoctor.test` (contraseña en `LOCAL_ADMIN_PASSWORD` de `.env.local`); en desarrollo el código 2FA se imprime en la consola del servidor.

## Estado y pendientes conocidos
- Rama de trabajo: `feat/panel-admin` (cambios sin commitear al momento de escribir esto). No hacer push, merge ni PR sin pedirlo.
- Eliminado: página Finanzas y endpoints admin sin uso (`dashboard-stats`, `stats`, `launch-readiness`, `sales`, `sales/retry`, `professional-license`, `create-reimbursement-table`). Si se retoma la emisión de boletas SII, rehacer el reintento de boletas.
- Pendiente de revisión legal: textos de términos y del programa Fundadores.
- Webhooks de pago antiguos (Flow/Transbank/PayPal/MercadoPago) existen pero el cobro al paciente está deshabilitado; no los extiendas sin decidirlo.
