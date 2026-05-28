# Publica ediciones manuales al VPS (catálogo + índices).
# Ejecutar tras guardar fichas en el editor local.

$ErrorActionPreference = "Stop"

$ResourceRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\coverlens_resource")
$WebRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Host "== CoverLens: publicar ediciones locales ==" -ForegroundColor Cyan
Write-Host ""

Write-Host "1/3 Regenerar índices..." -ForegroundColor Yellow
Push-Location $ResourceRoot
node scripts/generate-indexes.js
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "generate-indexes.js falló"
}
Pop-Location

Write-Host ""
Write-Host "2/3 Deploy catálogo (JSON + portadas)..." -ForegroundColor Yellow
Push-Location $ResourceRoot
python scripts/vps-deploy.py
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "vps-deploy.py falló"
}
Pop-Location

Write-Host ""
Write-Host "3/3 Deploy API web (browse + índices)..." -ForegroundColor Yellow
Push-Location $WebRoot
python scripts/deploy-api-vps.py
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "deploy-api-vps.py falló"
}
Pop-Location

Write-Host ""
Write-Host "Listo. Verifica: https://covers.cholloweb.es/catalogo" -ForegroundColor Green
