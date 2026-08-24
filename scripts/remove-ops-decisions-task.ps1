param(
    [string]$TaskName = "PsyConnect-Phase5-WeeklyDecisions"
)

$ErrorActionPreference = "Stop"

Write-Host "Eliminando tarea semanal de decisiones '$TaskName'..."
schtasks /Delete /F /TN $TaskName | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "No se pudo eliminar la tarea semanal de decisiones."
}

Write-Host "Tarea semanal de decisiones eliminada correctamente."
