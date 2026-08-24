param(
    [string]$TaskName = "PsyConnect-Phase5-OpsReport",
    [string]$DailyTime = "18:00"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runnerPath = Join-Path $PSScriptRoot "run-ops-report.bat"

if (-not (Test-Path $runnerPath)) {
    throw "No se encontro el runner: $runnerPath"
}

$reportsDir = Join-Path $repoRoot "docs\reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

Write-Host "Registrando tarea programada '$TaskName' a las $DailyTime..."

schtasks /Create /F /SC DAILY /ST $DailyTime /TN $TaskName /TR $runnerPath | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "No se pudo crear la tarea programada."
}

Write-Host "Tarea creada correctamente."
Write-Host "Consulta: schtasks /Query /TN $TaskName /V /FO LIST"
