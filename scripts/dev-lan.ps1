# Frontend en LAN, sin HMR (más fiable en móvil que vite --host solo).
$ErrorActionPreference = "Stop"
$env:COVERLENS_NO_HMR = "1"
Set-Location (Join-Path $PSScriptRoot "..")
Write-Host "Modo LAN (HMR desactivado para movil)" -ForegroundColor Cyan
npm run dev -- --host
