# Script para crear la base de datos PsyConnect en PostgreSQL
# Uso: .\setup-postgres.ps1 -Password "tu_password"

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "🐘 Configurando PostgreSQL para PsyConnect..." -ForegroundColor Cyan

# Configurar variables de entorno
$env:PGPASSWORD = $Password
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

# Verificar que psql existe
if (-not (Test-Path $psqlPath)) {
    # Intentar con PostgreSQL 18
    $psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
    if (-not (Test-Path $psqlPath)) {
        Write-Host "❌ No se encontró psql.exe" -ForegroundColor Red
        Write-Host "Por favor verifica la ruta de instalación de PostgreSQL" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ PostgreSQL encontrado en: $psqlPath" -ForegroundColor Green

# Crear base de datos
Write-Host "`n📊 Creando base de datos 'psyconnect'..." -ForegroundColor Cyan

try {
    # Intentar crear la base de datos
    & $psqlPath -U postgres -c "CREATE DATABASE psyconnect;" 2>&1 | Out-Null
    
    # Verificar si fue creada
    $result = & $psqlPath -U postgres -c "\l" 2>&1 | Select-String "psyconnect"
    
    if ($result) {
        Write-Host "✅ Base de datos 'psyconnect' creada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  La base de datos ya existe o hubo un error" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

# Construir connection string
$connectionString = "postgresql://postgres:$Password@localhost:5432/psyconnect"

Write-Host "`n📝 Connection String:" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor White

# Actualizar .env.local
Write-Host "`n📄 Actualizando .env.local..." -ForegroundColor Cyan

$envContent = @"
# PostgreSQL Connection
DATABASE_URL="$connectionString"
DIRECT_URL="$connectionString"

# Auth (NextAuth)
NEXTAUTH_SECRET="psyconnect-secret-key-2026-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Flow (Pagos)
FLOW_API_KEY="tu-flow-api-key"
FLOW_SECRET_KEY="tu-flow-secret-key"
FLOW_ENVIRONMENT="sandbox"

# Resend (Emails)
RESEND_API_KEY="re_..."

# SimpleDTE (Boletas - cuando lo necesites)
SIMPLE_DTE_API_KEY="tu-simple-dte-api-key"
SIMPLE_DTE_ENVIRONMENT="sandbox"
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -Force

Write-Host "✅ Archivo .env.local actualizado" -ForegroundColor Green

Write-Host "`n🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
Write-Host "1. Actualizar schema.prisma (provider = 'postgresql')" -ForegroundColor White
Write-Host "2. Ejecutar: npx prisma db push" -ForegroundColor White
Write-Host "3. Ejecutar: npx prisma generate" -ForegroundColor White

# Limpiar password del entorno
Remove-Item Env:\PGPASSWORD
