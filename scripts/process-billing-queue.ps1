@echo off
REM =====================================================
REM PsyAI - Procesador de Cola de Boletas SII
REM Este script se ejecuta cada 5 minutos para procesar
REM boletas pendientes
REM =====================================================

setlocal

echo ====================================================
echo PsyAI - Procesando cola de boletas SII
echo ====================================================
echo.

REM Llamar a la API de procesamiento de cola
curl -s -X POST http://localhost:3000/api/billing/queue ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"process\"}"

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error al procesar la cola
    exit /b 1
)

echo.
echo Procesamiento completado

endlocal
