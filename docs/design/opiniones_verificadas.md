# Diseño: Opiniones verificadas y reputación de profesionales

Estado: **MVP implementado** (2026-11-27). Decisiones del dueño: comentario de texto moderado, siempre "Paciente verificado" (nunca nombre), umbrales a ajustar tras el primer mes con datos reales, insignia "Fundador" visible junto al nivel.

Implementado: modelos `Review`/`ReviewInvite`, `src/lib/reputation.ts` y `reviews.ts`, invitaciones en el cron, `/opinar/[id]`, sección en el perfil, insignias en búsqueda, `/dashboard/reputacion` (responder), `/admin/opiniones` (moderar). Fase 2 implementada: reportes del profesional (`ReviewReport`, `POST /api/opiniones/[id]/reportar`, resolución en `/admin/opiniones`: "Mantener publicada" o "Retirar") y tiempo de respuesta (`Professional.responseHours`, mediana de horas solicitud→aceptación) como requisito de Excelencia (≤ 24 h). Pendiente (fase 3): JSON-LD, detección de ráfagas, "más útiles", filtros por nivel.

## 1. Objetivo y principios
Dar transparencia al modelo, al estilo de la reputación de Mercado Libre: el paciente ve de un vistazo si un profesional es confiable y el profesional gana visibilidad por hacer bien su trabajo. PsyDoctor debe transmitir **seriedad**.

1. **Solo opiniones verificadas:** una por cita `COMPLETED`, escrita por el paciente de esa cita. Nada anónimo ni de personas sin sesión.
2. **Se evalúa el servicio, no la clínica:** puntualidad, trato, claridad y facilidad de reserva. Nunca el resultado terapéutico ni datos de salud.
3. **Honestidad:** no se ocultan opiniones negativas. Solo se retiran las que rompen las reglas (§6), con motivo registrado.
4. **No se compra visibilidad:** el plan Pro/Premium no altera la puntuación ni el orden "Mejor valorados".
5. **Puntuación justa con pocos datos:** un profesional con una sola opinión de 5 estrellas no supera a uno con 40 opiniones de 4,8.

## 2. Qué ve cada persona
- **Paciente, buscando:** tarjeta con ★ promedio, número de opiniones y nivel de reputación; filtro "Mejor valorados"; en el perfil, desglose por criterio, histograma 1–5 y opiniones recientes con respuesta del profesional.
- **Paciente, tras su sesión:** invitación a opinar (correo + aviso en el dashboard), formulario de 30 segundos.
- **Profesional:** panel "Mi reputación": promedio, nivel, tendencia, tasa de asistencia, cancelaciones propias, tiempo de respuesta, qué le falta para el siguiente nivel; puede **responder una vez** y **reportar** una opinión.
- **Admin:** `/admin/opiniones` con cola de moderación, reportes, KPIs (tasa de respuesta a invitaciones, promedio global) y acciones auditadas.

## 3. Puntuación
**Opinión:** estrellas generales 1–5 (obligatoria) + 3 criterios 1–5 opcionales (Puntualidad, Trato y claridad, Facilidad de reserva) + comentario opcional (máx. 500 caracteres) + "¿Lo recomendarías?" sí/no.

**Promedio mostrado (bayesiano):** `score = (C·m + Σ estrellas) / (C + n)` con `m = 4,3` (promedio global de referencia) y `C = 5`. Con `n < 5` se muestra "Nuevo en PsyDoctor" + insignia "Registro verificado" en lugar de la nota (el promedio real se ve igual, con la cantidad).
**Ventana:** el nivel usa los últimos 12 meses; las opiniones de más de 6 meses pesan 0,5.

**Niveles de reputación** (se recalculan cada noche):

| Nivel | Condiciones |
|---|---|
| Nuevo | < 5 opiniones |
| Confiable | ≥ 5 opiniones, score ≥ 4,3 |
| Destacado | ≥ 15 opiniones, score ≥ 4,6, asistencia del profesional ≥ 95 % |
| Excelencia | ≥ 40 opiniones, score ≥ 4,8, asistencia ≥ 97 %, respuesta ≤ 24 h |

Bajan de nivel si dejan de cumplirse las condiciones. Sin nivel visible por debajo de 4,0 (el perfil sigue público; se revisa con el profesional).
**Asistencia del profesional:** 1 − (citas canceladas por el profesional con < 24 h + inasistencias del profesional) / citas confirmadas. Ya existen `cancelledBy` y `NO_SHOW`.
Los umbrales son configurables en una sola constante (`src/lib/reputation.ts`) para ajustarlos con datos reales.

## 4. Flujo de la opinión
1. La cita pasa a `COMPLETED` → 24 h después el cron crea una invitación (correo + banner). Recordatorio a los 3 días. **Expira a los 14 días.**
2. El paciente abre un enlace firmado (`/opinar/[token]`, requiere sesión) o va a Mis citas → "Opinar".
3. Estado inicial `PUBLISHED` si pasa el filtro automático (§6); si no, `PENDING_REVIEW` (cola admin).
4. Edición permitida 48 h; luego queda fija.
5. El profesional puede responder una vez (máx. 500 caracteres, mismo filtro) y reportar.
6. El paciente puede **eliminar su opinión** cuando quiera (derecho de supresión, Ley 19.628).

**Privacidad:** se muestra "Paciente verificado · María P." (nombre + inicial, con opción de ocultarlo). Nunca se expone el motivo de consulta, la fecha exacta de la sesión ni datos clínicos. No se envía al profesional información que identifique al paciente más allá de lo que ya conoce.

