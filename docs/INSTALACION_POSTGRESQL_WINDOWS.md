# 🐘 Guía de Instalación PostgreSQL en Windows

## 📥 Paso 1: Descargar PostgreSQL

### Opción Recomendada: Instalador Oficial

1. **Ir al sitio oficial**: https://www.postgresql.org/download/windows/
2. **Click en "Download the installer"** (EnterpriseDB)
3. **Descargar la versión 16.x** (última estable) para Windows x86-64

**Link directo**: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

---

## 🔧 Paso 2: Ejecutar el Instalador

### 2.1 Iniciar instalación
1. Ejecutar el archivo descargado (ej: `postgresql-16.1-1-windows-x64.exe`)
2. Click en "Next" en la pantalla de bienvenida

### 2.2 Directorio de instalación
- **Dejar el default**: `C:\Program Files\PostgreSQL\16`
- Click "Next"

### 2.3 Seleccionar componentes
**Marcar TODOS**:
- ✅ PostgreSQL Server
- ✅ pgAdmin 4 (interfaz gráfica)
- ✅ Stack Builder (opcional)
- ✅ Command Line Tools

Click "Next"

### 2.4 Directorio de datos
- **Dejar el default**: `C:\Program Files\PostgreSQL\16\data`
- Click "Next"

### 2.5 **IMPORTANTE: Establecer Password**

**⚠️ ANOTA ESTA PASSWORD:**
```
Password sugerido: psyconnect2026
```

- Ingresar password dos veces
- **No olvides este password**, lo necesitarás después
- Click "Next"

### 2.6 Puerto
- **Dejar el default**: `5432`
- Click "Next"

### 2.7 Locale
- **Dejar el default**: `[Default locale]`
- Click "Next"

### 2.8 Resumen
- Revisar configuración
- Click "Next"

### 2.9 Instalación
- Click "Next" para comenzar
- **Esperar 5-10 minutos** (instalación + inicialización)
- **Desmarcar** "Stack Builder" al finalizar (no es necesario)
- Click "Finish"

---

## ✅ Paso 3: Verificar Instalación

### 3.1 Abrir PowerShell

```powershell
# Verificar que PostgreSQL está corriendo
Get-Service postgresql*

# Deberías ver:
# Status: Running
# Name: postgresql-x64-16
```

### 3.2 Probar conexión

```powershell
# Navegar al directorio de PostgreSQL
cd "C:\Program Files\PostgreSQL\16\bin"

# Conectar a PostgreSQL (usa el password que estableciste)
.\psql -U postgres

# Si conecta exitosamente verás:
# postgres=#
```

**Para salir de psql**: escribe `\q` y Enter

---

## 🗄️ Paso 4: Crear Base de Datos para PsyConnect

### Opción A: Usando pgAdmin (GUI - Recomendado)

1. **Abrir pgAdmin 4**
   - Buscar "pgAdmin 4" en el menú inicio
   - Click en "Servers" → "PostgreSQL 16"
   - Ingresar el password: `psyconnect2026`

2. **Crear Database**
   - Click derecho en "Databases"
   - "Create" → "Database"
   - **Name**: `psyconnect`
   - **Owner**: `postgres`
   - Click "Save"

3. ✅ **Listo!** Deberías ver `psyconnect` en la lista

### Opción B: Usando Command Line

```powershell
# En el directorio bin de PostgreSQL
cd "C:\Program Files\PostgreSQL\16\bin"

# Crear la base de datos
.\psql -U postgres -c "CREATE DATABASE psyconnect;"

# Verificar
.\psql -U postgres -c "\l"
# Deberías ver "psyconnect" en la lista
```

---

## 🔗 Paso 5: Obtener la Connection String

Tu connection string será:

```
postgresql://postgres:psyconnect2026@localhost:5432/psyconnect
```

**Formato explicado**:
- `postgresql://` - Protocolo
- `postgres` - Usuario (default)
- `psyconnect2026` - Password (la que estableciste)
- `localhost` - Host (local)
- `5432` - Puerto (default)
- `psyconnect` - Nombre de la database

---

## ⚠️ Troubleshooting

### Problema: "El servicio no inicia"

```powershell
# Iniciar servicio manualmente
net start postgresql-x64-16
```

### Problema: "Puerto 5432 en uso"

```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :5432

# Si hay conflicto, cambiar el puerto durante instalación a 5433
# Y usar: postgresql://postgres:psyconnect2026@localhost:5433/psyconnect
```

### Problema: "psql no reconocido"

**Agregar PostgreSQL al PATH**:

1. Abrir "Variables de Entorno"
2. En "Variables del sistema", editar "Path"
3. Agregar: `C:\Program Files\PostgreSQL\16\bin`
4. Reiniciar PowerShell

---

## 📝 Checklist de Instalación

- [ ] PostgreSQL 16.x descargado
- [ ] Instalador ejecutado
- [ ] Password establecida: `psyconnect2026`
- [ ] Servicio corriendo (Status: Running)
- [ ] Base de datos `psyconnect` creada
- [ ] Connection string obtenida
- [ ] Conexión probada (psql o pgAdmin)

---

## 🚀 Siguiente Paso

Una vez completado el checklist:

1. **Copia tu connection string** (probablemente será la sugerida arriba)
2. **Regresa a este chat**
3. **Escribe**: "PostgreSQL instalado, connection string: [tu string]"

O simplemente escribe: **"Listo PostgreSQL"** si usaste la password sugerida.

---

## 💡 Tips Útiles

### pgAdmin 4
- **Dashboard visual** muy útil
- Ver tablas, ejecutar queries
- Monitorear performance

### Backup/Restore
```powershell
# Backup
.\pg_dump -U postgres -d psyconnect > backup.sql

# Restore
.\psql -U postgres -d psyconnect < backup.sql
```

### Ver conexiones activas
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'psyconnect';
```

---

**Tiempo estimado total**: 15-30 minutos

¡Éxito con la instalación! 🎉
