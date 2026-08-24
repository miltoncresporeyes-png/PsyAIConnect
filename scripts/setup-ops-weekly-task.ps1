param(
    [string]$TaskName = "PsyConnect-Phase5-WeeklyReview",
    [string]$WeeklyTime = "18:30",
    [string]$Day = "FRI"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runnerPath = Join-Path $PSScriptRoot "run-ops-weekly.bat"

if (-not (Test-Path $runnerPath)) {
    throw "No se encontro el runner: $runnerPath"
}

$reportsDir = Join-Path $repoRoot "docs\reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

Write-Host "Registrando tarea semanal '$TaskName' ($Day $WeeklyTime)..."

schtasks /Create /F /SC WEEKLY /D $Day /ST $WeeklyTime /TN $TaskName /TR $runnerPath | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "No se pudo crear la tarea semanal."
}

Write-Host "Tarea semanal creada correctamente."
Write-Host "Consulta: schtasks /Query /TN $TaskName /V /FO LIST"
