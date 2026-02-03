---
description: Guía completa para deploy a producción con Supabase + Vercel
---

# 🚀 Deploy a Producción - PsyConnect

## Requisitos Previos

- ✅ Cuenta de GitHub con el repositorio
- ✅ Build local exitoso (`npm run build`)
- ⬜ Cuenta en [Supabase](https://supabase.com) (gratis)
- ⬜ Cuenta en [Vercel](https://vercel.com) (gratis)
- ⬜ Cuenta en [Resend](https://resend.com) (gratis)
- ⬜ Proyecto en [Google Cloud Console](https://console.cloud.google.com)

---

## Paso 1: Configurar Base de Datos en Supabase

### 1.1 Crear Proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en "New Project"
3. Configurar:
   - **Name**: `psyconnect-prod`
   - **Database Password**: (genera uno seguro y guárdalo)
   - **Region**: `South America (São Paulo)` - más cercano a Chile
4. Espera ~2 minutos a que se cree

### 1.2 Obtener Connection String
1. En el dashboard, ve a: **Settings → Database**
2. En la sección "Connection string", copia la URL de **URI** (modo pooling):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
3. También copia la **Direct URL** para migraciones:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 1.3 Guardar credenciales
Guarda en un lugar seguro:
- `DATABASE_URL` (pooling) - para la app
- `DIRECT_URL` - para prisma migrate

---

## Paso 2: Configurar Resend para Emails

### 2.1 Crear cuenta y API Key
1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. En el dashboard, ve a **API Keys**
3. Click en "Create API Key"
   - **Name**: `psyconnect-prod`
   - **Permission**: Full access
4. Copia la API key generada (solo se muestra una vez)

### 2.2 Configurar dominio (opcional pero recomendado)
1. Ve a **Domains** → Add Domain
2. Sigue las instrucciones para verificar tu dominio

### 2.3 Guardar credenciales
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=PsyConnect <noreply@tudominio.cl>
```

---

## Paso 3: Configurar Google OAuth

### 3.1 Crear proyecto en Google Cloud
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto: "PsyConnect"

### 3.2 Configurar OAuth Consent Screen
1. Ve a **APIs & Services → OAuth consent screen**
2. Selecciona "External"
3. Completa:
   - App name: PsyConnect
   - User support email: tu email
   - Developer contact: tu email
4. Scopes: email, profile, openid
5. Test users: agrega tu email para testing

### 3.3 Crear credenciales OAuth
1. Ve a **APIs & Services → Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "PsyConnect Web"
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://psyconnect.vercel.app
   https://tudominio.cl
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://psyconnect.vercel.app/api/auth/callback/google
   https://tudominio.cl/api/auth/callback/google
   ```
7. Copia Client ID y Client Secret

### 3.4 Guardar credenciales
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

---

## Paso 4: Generar Secretos de Seguridad

### 4.1 NEXTAUTH_SECRET
En PowerShell o terminal:
```powershell
# Generar secreto para NextAuth
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Guarda el resultado como `NEXTAUTH_SECRET`

### 4.2 ENCRYPTION_KEY
```powershell
# Generar clave de cifrado para notas clínicas
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Guarda el resultado como `ENCRYPTION_KEY`

⚠️ **IMPORTANTE**: Guarda estos secretos en un lugar muy seguro. Si pierdes ENCRYPTION_KEY, las notas clínicas no se podrán descifrar.

---

## Paso 5: Deploy en Vercel

### 5.1 Conectar repositorio
1. Ve a [vercel.com](https://vercel.com) y logea con GitHub
2. Click "Add New..." → "Project"
3. Importa tu repositorio de PsyConnect
4. Framework: Next.js (detectado automáticamente)

### 5.2 Configurar variables de entorno
En la sección "Environment Variables", agrega:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | postgresql://... (de Supabase, pooling) |
| `DIRECT_URL` | postgresql://... (de Supabase, direct) |
| `NEXTAUTH_SECRET` | (generado en paso 4.1) |
| `NEXTAUTH_URL` | https://tu-proyecto.vercel.app |
| `GOOGLE_CLIENT_ID` | (de Google Cloud) |
| `GOOGLE_CLIENT_SECRET` | (de Google Cloud) |
| `ENCRYPTION_KEY` | (generado en paso 4.2) |
| `RESEND_API_KEY` | (de Resend) |
| `EMAIL_FROM` | PsyConnect <noreply@tudominio.cl> |
| `NODE_ENV` | production |

### 5.3 Deploy
1. Click "Deploy"
2. Espera a que termine el build (~2-3 minutos)

---

## Paso 6: Ejecutar Migraciones de Base de Datos

### 6.1 Opción A: Desde Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Linkear proyecto
vercel link

# Ejecutar prisma con variables de producción
vercel env pull .env.production.local
npx prisma db push
```

### 6.2 Opción B: Desde local con DATABASE_URL de producción
```bash
# Exportar temporalmente la URL de producción
$env:DATABASE_URL="postgresql://..."
npx prisma db push
```

---

## Paso 7: Verificación Post-Deploy

### 7.1 Checklist de funcionalidad
- [ ] Landing page carga correctamente
- [ ] Registro con email funciona
- [ ] Login con Google funciona
- [ ] Emails se envían correctamente
- [ ] Búsqueda de profesionales funciona
- [ ] Dashboard carga datos

### 7.2 Configurar dominio personalizado (opcional)
1. En Vercel → Project → Settings → Domains
2. Agrega tu dominio
3. Configura DNS según instrucciones

### 7.3 Actualizar NEXTAUTH_URL
Si usas dominio personalizado, actualiza `NEXTAUTH_URL` en Vercel.

---

## 🔒 Variables de Entorno - Resumen

```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="[GENERADO]"
NEXTAUTH_URL="https://tu-dominio.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Seguridad
ENCRYPTION_KEY="[64 caracteres hex]"

# Email
RESEND_API_KEY="re_xxx"
EMAIL_FROM="PsyConnect <noreply@tudominio.cl>"

# Pagos (cuando esté listo)
# FLOW_API_KEY=""
# FLOW_SECRET_KEY=""

NODE_ENV="production"
```

---

## 📝 Notas Importantes

1. **Nunca commitees credenciales** al repositorio
2. **Guarda ENCRYPTION_KEY** en múltiples lugares seguros
3. **Supabase gratis** incluye 500MB de DB y 2GB de bandwidth
4. **Vercel gratis** incluye 100GB de bandwidth
5. **Resend gratis** incluye 3,000 emails/mes

---

## 🆘 Troubleshooting

### Error: "prisma generate failed"
Asegúrate de que `vercel.json` tiene:
```json
"buildCommand": "prisma generate && next build"
```

### Error: "NEXTAUTH_URL mismatch"
Verifica que NEXTAUTH_URL coincide exactamente con tu dominio (con https://).

### Error: Database connection
- Verifica que usas la URL de pooling para la app
- La región de Supabase debería ser São Paulo para menor latencia

