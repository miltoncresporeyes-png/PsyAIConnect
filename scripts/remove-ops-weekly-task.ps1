param(
    [string]$TaskName = "PsyConnect-Phase5-WeeklyReview"
)

$ErrorActionPreference = "Stop"

Write-Host "Eliminando tarea semanal '$TaskName'..."
schtasks /Delete /F /TN $TaskName | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "No se pudo eliminar la tarea semanal."
}

Write-Host "Tarea semanal eliminada correctamente."
