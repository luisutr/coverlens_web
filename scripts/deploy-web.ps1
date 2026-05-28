# Sube solo la SPA (dist/) al VPS. NO toca games/, covers/ ni api/.
# Requiere: rsync o scp + acceso SSH al VPS (ver datos_vps/VPS_CONEXION.md).

$ErrorActionPreference = "Stop"

$Dist = Join-Path $PSScriptRoot "..\dist"
$VpsHost = "195.110.59.186"
$VpsUser = "root"
$VpsPath = "/home/covers.cholloweb.es/public_html"

if (-not (Test-Path $Dist)) {
    Write-Error "Ejecuta npm run build antes de desplegar."
}

Write-Host "Subiendo dist/ a ${VpsUser}@${VpsHost}:${VpsPath}/"
Write-Host "NOTA: esto NO borra games/ ni covers/ del servidor."

# rsync via Git Bash si está disponible; si no, indicar scp manual
$gitBash = "C:\Program Files\Git\bin\bash.exe"
if (Test-Path $gitBash) {
    & $gitBash -lc "rsync -avz --exclude 'games' --exclude 'covers' --exclude 'api' '$($Dist -replace '\\','/')/' ${VpsUser}@${VpsHost}:${VpsPath}/"
} else {
    Write-Host "Instala Git for Windows para rsync, o sube dist/ manualmente por SFTP a:"
    Write-Host "  ${VpsPath}/"
    Write-Host "  (index.html, assets/)"
}
