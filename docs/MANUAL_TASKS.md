# PsyDoctor / PsyAI - Tareas Manuales Fuera de Código (Producción)

Este documento registra de forma exhaustiva las tareas requeridas para el lanzamiento a producción que **no pueden ejecutarse desde código** y requieren intervención directa en proveedores, consolas de infraestructura o DNS.

---

## 1. Base de Datos & Respaldo (Supabase PostgreSQL)
- **Tarea:** Configurar y verificar copias de seguridad continuas (Point-In-Time Recovery / PITR) y retención de backups diarios.
- **Responsable sugerido:** Líder DevOps / Infraestructura Cloud.
- **Pasos exactos:**
  1. Ingresar a la consola de [Supabase Dashboard](https://supabase.com/dashboard) en el proyecto de producción.
  2. Ir a **Database** -> **Backups**.
  3. Verificar que **Point-in-Time Recovery (PITR)** esté activado (requiere plan Pro o superior).
  4. Configurar ventana de retención mínima de 7 días.
  5. Ejecutar una prueba de exportación manual de backup (`.dump` o descarga desde el dashboard) y almacenar una copia cifrada en almacenamiento externo seguro (S3 / GCS).
- **Criterio de verificación:**
  - El dashboard muestra estado *Active* en backups automáticos con registro del último respaldo con antigüedad < 24 horas.

---

## 2. Configuración DNS: Entregabilidad de Correo (SPF, DKIM, DMARC)
- **Tarea:** Añadir registros DNS para autorizar a Resend a enviar correos en nombre del dominio `@psydoctor.cl`.
- **Responsable sugerido:** Administrador de Dominio (NIC Chile / Cloudflare / Route53).
- **Pasos exactos:**
  1. Entrar al dashboard de **Resend** -> **Domains** y registrar `psydoctor.cl`.
  2. Obtener los registros provistos:
     - **SPF (TXT):** Registro TXT para `@` o `bounces.psydoctor.cl` con `v=spf1 include:resend.com ~all`.
     - **DKIM (CNAME / TXT):** Claves públicas provistas por Resend (ej. `resend._domainkey.psydoctor.cl`).
     - **DMARC (TXT):** Registro en `_dmarc.psydoctor.cl` con `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@psydoctor.cl`.
  3. Aplicar los registros en el proveedor de DNS.
  4. Hacer clic en "Verify Records" en la consola de Resend.
- **Criterio de verificación:**
  - Estado `Verified` en verde en Resend. Pruebas de envío a herramientas como [mail-tester.com](https://www.mail-tester.com) con puntuación >= 9/10 sin alertas de spam.

---

## 3. Integración de Pagos en Producción (Flow.cl)
- **Tarea:** Configurar credenciales comerciales definitivas y activar el comercio en modo producción.
- **Responsable sugerido:** Administrador Comercial / Finanzas.
- **Pasos exactos:**
  1. Ingresar a [Flow.cl](https://www.flow.cl) con la cuenta corporativa verificada.
  2. Ir a **Mis Datos** -> **Seguridad / API**.
  3. Generar un nuevo par de llaves API: `FLOW_API_KEY` y `FLOW_SECRET_KEY` para el entorno de producción.
  4. Configurar las URL de retorno y confirmación:
     - URL de Retorno: `https://psydoctor.cl/pago/confirmacion`
     - URL de Confirmación (Webhook): `https://psydoctor.cl/api/pagos/webhook`
  5. Configurar las variables de entorno en el hosting (Vercel / Railway) y cambiar `FLOW_ENVIRONMENT=production`.
- **Criterio de verificación:**
  - El script `npm run check:env` no arroja advertencias de sandbox en producción y una transacción de prueba con tarjeta de crédito de monto mínimo se procesa y liquida correctamente.

---

## 4. Rotación y Gestión de Secretos en Hosting (Vercel / Railway)
- **Tarea:** Configurar secretos de producción con entropía criptográfica real y deshabilitar claves de prueba.
- **Responsable sugerido:** Ingeniero de Seguridad / Tech Lead.
- **Pasos exactos:**
  1. Generar claves de 64 caracteres hex para cifrado:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
  2. En el panel de hosting (Vercel / Railway), establecer en las variables de entorno de producción:
     - `ENCRYPTION_KEY`: Valor hex generado (64 caracteres).
     - `ENCRYPTION_KID`: Identificador de clave (ej. `k1`).
     - `NEXTAUTH_SECRET`: Secreto criptográfico de al menos 32 caracteres.
     - `OPS_ALERT_WEBHOOK_URL`: Webhook oficial de Slack / Discord para alertas P1/P2.
     - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Instancia Redis distribuida para rate limiting.
  3. Redesplegar la aplicación.
- **Criterio de verificación:**
  - `npm run check:env` ejecutado en el pipeline de build pasa exitosamente sin fallos de entropía ni detección de valores por defecto.

---

## 5. Canal de Alertas Operacionales P1/P2 (Slack / Discord)
- **Tarea:** Crear webhook entrante para notificaciones críticas de degradación y seguridad.
- **Responsable sugerido:** DevOps / SRE.
- **Pasos exactos:**
  1. En el espacio de trabajo de Slack, crear un canal privado `#alertas-psydoctor-prod`.
  2. Crear una App o Incoming Webhook apuntando a dicho canal.
  3. Copiar la URL generada (`https://hooks.slack.com/services/...`).
  4. Establecer en variables de entorno como `OPS_ALERT_WEBHOOK_URL`.
- **Criterio de verificación:**
  - Probar con `curl -X POST -H "Content-Type: application/json" -d '{"text":"Prueba de alerta operacional"}' $OPS_ALERT_WEBHOOK_URL` y confirmar la recepción del mensaje en el canal.

---

## 6. Plan de Rollback Operacional
- **En caso de fallo crítico post-despliegue:**
  1. **Reversión de Código (Vercel / Railway):** En la pestaña *Deployments*, hacer clic en el despliegue anterior estable y seleccionar **Promote to Production** / **Rollback**. Tiempo estimado: < 1 minuto.
  2. **Feature Flags Inmediatas:**
     - Si falla el proveedor LLM: Configurar `ENABLE_PSYAI=false` para degradar suavemente el orientador a mensajes de asistencia humana.
     - Si falla la pasarela Flow: Configurar `ENABLE_PAYMENTS=false` para alertar al usuario sin colapsar el agendamiento.
  3. **Base de Datos:** Los cambios introducidos en el esquema (índice único en citas, `flowToken`, tabla `ClinicalAccessAudit`) son 100% aditivos y retrocompatibles, permitiendo que versiones anteriores del frontend/backend sigan operando sin requerir rollback de DDL.
