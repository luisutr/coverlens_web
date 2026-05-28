# Ejecutar una vez como Administrador: clic derecho PowerShell -> Ejecutar como administrador
# Permite que el movil conecte a los puertos 5173 (Vite) y 8080 (PHP).

$ErrorActionPreference = "Stop"

function Add-PortRule {
    param([string]$Name, [int]$Port)
    $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Regla ya existe: $Name"
        return
    }
    New-NetFirewallRule -DisplayName $Name `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort $Port `
        -Profile Private `
        | Out-Null
    Write-Host "Regla creada: $Name (puerto $Port, red Privada)" -ForegroundColor Green
}

Add-PortRule -Name "CoverLens Vite (5173)" -Port 5173
Add-PortRule -Name "CoverLens PHP API (8080)" -Port 8080
Write-Host ""
Write-Host "Listo. Reinicia npm run dev:api:lan y npm run dev:lan" -ForegroundColor Cyan
