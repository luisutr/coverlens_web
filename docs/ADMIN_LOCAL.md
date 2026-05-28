# Editor local de catálogo

Herramienta para revisar y completar fichas incompletas en local, sin backend de escritura en el VPS.

## Arranque

Terminal 1 — API PHP local (datos de `coverlens_resource`):

```powershell
cd c:\WEBS\Coverlens_WEB
npm run dev:api
```

Terminal 2 — frontend con editor admin:

```powershell
cd c:\WEBS\Coverlens_WEB
npm run dev
```

Abre: http://localhost:5173/admin

## Desde el móvil (misma Wi‑Fi)

Terminal 1 — API en la red local:

```powershell
cd c:\WEBS\Coverlens_WEB
npm run dev:api:lan
```

Terminal 2 — frontend accesible en la LAN:

```powershell
cd c:\WEBS\Coverlens_WEB
npm run dev:lan
```

En el PC verás una URL tipo `http://192.168.x.x:5173/admin`. Ábrela en el navegador del móvil (misma red Wi‑Fi).

Si Windows pregunta por el firewall, permite **Node** y **PHP** en redes privadas.

**Pantalla en blanco en el móvil:**

1. URL con **`http://`** (no `https://`), p. ej. `http://192.168.1.29:5173/admin`.
2. Reinicia ambas terminales tras actualizar el código.
3. **Firewall (muy habitual):** en PowerShell **como Administrador**:
   ```powershell
   cd c:\WEBS\Coverlens_WEB
   npm run firewall:lan
   ```
4. Si sigue en blanco pero ves «Cargando CoverLens…» fijo → el JS no arranca; prueba modo estable:
   ```powershell
   npm run dev:api:lan
   npm run preview:lan
   ```
   (compila una vez; en el móvil misma URL `:5173/admin`).
5. Si la pantalla es **blanca total** sin texto → el móvil no llega al PC (firewall o Wi‑Fi distinta).

El deploy al VPS sigue haciéndose desde el PC (`npm run deploy:local-edits`).

## Uso

1. Activa filtros como **Sin carátula**, **Sin descripción**, **Sin barcode** o **Sin editor**.
2. Entra en una ficha y edita los campos manualmente.
3. Sube una carátula JPG/PNG/WebP si hace falta.
4. Pulsa **Guardar** (regenera índices automáticamente).
5. Cuando termines la sesión de edición, publica al VPS.

## Publicar al VPS

```powershell
cd c:\WEBS\Coverlens_WEB
powershell -ExecutionPolicy Bypass -File scripts/deploy-local-edits.ps1
```

Este script hace:

1. `node scripts/generate-indexes.js` en `coverlens_resource`
2. `python scripts/vps-deploy.py` (JSON + portadas)
3. `python scripts/deploy-api-vps.py` (browse + índices web)

## Notas

- La API admin (`/api/admin/*`) solo acepta **localhost** o IPs de red local (192.168.x.x, 10.x.x.x, etc.).
- Tras actualizar el código de índices, ejecuta **Regenerar índices** una vez para activar los filtros de incompletitud.
- El VPS sigue siendo de solo lectura; la edición ocurre siempre en tu PC.
