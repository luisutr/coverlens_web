# Servidor PHP local para browse.php y API admin (coverlens_resource).
# Uso: dev-api.ps1 [-Lan]  — -Lan escucha en 0.0.0.0 para móvil en Wi‑Fi de casa.
# Requiere XAMPP PHP en C:\xampp\php (o ajustar $PhpExe abajo).

param(
    [switch]$Lan
)

$ErrorActionPreference = "Stop"

$PhpExe = "C:\xampp\php\php.exe"
$ResourceRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\coverlens_resource")
$GamesLink = Join-Path $ResourceRoot "games"
$GamesTarget = Join-Path $ResourceRoot "data\games"
$Port = 8080
$BindHost = if ($Lan) { "0.0.0.0" } else { "localhost" }

function Get-LanIpv4Addresses {
    $ips = @()
    foreach ($addr in Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue) {
        if ($addr.IPAddress -eq "127.0.0.1") { continue }
        if ($addr.PrefixOrigin -eq "WellKnown") { continue }
        $ips += $addr.IPAddress
    }
    if ($ips.Count -eq 0) {
        $line = ipconfig | Select-String -Pattern "IPv4.*:\s*(\d+\.\d+\.\d+\.\d+)" | Select-Object -First 3
        foreach ($m in $line) {
            if ($m.Matches.Groups[1].Value -notmatch "^127\.") {
                $ips += $m.Matches.Groups[1].Value
            }
        }
    }
    return $ips | Select-Object -Unique
}

if (-not (Test-Path $PhpExe)) {
    Write-Error "No se encuentra PHP en $PhpExe. Ajusta la ruta en scripts/dev-api.ps1"
}

if (-not (Test-Path $GamesTarget)) {
    Write-Error "No existe $GamesTarget"
}

if (-not (Test-Path $GamesLink)) {
    Write-Host "Creando enlace games -> data/games..."
    cmd /c mklink /J "$GamesLink" "$GamesTarget"
}

$coversDir = Join-Path $ResourceRoot "covers"
if (-not (Test-Path $coversDir)) {
    New-Item -ItemType Directory -Path $coversDir | Out-Null
    Write-Host "Creada carpeta covers/"
}

Write-Host "API: http://${BindHost}:$Port  (modo $(if ($Lan) { 'LAN' } else { 'solo PC' }))"
Write-Host "  browse: http://localhost:$Port/api/browse.php?page=1&limit=5"
Write-Host "  admin:  http://localhost:$Port/api/admin/browse.php?missingCover=1&limit=5"

if ($Lan) {
    $lanIps = Get-LanIpv4Addresses
    if ($lanIps.Count -gt 0) {
        Write-Host ""
        Write-Host "Desde el movil (misma Wi-Fi), terminal 2: npm run dev:lan" -ForegroundColor Cyan
        foreach ($ip in $lanIps) {
            Write-Host "  Editor: http://${ip}:5173/admin" -ForegroundColor Green
        }
    } else {
        Write-Host "No se detectó IP LAN. Usa ipconfig y abre http://TU_IP:5173/admin" -ForegroundColor Yellow
    }
} else {
    Write-Host "Frontend PC: npm run dev  ->  http://localhost:5173/admin"
}

Write-Host ""
Write-Host "Pulsa Ctrl+C para detener."
Write-Host ""

Set-Location $ResourceRoot
& $PhpExe -S "${BindHost}:$Port" -t $ResourceRoot