## 5. Datos (Prisma)
```prisma
model Review {
  id             String   @id @default(cuid())
  appointmentId  String   @unique            // una opinión por cita
  patientId      String
  professionalId String
  rating         Int                           // 1..5
  punctuality    Int?
  clarity        Int?
  booking        Int?
  recommends     Boolean?
  comment        String?                       // máx. 500
  status         ReviewStatus @default(PUBLISHED)   // PUBLISHED | PENDING_REVIEW | REMOVED
  removedReason  String?
  reply          String?
  repliedAt      DateTime?
  editableUntil  DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  reports        ReviewReport[]
  @@index([professionalId, status, createdAt])
}
model ReviewReport { id String @id @default(cuid()); reviewId String; reporterId String; reason String; status String @default("OPEN"); createdAt DateTime @default(now()); @@unique([reviewId, reporterId]) }
model ReviewInvite { id String @id @default(cuid()); appointmentId String @unique; token String @unique; sentAt DateTime?; reminderAt DateTime?; expiresAt DateTime; usedAt DateTime? }
```
`Professional` suma campos desnormalizados (se recalculan en el cron y al publicar/retirar): `ratingScore Float?`, `ratingCount Int @default(0)`, `reputationTier String @default("NEW")`, `attendanceRate Float?`, `reputationUpdatedAt DateTime?`. La búsqueda ordena por `ratingScore` sin joins.

## 6. Moderación y antiabuso
- **Filtro automático:** reutiliza `screenMessage` (correos, teléfonos, enlaces, cuentas) y una lista de insultos y términos clínicos (diagnósticos, nombres propios de terceros). Si falla → `PENDING_REVIEW`.
- **Retiro** solo por: datos personales, insultos/amenazas, contenido clínico, spam, opinión sobre alguien distinto, o dato falso comprobable. Se registra en `AdminLog` (`REMOVE_REVIEW`) con motivo y se avisa al autor.
- **Negativas no se borran** por pedido del profesional; sí puede responder.
- **Antifraude:** una por cita; la cita debe tener asistencia real (`COMPLETED`); límite de opiniones por paciente por día; detección de ráfagas (≥ 3 opiniones de 5★ en 24 h para un mismo profesional → revisión); un profesional no puede opinar sobre sí mismo (cuentas vinculadas por correo/RUT).
- **Reportes:** el profesional reporta con motivo; el admin resuelve en 72 h y se informa a ambos.

## 7. Superficies a construir
**Paciente:** `/opinar/[token]` (formulario), banner en `/dashboard/citas`, correo de invitación (plantilla en `src/lib/email.ts`), eliminar/editar mi opinión.
**Público:** sección "Opiniones" en `/profesional/[slug]` (promedio, criterios, histograma, lista paginada con "Más útiles/Recientes"), insignia de nivel en tarjetas y perfil, orden "Mejor valorados" y filtro por nivel en `/profesionales`, datos estructurados `AggregateRating`/`Review` en el JSON-LD **solo con opiniones reales y visibles** (validar contra las guías de Google antes de activar).
**Profesional:** `/dashboard/reputacion` (métricas, progreso al siguiente nivel, responder y reportar).
**Admin:** `/admin/opiniones` (cola, reportes, retirar con motivo, KPIs), alerta en el resumen cuando hay reportes abiertos, contador en el menú.
**API:** `POST /api/opiniones` · `PATCH/DELETE /api/opiniones/[id]` · `POST /api/opiniones/[id]/responder` · `POST /api/opiniones/[id]/reportar` · `GET /api/profesional/[slug]/opiniones` · `GET/PATCH /api/admin/opiniones`.
**Cron:** se agrega al ciclo existente (`/api/cron/recordatorios-citas`): crear/enviar invitaciones y recordatorios, recalcular agregados y niveles (con heartbeat propio visible en `/admin/sistema`).

## 8. Legal y confianza
- Revisar con asesor: Ley 19.628 (supresión, consentimiento para mostrar nombre), Ley del Consumidor (opiniones auténticas) y secreto profesional. Texto visible: "Opiniones de pacientes con sesión completada. No evalúan el resultado clínico."
- Los términos del profesional deben avisar que su perfil mostrará opiniones y que PsyDoctor puede retirar las que incumplan las reglas.
- Política pública de moderación en `/faq`.

## 9. Fases
1. **MVP (≈1 semana):** modelo, invitación, formulario, publicación con filtro, promedio bayesiano, sección en el perfil, insignia en tarjetas, retiro por admin.
2. **Reputación (≈1 semana):** niveles, métricas de asistencia, `/dashboard/reputacion`, orden "Mejor valorados", respuesta del profesional, reportes.
3. **Escala:** JSON-LD, filtros por nivel, opiniones "más útiles", alertas de ráfagas, panel de KPIs en admin.

**Pruebas:** unidad para el promedio bayesiano, niveles y filtros; API (una por cita, solo el paciente de la cita, ventana de edición, expiración); moderación y registro en `AdminLog`; el cron no duplica invitaciones.
**Métricas de éxito:** ≥ 35 % de las sesiones completadas con opinión a 14 días; < 2 % de opiniones retiradas; ≥ 60 % de los profesionales activos con ≥ 5 opiniones a 90 días; mejora de la conversión búsqueda → reserva.

## 10. Decisiones tomadas
1. Comentarios de texto desde el MVP, moderados (filtro automático + cola admin).
2. Siempre "Paciente verificado"; el nombre nunca se muestra (se eliminó la opción `hideName`).
3. Umbrales de nivel (§3) provisorios: revisar con datos tras el primer mes (`REPUTATION_CONFIG` en `src/lib/reputation.ts`).
4. Insignia "Fundador" visible junto al nivel (`Professional.isFounder`, la fija la aprobación de fundadores).
