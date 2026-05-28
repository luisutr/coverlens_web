# Verificación smoke de producción — covers.cholloweb.es
$ErrorActionPreference = "Stop"
$Base = "https://covers.cholloweb.es"
$Failed = 0

function Test-Check {
    param([string]$Name, [bool]$Ok, [string]$Detail = "")
    if ($Ok) {
        Write-Host "[OK] $Name" -ForegroundColor Green
        if ($Detail) { Write-Host "     $Detail" }
    } else {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        if ($Detail) { Write-Host "     $Detail" }
        $script:Failed++
    }
}

Write-Host "=== CoverLens producción ===" -ForegroundColor Cyan

try {
    $https = Invoke-WebRequest -Uri "$Base/" -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
    Test-Check "HTTPS landing" ($https.StatusCode -eq 200) "status $($https.StatusCode)"
} catch {
    Test-Check "HTTPS landing" $false $_.Exception.Message
}

try {
    $http = Invoke-WebRequest -Uri "http://covers.cholloweb.es/" -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 15 -ErrorAction SilentlyContinue
    $redirectOk = $http.StatusCode -eq 301 -or $http.StatusCode -eq 302
    Test-Check "HTTP redirect" $redirectOk "status $($http.StatusCode)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Test-Check "HTTP redirect" $true "status redirect"
    } else {
        Test-Check "HTTP redirect" $false $_.Exception.Message
    }
}

try {
    $platforms = Invoke-RestMethod -Uri "$Base/games/platforms.json" -TimeoutSec 30
    Test-Check "platforms.json" ($platforms.totalGames -gt 50000) "totalGames=$($platforms.totalGames)"
} catch {
    Test-Check "platforms.json" $false $_.Exception.Message
}

try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $browse = Invoke-RestMethod -Uri "$Base/api/browse.php?page=1&limit=48" -TimeoutSec 30
    $sw.Stop()
    $ms = $sw.ElapsedMilliseconds
    Test-Check "browse.php page 1" (
        $browse.results.Count -eq 48 -and $browse.total -gt 0 -and $ms -lt 8000
    ) "results=$($browse.results.Count) total=$($browse.total) ${ms}ms"
} catch {
    Test-Check "browse.php page 1" $false $_.Exception.Message
}

try {
    $ps5 = Invoke-RestMethod -Uri "$Base/api/browse.php?platform=ps5&limit=5" -TimeoutSec 30
    Test-Check "browse.php ps5" ($ps5.results.Count -eq 5) "count=$($ps5.results.Count)"
} catch {
    Test-Check "browse.php ps5" $false $_.Exception.Message
}

try {
    $catalog = Invoke-WebRequest -Uri "$Base/catalogo" -UseBasicParsing -TimeoutSec 30
    $hasRoot = $catalog.Content -match 'id="root"'
    $hasAssets = $catalog.Content -match '/assets/'
    Test-Check "SPA /catalogo" ($catalog.StatusCode -eq 200 -and $hasRoot -and $hasAssets)
} catch {
    Test-Check "SPA /catalogo" $false $_.Exception.Message
}

Write-Host ""
if ($Failed -eq 0) {
    Write-Host "Todos los checks pasaron." -ForegroundColor Green
    exit 0
} else {
    Write-Host "$Failed check(s) fallaron." -ForegroundColor Red
    exit 1
}
