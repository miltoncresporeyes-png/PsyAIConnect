# PsyAI - Script para programar procesamiento de cola de boletas
# Este script configura una tarea programada para procesar la cola cada 5 minutos

$TaskName = "PsyAI_BillingQueue_Process"
$ScriptPath = "$PSScriptRoot\process-billing-queue.ps1"
$Time = "*/5 * * * *"  # Cada 5 minutos (formato cron para futuro uso)

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

# Crear la acción - ejecutar cada 5 minutos
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""

# Trigger: ejecutar cada 5 minutos
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)

# Principal (SYSTEM o usuario actual)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest

# Configuración
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar la tarea
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "PsyAI - Procesamiento de cola de boletas SII cada 5 minutos"

Write-Host "Tarea '$TaskName' creada exitosamente." -ForegroundColor Green
Write-Host "Se ejecutará cada 5 minutos" -ForegroundColor Cyan

# Mostrar información
Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
