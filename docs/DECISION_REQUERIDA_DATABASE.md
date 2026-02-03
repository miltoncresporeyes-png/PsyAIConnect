# ⚠️ Limitación de SQLite con Enums - Decisión Requerida

## 🔴 Problema Detectado

Durante la implementación del sistema de matching por previsión, detecté que **SQLite no soporta ENUMs nativamente**. El schema actual de PsyConnect ya usa múltiples enums (UserRole, Gender, HealthSystem, etc.) lo cual Prisma maneja mediante emulación, pero al agregar las nuevas tablas con más enums, Prisma no puede crear la migración correctamente.

## 🤔 Opciones Disponibles

### Opción 1: Migrar a PostgreSQL (Recomendado) ⭐

**Ventajas**:
- ✅ Soporte nativo completo de ENUMs
- ✅ Mejor performance con índices
- ✅ Preparado para escala
- ✅ Soporte de features avanzadas (Full-text search, JSON, etc.)
- ✅ Usado en producción por la mayoría de SaaS

**Desventajas**:
- ❌ Requiere instalar PostgreSQL local (o Docker)
- ❌ Necesita configurar nueva conexión
- ❌ Migrar datos existentes (si los hay)

**Pasos para migrar**:
```bash
# 1. Instalar PostgreSQL (o usar Docker)
docker run --name psyconnect-db -e POSTGRES_PASSWORD=dev123 -e POSTGRES_DB=psyconnect -p 5432:5432 -d postgres

# 2. Actualizar .env.local
DATABASE_URL="postgresql://postgres:dev123@localhost:5432/psyconnect"

# 3. Cambiar provider en schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 4. Ejecutar migración
npx prisma db push

# 5. Generar cliente
npx prisma generate
```

**Tiempo estimado**: 30 minutos

---

### Opción 2: Continuar con SQLite usando Strings

**Ventajas**:
- ✅ No requiere cambios de infraestructura
- ✅ Funciona inmediatamente
- ✅ Más simple para desarrollo local

**Desventajas**:
- ❌ Menos type-safety
- ❌ Necesita validación manual en código
- ❌ No escalable para producción

**Cambios requeridos**:
1. Reemplazar TODOS los enums con Strings
2. Crear funciones de validación para cada campo
3. Documentar valores permitidos

**Código modificado**:
```prisma
// En lugar de:
enum HealthSystem {
  FONASA
  ISAPRE
  PRIVATE
  NONE
}

// Usar:
model PatientProfile {
  healthSystem String? // Valores: "FONASA", "ISAPRE", "PRIVATE", "NONE"
}
```

**Tiempo estimado**: 2-3 horas de refactoring

---

### Opción 3: Implementar solo Backend sin DB (Temporal)

**Ventajas**:
- ✅ No bloquea el desarrollo
- ✅ Puedes probar la lógica de negocio
- ✅ Implementar UI sin persistencia

**Desventajas**:
- ❌ No persiste datos
- ❌ Requiere trabajo adicional después

**Approach**:
1. Crear los endpoints API con datos mockeados
2. Implementar la lógica de matching
3. Crear UI
4. Migrar a PostgreSQL cuando esté listo

**Tiempo estimado**: 1 hora para mockear datos

---

## 💡 Recomendación del CTO

**Migrar a PostgreSQL (Opción 1)**

**Razones**:
1. **Producción Real**: Si PsyConnect va a producción, PostgreSQL es estándar de industria
2. **Escalabilidad**: Soporta millones de registros sin problemas
3. **Features Avanzadas**: Full-text search para búsquedas, JSON para metadata flexible
4. **SimpleDTE**: La integración de boletas funcionará mejor con transacciones robustas
5. **Costo**: PostgreSQL es gratis y tiene excelente soporte

**¿Cuándo hacerlo?**:
- 🟢 **AHORA** si estás en fase de desarrollo (fácil de migrar)
- 🟡 **Antes del MVP** si tienes datos de prueba
- 🔴 **Urgente** si planeas lanzar en 1-2 meses

---

## 📊 Comparación Técnica

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| ENUMs nativos | ❌ | ✅ |
| Full-text search | Limitado | ✅ Potente |
| JSON fields | Básico | ✅ Avanzado |
| Concurrent writes | ❌ Limitado | ✅ Excelente |
| Max DB size | 281 TB teórico, ~1GB práctico | Sin límite práctico |
| Transacciones | ✅ Básico | ✅ Avanzado |
| Hosting | Archivo local | Render, Supabase, Railway (gratis) |
| Type safety | Mediante Prisma | Nativo |
| Backups | Manual | Automáticos |

---

## 🚀 Mi Sugerencia de Acción

Dado que estás implementando features complejas (matching financiero, boletas automáticas), te sugiero:

### Plan A (Ideal - 1 hora)
```bash
# 1. Levantar PostgreSQL con Docker
docker run --name psyconnect-db \
  -e POSTGRES_PASSWORD=psyconnect2026 \
  -e POSTGRES_DB=psyconnect \
  -p 5432:5432 \
  -d postgres

# 2. Actualizar .env.local
echo 'DATABASE_URL="postgresql://postgres:psyconnect2026@localhost:5432/psyconnect"' > .env.local

# 3. Cambiar schema.prisma
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }

# 4. Migrar
npx prisma db push

# 5. Listo! 🎉
```

### Plan B (Si no quieres Docker - 1.5 horas)
1. Descargar PostgreSQL installer de postgresql.org
2. Instalar con password `psyconnect2026`
3. Crear DB `psyconnect`
4. Seguir pasos 2-4 del Plan A

---

## ❓ Decisión Requerida

**¿Qué opción prefieres?**

### Opción 1: PostgreSQL con Docker ✅
Escribe: "PostgreSQL con Docker"

### Opción 2: PostgreSQL instalado localmente
Escribe: "PostgreSQL instalado"

### Opción 3: Continuar con SQLite (sin enums)
Escribe: "Continuar SQLite"

### Opción 4: Mockear por ahora, decidir después
Escribe: "Mockear ahora"

---

## 📝 Notas Importantes

- **Producción**: Supabase ofrece PostgreSQL gratis con 500MB
- **CI/CD**: GitHub Actions tiene PostgreSQL pre-instalado
- **Vercel**: Se integra perfectamente con PostgreSQL (Vercel Postgres)
- **Performance**: PostgreSQL es más rápido para queries complejas (como el matching)

---

**Estado actual**: ⏸️ Implementación pausada esperando decisión sobre base de datos

**Próximo paso**: Una vez decidas, continuaré con la implementación del matching engine.

**Tiempo total estimado hasta deploy**: 
- PostgreSQL: 6-7 semanas
- SQLite: 7-8 semanas (más refactoring)

---

¿Cuál opción prefieres? 🚀
