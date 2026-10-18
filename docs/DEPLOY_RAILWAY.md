# Guía de Despliegue en Railway: PsyAI Connect (Modo Lista de Espera)

Este documento detalla el procedimiento completo para desplegar **PsyAI Connect** como un único servicio en [Railway](https://railway.app), respaldado por una base de datos PostgreSQL externa alojada en **Supabase** (usando PgBouncer), y configurado en modo **Lista de Espera** (`WAITLIST_MODE=true`).

---

## 1. Arquitectura de Despliegue

- **Servicio único**: Aplicación Next.js 14 (App Router) corriendo en Node.js (>=20) gestionada vía `railway.json`.
- **Base de datos remota**: Supabase PostgreSQL.
  - Modo Transaction / Pooler (PgBouncer, puerto 6543) para consultas de runtime (`DATABASE_URL`).
  - Conexión directa (puerto 5432 o session pooler) para migraciones Prisma (`DIRECT_URL`).
- **Landing activa**: Modo lista de espera activado en compilación y tiempo de ejecución.
- **DNS y Dominio**: Hostinger apuntando a Railway vía CNAME.
- **Correos transaccionales**: Resend.

---

## 2. Variables de Entorno

> ⚠️ **REGLA DE SEGURIDAD**: Nunca registres ni almacenes contraseñas o llaves secretas en el control de versiones. Configura estas variables en el panel de Railway en **Variables**.

### Matriz de Variables de Entorno

| Variable | Tipo / Formato | Modo Waitlist (`WAITLIST_MODE=true`) | Modo Marketplace General | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | URI postgresql (Transaction Pooler - puerto 6543) | **Requerida** | **Requerida** | Conexión Prisma con `pgbouncer=true` |
| `DIRECT_URL` | URI postgresql (Direct/Session - puerto 5432) | **Requerida** | **Requerida** | Conexión para `prisma migrate deploy` |
| `NEXTAUTH_SECRET` | String aleatorio (≥32 caracteres) | **Requerida** | **Requerida** | Firma de tokens y sesiones NextAuth |
| `NEXTAUTH_URL` | URL absoluta https (`https://tudominio.cl`) | **Requerida** | **Requerida** | Canonical URL de autenticación |
| `NEXT_PUBLIC_APP_URL` | URL absoluta https (`https://tudominio.cl`) | **Requerida** | **Requerida** | URL pública de la aplicación |
| `ENCRYPTION_KEY` | Hexadecimal de 64 caracteres (32 bytes) | **Requerida** | **Requerida** | Cifrado AES-256-GCM de datos clínicos |
| `CLINICAL_HASH_SECRET`| String de hash | **Requerida** | **Requerida** | Hash HMAC para integridad clínica |
| `RESEND_API_KEY` | `re_...` | **Requerida** | **Requerida** | Envío de correos de confirmación |
| `EMAIL_FROM` | Dirección email (`soporte@tudominio.cl`) | **Requerida** | **Requerida** | Remitente de correos |
| `WAITLIST_MODE` | `"true"` o `"false"` | **Requerida** (`"true"`) | `"false"` | Activa redirects de rutas a la landing |
| `NEXT_PUBLIC_WAITLIST_MODE`| `"true"` o `"false"` | **Requerida** (`"true"`) | `"false"` | Visibilidad en cliente de la lista de espera |
| `FLOW_API_KEY` | String | Opcional | **Requerida** | Pasarela de pagos Flow |
| `FLOW_SECRET_KEY` | String | Opcional | **Requerida** | Firma de pagos Flow |
| `DAILY_API_KEY` | String | Opcional | **Requerida** | Videollamadas Daily.co |
| `OPENAI_API_KEY` | `sk-...` | Opcional | **Requerida** | Resumen y asistencia IA clínica |
| `SII_WEBHOOK_SECRET` | String | Opcional | **Requerida** | Boletas electrónicas |
| `SII_WEBHOOK_URL` | URL https | Opcional | **Requerida** | Endpoint boletas electrónicas |
| `GOOGLE_CLIENT_ID` | String OAuth | Opcional | Recomendada | Login con Google |
| `GOOGLE_CLIENT_SECRET` | String OAuth | Opcional | Recomendada | Secreto Google OAuth |
| `NEXT_PUBLIC_SENTRY_DSN` | URL DSN Sentry | Opcional | Recomendada | Monitoreo de errores |
| `TRUSTED_PROXY_COUNT` | Entero positivo (ej: `1` o `2`) | Opcional (por defecto `1`) | Opcional (por defecto `1`) | Número de proxies de confianza desde el final de `x-forwarded-for`. Usar `1` para Railway directo, o `2` si se añade Cloudflare delante de Railway |
| `SEED_API_KEY` | String | **NO DEFINIR** | Opcional (solo si se inicializa) | Llave de ruta /api/seed |

---

## 3. Generación Segura de Secretos Criptográficos

Ejecuta estos comandos en tu terminal local para generar secretos con entropía criptográfica:

```bash
# 1. ENCRYPTION_KEY (debe ser exactamente 64 caracteres hexadecimales = 32 bytes)
openssl rand -hex 32

# 2. NEXTAUTH_SECRET (cadena robusta en base64)
openssl rand -base64 32

# 3. CLINICAL_HASH_SECRET
openssl rand -hex 32
```

> ⚠️ **ADVERTENCIA CRÍTICA**:
> Guarda inmediatamente el valor de `ENCRYPTION_KEY` en un gestor de contraseñas seguro (como 1Password, Bitwarden o KeePass).
> **Si pierdes esta llave, los datos cifrados existentes en la base de datos (fichas clínicas, antecedentes médicos y notas) serán permanentemente irrecuperables.**

---

## 4. Configuración en Railway (`railway.json`)

El repositorio incluye el archivo `railway.json` con la configuración como código:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "preDeployCommand": "npx prisma migrate deploy",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### Comportamiento del Ciclo de Vida:
1. **Pre-build**: `node scripts/check-env.mjs` valida que las variables públicas críticas estén disponibles.
2. **Build**: `prisma generate` genera el cliente y `next build` compila la aplicación optimizada.
3. **Pre-deploy**: Railway ejecuta `npx prisma migrate deploy` usando `DIRECT_URL` para aplicar migraciones pendientes sin interrumpir el servicio.
4. **Healthcheck**: Railway consulta `GET /api/health`. Al obtener status 200 `{ ok: true }`, el tráfico se enruta a la nueva versión (Zero Downtime).
5. **Runtime**: `src/instrumentation.ts` valida al inicio del proceso Node.js que todas las variables requeridas para el modo activo existan y cumplan con los formatos.

---

## 5. Configuración de Dominios y DNS en Hostinger

Para asociar tu dominio propio (ejemplo: `psyai.cl` o `app.psyai.cl`):

1. En **Railway**: Ve a tu servicio > **Settings** > **Networking** > **Custom Domain**.
2. Ingresa tu subdominio o dominio: `app.psyai.cl` o `www.psyai.cl`.
3. Railway te entregará un registro CNAME destino (ejemplo: `xxxx.up.railway.app`).
4. En **Hostinger** (Editor de Zona DNS):
   - **Tipo**: `CNAME`
   - **Nombre / Host**: `app` (o `www`)
   - **Apunta a / Valor**: `xxxx.up.railway.app`
   - **TTL**: 300 o Automático.

> ℹ️ **Nota sobre dominio raíz (apex domain, ej: `psyai.cl` sin www)**:
> El protocolo DNS estándar no permite CNAME en el apex (`@`). Si deseas usar `psyai.cl`, configura en Hostinger una redirección HTTP 301 de `psyai.cl` hacia `www.psyai.cl` (o `app.psyai.cl`), o utiliza un proveedor con soporte de CNAME flattening (como Cloudflare).

---

## 6. Configuración de Correo Transaccional (Resend DNS)

Para que los correos de confirmación de la lista de espera no caigan en spam:

En tu panel de Resend (**Domains** > **Add Domain**), añade tu dominio e ingresa los registros en Hostinger:

1. **DKIM**:
   - Tipo: `TXT`
   - Nombre: `resend._domainkey`
   - Valor: (proporcionado por Resend)
2. **SPF**:
   - Tipo: `TXT`
   - Nombre: `bounces` (o el subdominio asignado)
   - Valor: `v=spf1 include:amazonses.com ~all`
3. **DMARC**:
   - Tipo: `TXT`
   - Nombre: `_dmarc`
   - Valor: `v=DMARC1; p=none; rua=mailto:dmarc@tudominio.cl`

---

## 7. Actualización de Google OAuth (si aplica)

Si habilitas Google Authentication:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) > **APIs y servicios** > **Credenciales**.
2. Edita tu **ID de cliente de OAuth 2.0**.
3. En **Orígenes de JavaScript autorizados**, añade:
   - `https://tu-dominio-en-railway.up.railway.app`
   - `https://tudominio.cl`
