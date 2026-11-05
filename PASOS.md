# CoverLens Web — Plan de trabajo

## Stack (estable y seguro)

| Capa | Tecnología |
|------|------------|
| Frontend | Vite + React 19 + TypeScript → HTML/CSS/JS estáticos |
| Grid | CSS grid responsive (2–8 cols) + **paginación** (48 juegos/página) |
| API | PHP `browse.php` (solo GET) + `browse_index.json` |
| Hosting | OpenLiteSpeed en `https://covers.cholloweb.es` |

---

## Fases

### Fase A — HTTPS ✅
- [x] Certificado Let's Encrypt (`vps-ssl-covers.py`)
- [x] Map listener SSL (`vps-fix-ssl-map.py`)
- [x] Bloque `vhssl` + redirect HTTP→HTTPS (`vps-config-spa.py`)

### Fase B — API rápida ✅
- [x] `browse_index.json` en `generate-indexes.js`
- [x] `browse.php` lee índice único + cache estática PHP
- [x] Deploy: `python scripts/deploy-api-vps.py`

### Fase C — Grid funcional + UI app ✅
- [x] `height: 100vh` en catálogo (scroll interno)
- [x] Hasta 8 columnas en escritorio (`src/utils/gridLayout.ts`)
- [x] `max-width: 1600px` centrado
- [x] Tarjetas estilo app (`GameCard`)

### Fase D — Tests ✅
- [x] Vitest: `npm test` (columnas + formato EUR)
- [x] `scripts/verify-production.ps1` (smoke HTTPS + browse + SPA)
- [x] `data-testid="game-card"` en tarjetas

### Fase E — Deploy ✅
- [x] Build + deploy web + API + vhost
- [x] Verificación producción (browse ~200ms, 53668 juegos)

---

## Comandos

```powershell
# Desarrollo local
cd c:\WEBS\Coverlens_WEB
npm run dev:api    # terminal 1 — PHP :8080 (XAMPP)
npm run dev        # terminal 2 — Vite :5173

# Editor local (completar fichas a mano)
# http://localhost:5173/admin
# Movil en Wi-Fi: npm run dev:api:lan + npm run dev:lan  ->  http://192.168.x.x:5173/admin
# Ver docs/ADMIN.md

# Publicar ediciones manuales al VPS
npm run deploy:local-edits

# Tests
npm test
powershell -File scripts/verify-production.ps1

# Regenerar índices (cuando crece el catálogo)
cd c:\WEBS\coverlens_resource
node scripts/generate-indexes.js

# Deploy web (SIEMPRE npm run build antes)
cd c:\WEBS\Coverlens_WEB
npm run build
python scripts/deploy-web-vps.py

# Deploy API web (browse.php + browse_index.json)
python scripts/deploy-api-vps.py

# SSL / vhost (si hace falta)
python scripts/vps-config-spa.py
```

## Deploy catálogo completo (periódico)

```bash
cd c:\WEBS\coverlens_resource
python scripts/vps-deploy.py
```

## Checklist manual en navegador

- [ ] `https://covers.cholloweb.es/` — candado verde
- [ ] `/catalogo` — grid con tarjetas + paginación (Anterior/Siguiente)
- [ ] Cambiar página carga 48 juegos nuevos (sin acumular memoria)
- [ ] Filtro plataforma + búsqueda
- [ ] Click → ficha detalle
- [ ] ~8 columnas en pantalla ancha, 2 en móvil
