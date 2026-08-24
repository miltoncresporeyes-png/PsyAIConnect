param(
    [string]$TaskName = "PsyConnect-Phase5-OpsReport"
)

$ErrorActionPreference = "Stop"

Write-Host "Eliminando tarea programada '$TaskName'..."
schtasks /Delete /F /TN $TaskName | Out-Null

Write-Host "Tarea eliminada correctamente."