4. En **URIs de redireccionamiento autorizados**, añade:
   - `https://tu-dominio-en-railway.up.railway.app/api/auth/callback/google`
   - `https://tudominio.cl/api/auth/callback/google`

---

## 8. Cambio entre Modo Lista de Espera y Marketplace

> ⚠️ **IMPORTANTE**:
> Los redirects de Next.js (`WAITLIST_MODE`) y las constantes del cliente (`NEXT_PUBLIC_WAITLIST_MODE`) se resuelven e incrustan durante la compilación (`next build`).
> **Cambiar estas variables en Railway REQUIERE UN REDEPLOY COMPLETO (Redeploy)** para que tengan efecto en el código generado.

---

## 9. Monitoreo, Control de Costos y Rollback

### Control de Costos en Railway:
1. Mantén la aplicación como **un solo servicio**.
2. En Railway Workspace > **Settings** > **Usage Limits**, configura un **Spend Limit** (tope de gasto mensual, ej: $10 USD) para evitar cobros inesperados ante picos de tráfico.
3. El servicio de Supabase se mantiene en su capa gratuita o plan estándar independiente.

### Procedimiento de Rollback:
1. En Railway > pestaña **Deployments**.
2. Cada despliegue previo exitoso mantiene una imagen inmutable.
3. Para volver a una versión anterior, haz clic en los tres puntos del deployment anterior y selecciona **Rollback**.
4. Si el rollback involucra migraciones de base de datos reversas, realiza la operación manualmente en Supabase con precaución.

