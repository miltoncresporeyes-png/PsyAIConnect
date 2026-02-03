# PsyConnect 🧠

Plataforma de salud mental que conecta pacientes con profesionales verificados en Chile.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **Base de datos**: PostgreSQL + Prisma ORM
- **Cifrado**: AES-256-GCM para notas clínicas
- **Deploy**: Vercel

## 📦 Instalación Local

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/psyconnect.git
cd psyconnect

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar cliente Prisma
npx prisma generate

# 5. Crear tablas en la base de datos
npx prisma db push

# 6. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔐 Variables de Entorno

Crear archivo `.env` con:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/psyconnect"

# NextAuth
NEXTAUTH_SECRET="tu-secreto-de-32-caracteres-minimo"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Cifrado (generar con: openssl rand -hex 32)
ENCRYPTION_KEY="64-caracteres-hexadecimales"
```

## 🚢 Deploy en Vercel

### 1. Preparar proyecto

```bash
# Verificar build
npm run build

# Commitear cambios
git add .
git commit -m "Ready for production"
git push
```

### 2. Conectar con Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar deploy
vercel

# Para producción
vercel --prod
```

### 3. Configurar variables en Vercel

En el dashboard de Vercel > Settings > Environment Variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URL de Supabase/Neon/PlanetScale |
| `NEXTAUTH_SECRET` | Generado con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` |
| `GOOGLE_CLIENT_ID` | Desde Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Desde Google Cloud Console |
| `ENCRYPTION_KEY` | Generado con `openssl rand -hex 32` |

### 4. Configurar base de datos

Opciones recomendadas:
- **Supabase** (gratis, PostgreSQL)
- **Neon** (gratis, PostgreSQL serverless)
- **PlanetScale** (MySQL compatible)

```bash
# Después de configurar DATABASE_URL
npx prisma db push
```

### 5. Configurar Google OAuth

En [Google Cloud Console](https://console.cloud.google.com):

1. Crear proyecto
2. APIs & Services > OAuth consent screen
3. Credentials > Create OAuth Client ID
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://tu-dominio.vercel.app/api/auth/callback/google` (prod)

## 📁 Estructura del Proyecto

```
├── prisma/
│   └── schema.prisma      # Modelos de datos (12 modelos)
├── src/
│   ├── app/               # App Router pages
│   │   ├── api/           # 15 API routes
│   │   ├── admin/         # Panel de administración
│   │   ├── dashboard/     # Dashboard + sub-rutas
│   │   └── ...
│   ├── components/        # Componentes React
│   ├── lib/               # Utilidades
│   └── middleware.ts      # Auth + Security headers
├── vercel.json            # Configuración Vercel
└── package.json
```

## 🔒 Seguridad

- **Autenticación**: NextAuth.js con JWT
- **Contraseñas**: bcrypt (12 rounds)
- **Verificación de Email**: Tokens seguros con expiración
- **Recuperación de Contraseña**: Flujo seguro con tokens de un solo uso
- **Notas clínicas**: Cifrado AES-256-GCM
- **Headers**: X-Frame-Options, CSP, XSS Protection
- **GDPR**: Exportación de datos del usuario

## 📊 Features

### Para Pacientes
- ✅ Búsqueda de profesionales
- ✅ Reserva de citas online
- ✅ Historial de sesiones
- ✅ Exportación de datos
- ✅ Verificación de email

### Para Profesionales
- ✅ Perfil público personalizable
- ✅ Gestión de disponibilidad
- ✅ Notas clínicas cifradas
- ✅ Dashboard de métricas

### Administración
- ✅ Panel con estadísticas
- ✅ Verificación de profesionales
- ✅ Gestión de usuarios

### Autenticación
- ✅ Login con Google OAuth
- ✅ Login con email/contraseña
- ✅ Recuperación de contraseña
- ✅ Verificación de email
- ✅ Emails transaccionales (Resend)

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint
```

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Add nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

---

Desarrollado con ❤️ para la salud mental en Chile
