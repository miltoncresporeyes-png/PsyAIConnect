# =====================================================
# PsyAI - Programador de Backups Automáticos (Windows)
# =====================================================
# Este script configura una tarea programada para ejecutar
# backups automáticos diarios de PostgreSQL
# =====================================================

# Configuración
$TaskName = "PsyAI_Daily_Backup"
$ScriptPath = "$PSScriptRoot\backup-db.ps1"
$Time = "02:00"  # 2:00 AM - horario de bajo uso

# Verificar si ya existe la tarea
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($ExistingTask) {
    Write-Host "La tarea '$TaskName' ya existe." -ForegroundColor Yellow
    $Confirm = Read-Host "Desea recrearla? (s/n)"
    if ($Confirm -ne 's') {
        exit 0
    }
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Crear la acción
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""

# Crear el trigger (diario)
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time

# Crear principal (SYSTEM o usuario actual)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest

# Configuración
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar la tarea
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "PsyAI - Backup automático diario de PostgreSQL"

Write-Host "Tarea '$TaskName' creada exitosamente." -ForegroundColor Green
Write-Host "Se ejecutará diariamente a las $Time" -ForegroundColor Cyan

# Mostrar información de la tarea
Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