---

## 10. Verificación Post-Despliegue

Una vez completado el despliegue en Railway, valida el estado del servicio ejecutando el script de verificación desde tu terminal local:

```bash
node scripts/postdeploy-check.mjs https://tu-servicio.up.railway.app
```

El script validará automáticamente:
- `GET /api/health` retorna 200 `{ ok: true }` y cabecera `Cache-Control: no-store`.
- `/reservar`, `/buscar` y `/registro` responden con redirección `3xx` hacia la landing.
- `/api/seed` responde bloqueado (`401/403/404`).
- Cabeceras de seguridad activas: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy` y `Strict-Transport-Security` (en HTTPS).

---

## 11. Validación de IP Real y Prueba de Rate Limiting

La aplicación determina la IP del cliente leyendo la cabecera `X-Forwarded-For` de derecha a izquierda según `TRUSTED_PROXY_COUNT`:
- **Railway directo**: Deja `TRUSTED_PROXY_COUNT=1` (por defecto). El proxy de Railway añade la IP del visitante al final de la cadena, neutralizando cualquier valor falso inyectado por el cliente al inicio.
- **Cloudflare + Railway**: Configura `TRUSTED_PROXY_COUNT=2` en Railway, para que el sistema tome la IP real añadida por Cloudflare (penúltima) e ignore la IP interna del proxy de Railway.

### Procedimiento de Prueba Post-Despliegue contra Rate Limiting:
Para confirmar que un atacante no puede evadir el rate limit falsificando `X-Forwarded-For`:

1. Realiza peticiones consecutivas hacia el endpoint de la lista de espera inyectando cabeceras falsas:
   ```bash
   # Enviar 10 peticiones rápidas simulando rotación de IP falsa al inicio:
   for i in {1..10}; do
     curl -i -X POST https://tu-servicio.up.railway.app/api/waitlist/patient \
       -H "Content-Type: application/json" \
       -H "X-Forwarded-For: 10.0.0.$i, 1.1.1.$i" \
       -d '{"name":"Test","email":"test@example.com","phone":"+56912345678","comuna":"Santiago","prevision":"FONASA"}'
   done
   ```
2. **Resultado esperado**:
   - Como Railway añade tu IP pública real al final de la cabecera, `getClientIp` detectará siempre tu IP real fija y **no** las IPs falsificadas (`10.0.0.$i`).
   - Tras superar el límite configurado (5 peticiones por ventana), las siguientes solicitudes deben responder con **HTTP 429 Too Many Requests**.
