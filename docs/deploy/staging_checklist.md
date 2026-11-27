# Checklist de staging (Railway)

Objetivo: probar el flujo completo (reserva → aceptación → sala de Meet → cierre) en un entorno aislado antes de
producción. Staging usa **su propia base de datos** y un dominio temporal de Railway.

> Esquema: Railway ejecuta `prisma db push --accept-data-loss` al arrancar (ver `railway.json`). Los cambios de esta
> versión son **solo aditivos** (tablas y columnas nuevas). Aun así, haz un respaldo de producción antes de promover.

## 1. Crear el entorno
1. Railway → proyecto → **Environments → New Environment → Duplicate** desde `production`. Nómbralo `staging`.
2. Confirma que `staging` tiene **su propio Postgres** (no la base de producción) y que el servicio de la app apunta a él.
3. Anota el dominio temporal del servicio (ej. `https://psyaiconnect-staging.up.railway.app`).

## 2. Variables de entorno (entorno `staging`)
| Variable | Valor |
|---|---|
| `NEXTAUTH_URL` | el dominio temporal de staging (sin `/` final) |
| `NEXTAUTH_SECRET` | uno distinto al de producción |
| `ENCRYPTION_KEY` | uno propio de staging (los datos no se comparten con producción) |
| `WAITLIST_MODE` | `false` |
| `GOOGLE_MEET_CLIENT_ID` / `GOOGLE_MEET_CLIENT_SECRET` | los del cliente OAuth de Google Cloud |
| `CRON_SECRET` | valor largo y aleatorio (`openssl rand -hex 32`) |
| `RESEND_API_KEY` | solo si quieres correos reales en staging; si no, quedan simulados en logs |

## 3. Google Cloud
1. Cliente OAuth → **URI de redirección autorizadas** → agrega `<dominio de staging>/api/google/callback`.
2. Si la app está en modo *Pruebas*, el correo con que autorizarás debe estar en **Usuarios de prueba**.

## 4. Desplegar
1. Sube la rama a GitHub y apunta el entorno `staging` a esa rama (Settings → Source → Branch).
2. Espera el build. Verifica `GET <staging>/api/health` → 200.

## 5. Cron
La ruta `GET /api/cron/recordatorios-citas` envía recordatorios (24 h y 2 h), libera horarios sin reconfirmar y caduca
solicitudes sin respuesta. Necesita que algo la llame cada pocos minutos con la clave `CRON_SECRET`.

**a) Generar la clave** (PowerShell; no la compartas por chat) y guardarla como `CRON_SECRET` en el servicio de la app:
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**b) Crear el servicio del cron** (mismo proyecto y entorno):
1. **New → Empty Service**, nombre `cron-recordatorios`.
2. **Settings → Source → Docker Image**: `curlimages/curl:latest`.
3. **Settings → Deploy**:
   - Custom Start Command:
     ```
     sh -c 'curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/recordatorios-citas"'
     ```
   - Cron Schedule: `*/10 * * * *` (Railway permite un mínimo de 5 minutos).
4. **Variables** del servicio cron:
   - `CRON_SECRET` = `${{PsyAIConnect.CRON_SECRET}}` (referencia a la variable de la app; ajusta el nombre del servicio si es otro).
   - `APP_URL` = dominio del entorno (staging: el temporal de Railway; producción: `https://psydoctor.cl`).
5. Desplegar el servicio.

**c) Comprobar**
```powershell
curl.exe -s -H "Authorization: Bearer TU_CLAVE" https://TU-DOMINIO/api/cron/recordatorios-citas
```
Respuesta esperada: `{"ok":true,"reminded24h":0,"reminded2h":0,"released":0,"expiredPending":0}`. Sin la cabecera debe
responder 401. En los registros del servicio cron debe haber una ejecución cada 10 minutos con código de salida 0.

