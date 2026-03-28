param(
    [string]$ProjectRoot = "C:\acad_perf_pre_sys",
    [int]$BackendPort = 5000,
    [int]$FrontendPort = 3000
)

$ErrorActionPreference = "Stop"

function Test-PortInUse {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return $null -ne $conn
}

function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$TimeoutSec = 3
    )

    try {
        $resp = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec $TimeoutSec -ErrorAction Stop
        return $resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

if (-not (Test-Path $ProjectRoot)) {
    throw "Project root not found: $ProjectRoot"
}

$backendPath = Join-Path $ProjectRoot "backend"
$frontendPath = Join-Path $ProjectRoot "frontend"
$venvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    throw "Python venv executable not found: $venvPython"
}

$backendHealthUrl = "http://127.0.0.1:$BackendPort/health"

if (-not (Test-HttpEndpoint -Url $backendHealthUrl)) {
    $backendCmd = "Set-Location '$backendPath'; & '$venvPython' run.py"
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null
    Write-Host "Backend start command launched on port $BackendPort"
}
else {
    Write-Host "Backend already running and healthy on port $BackendPort"
}

$frontendLoginUrl = "http://127.0.0.1:$FrontendPort/login"
$frontendAltPort = $FrontendPort + 1
$frontendAltLoginUrl = "http://127.0.0.1:$frontendAltPort/login"

if ((Test-HttpEndpoint -Url $frontendLoginUrl) -or (Test-HttpEndpoint -Url $frontendAltLoginUrl)) {
    Write-Host "Frontend already running (detected on port $FrontendPort or $frontendAltPort)"
}
else {
    $frontendCmd = "Set-Location '$frontendPath'; npm run dev"
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null
    Write-Host "Frontend start command launched (expected port $FrontendPort)"
}

Write-Host ""
Write-Host "Check services:" -ForegroundColor Cyan
Write-Host "Backend health: http://127.0.0.1:$BackendPort/health"
Write-Host "Frontend login: http://127.0.0.1:$FrontendPort/login"
Write-Host "Fallback frontend login: http://127.0.0.1:$frontendAltPort/login"
