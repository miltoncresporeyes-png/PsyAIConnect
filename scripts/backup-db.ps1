@echo off
REM =====================================================
REM PsyAI - Script de Backup PostgreSQL Automatizado
REM Ejecutar: .\backup-db.ps1
REM =====================================================

setlocal enabledelayedexpansion

REM --- Configuración ---
set DB_NAME=psyai
set DB_USER=postgres
set DB_HOST=localhost
set BACKUP_DIR=%~dp0backups
set RETENTION_DAYS=30

REM --- Credenciales (usar variables de entorno en producción) ---
set PGPASSWORD=%PGPASSWORD%

REM --- Crear directorio de backups si no existe ---
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM --- Generar nombre de archivo con timestamp ---
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "MIN=%dt:~10,2%"

set "FILENAME=psyai_backup_%YYYY%%MM%%DD%_%HH%%MIN%.sql"
set "FULL_PATH=%BACKUP_DIR%\%FILENAME%"

echo ====================================================
echo PsyAI - Backup de Base de Datos PostgreSQL
echo ====================================================
echo Fecha: %YYYY%-%MM%-%DD% %HH%:%MIN%
echo Archivo: %FILENAME%
echo.

REM --- Verificar que pg_dump existe ---
where pg_dump >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: pg_dump no encontrado. Asegurate de tener PostgreSQL instalado.
    exit /b 1
)

REM --- Ejecutar backup ---
echo Iniciando backup...
echo.

pg_dump -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -F c -b -v -f "%FULL_PATH%"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: El backup fallo con codigo %ERRORLEVEL%
    exit /b 1
)

REM --- Verificar tamaño del backup ---
for %%A in ("%FULL_PATH%") do set "SIZE=%%~zA"
set /a SIZE_MB=%SIZE% / 1048576

echo.
echo ====================================================
echo Backup completado exitosamente
echo ====================================================
echo Archivo: %FULL_PATH%
echo Tamaño: %SIZE_MB% MB
echo.

REM --- Limpiar backups antiguos ---
echo Limpiando backups mayores a %RETENTION_DAYS% dias...
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -%RETENTION_DAYS% /c "cmd /c del @path"

echo.
echo Proceso de backup finalizado.

REM --- Notificación (opcional: configurar con Slack/Discord) ---
if defined SLACK_WEBHOOK (
    curl -s -X POST -H 'Content-type: application/json' --data "{\"text\":\"✅ Backup completado: %FILENAME% (%SIZE_MB% MB)\"}" %SLACK_WEBHOOK%
)

endlocal