**Alternativa recomendada: GitHub Actions** (`.github/workflows/cron-recordatorios.yml`). Evita depender de un
contenedor en Railway y deja los registros visibles en GitHub:
1. GitHub → Settings → Secrets and variables → Actions → **New repository secret**:
   - `APP_URL`: dominio exacto y sin `/` final (ej. `https://www.psydoctor.cl`).
   - `CRON_SECRET`: el mismo valor que la variable de la app en Railway.
2. El flujo corre cada 10 minutos (GitHub puede retrasarlo unos minutos) y solo desde la rama `master`.
3. Probar a mano: Actions → «Cron de recordatorios de citas» → **Run workflow**. Debe terminar en verde y mostrar
   `HTTP 200` con el JSON `{"ok":true,...}`. Un 401 indica un `CRON_SECRET` distinto; un 404 o 3xx, un `APP_URL` incorrecto.
4. Si usas este camino, elimina el servicio `cron-recordatorios` de Railway para no duplicar ejecuciones.

**Otra alternativa:** un servicio externo (p. ej. cron-job.org) que llame a la misma URL cada 10 minutos con la
cabecera `Authorization: Bearer <CRON_SECRET>`.

## 6. Datos de prueba
Registra desde la web: una **profesional**, un **paciente** y un **administrador** (el rol admin se asigna por SQL):
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = '<correo del admin>';
UPDATE "Professional" SET "verificationStatus" = 'VERIFIED', "isPublic" = true
 WHERE "userId" IN (SELECT id FROM "User" WHERE email = '<correo de la profesional>');
```
La profesional debe completar su perfil: duración de sesión, formas de pago, y **disponibilidad** (`/dashboard/disponibilidad`).

## 7. Conectar Google Meet
Como admin: `/admin/salas` → **Conectar cuenta de Google** → elegir la cuenta → aceptar el permiso.
Debe mostrar «Conectada como …».

## 8. Prueba de punta a punta
- [ ] El paciente ve a la profesional en `/buscar` y su perfil público (formas de pago, duración).
- [ ] El calendario de reserva muestra bloques de la duración real (ej. 09:00, 09:50, 10:40…).
- [ ] El paciente reserva un horario **a ~30 min** y acepta la política de cancelación.
- [ ] La profesional recibe el aviso y **acepta** la cita (panel o detalle).
- [ ] El paciente recibe el correo de confirmación con «Agregar a Google Calendar»; descarga el `.ics`.
- [ ] El paciente ve la cita sin enlace de videollamada (no se filtra antes de tiempo).
- [ ] Con la ventana abierta (15 min antes): ambos pulsan **Unirme / Iniciar sesión** → misma sala de Meet.
- [ ] La profesional pulsa **Finalizar sesión** → la cita queda `COMPLETED`.
- [ ] Chat paciente ↔ profesional habilitado.
- [ ] Cron: una cita sin reconfirmar a <3 h se libera; una `PENDING` a <2 h caduca.
- [ ] No-show: tras 15 min sin que el paciente pulse «Unirme», la profesional puede marcar «No se conectó».

## 9. Promover a producción
1. Respaldo de la base de producción (Railway → Postgres → Backups, o `pg_dump`).
2. Agregar en `production`: `GOOGLE_MEET_*`, `CRON_SECRET`, `NEXTAUTH_URL=https://psydoctor.cl`. **No cambiar `ENCRYPTION_KEY`.**
3. Google Cloud: agregar `https://psydoctor.cl/api/google/callback`; revisar estado de publicación de la app.
4. Fusionar la rama a `master` (dispara el despliegue). Crear el servicio cron en `production`.
5. Conectar la cuenta de Google en `https://psydoctor.cl/admin/salas`.
6. Mantener `WAITLIST_MODE=true` en producción hasta que quieras abrir el sitio al público.

## Vuelta atrás
Railway → Deployments → redeploy de la versión anterior. Los cambios de esquema son aditivos, por lo que no requieren revertirse.
