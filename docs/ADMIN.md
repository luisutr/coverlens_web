# Editor de catálogo (admin)

Herramienta privada para revisar y curar fichas: editar campos, subir portadas y regenerar índices.

## Producción (móvil o cualquier red)

Edición directa en el VPS, sin PC encendido.

1. **Primera vez — configurar auth en el VPS:**

```bash
cd coverlens_resource
python3 scripts/local/vps-admin/vps-setup-admin-api.py
```

Genera `ADMIN_API_KEY` en tu `.env` local y `api/admin/config.php` en el servidor.

2. **Desplegar código actualizado:**

```bash
# API admin (PHP)
python3 scripts/local/sync/vps-deploy.py

# Frontend (SPA con login)
cd ../Coverlens_WEB
npm run build
python3 scripts/deploy-web-vps.py
```

3. **Usar el editor:**

- Abre: https://covers.cholloweb.es/admin/login
- Pega el token (`ADMIN_API_KEY` de tu `.env` local)
- Navega, edita fichas y guarda (los cambios son inmediatos en producción)

La API exige `Authorization: Bearer <token>` cuando existe `api/admin/config.php` en el VPS.

Las fichas guardadas desde admin se marcan con `manualEditedAt` y `localization.source: manual` para que el worker `lang` no las reprocese.

## Desarrollo local (opcional)

Sin `api/admin/config.php` en local, la API acepta peticiones desde **localhost** o red doméstica sin token.

Terminal 1 — API PHP local (datos de `coverlens_resource`):

```powershell
cd Coverlens_WEB
npm run dev:api
```

Terminal 2 — frontend:

```powershell
npm run dev
```

Abre: http://localhost:5173/admin

### Desde el móvil en la misma Wi‑Fi (dev)

```powershell
npm run dev:api:lan
npm run dev:lan
```

Abre `http://192.168.x.x:5173/admin` en el móvil.

## Uso del editor

1. Activa filtros como **Sin carátula**, **Sin descripción**, **Sin barcode** o **Sin editor**.
2. Entra en una ficha y edita los campos.
3. **Plataforma incorrecta:** en el desplegable elige la plataforma correcta y pulsa **Guardar** (mueve JSON + portada a la carpeta nueva).
4. Sube una carátula JPG/PNG/WebP si hace falta.
5. **Autorellenar metadatos** (columna de la portada): consulta IGDB, PriceCharting y ScreenScraper en el **servidor** (las credenciales API no salen al navegador). Rellena solo campos vacíos; revisa el formulario y pulsa **Guardar**. Opcional: marcar **Descargar portada si falta** (escribe el JPG en el VPS; el JSON se actualiza al guardar).
6. Pulsa **Guardar** (regenera índices automáticamente).

**Credenciales en el VPS:** PHP (usuario `nobody`) no puede leer `coverlens-worker/.env` del worker. Usa `/home/covers.cholloweb.es/admin-enrich.env` (solo IGDB/ScreenScraper). Primera vez o tras rotar claves:

```bash
cd coverlens_resource
python3 scripts/local/vps-admin/vps-setup-admin-enrich-env.py
```

El admin en el navegador solo usa `ADMIN_API_KEY`.

### Modo portada rápida (grid)

Activa el interruptor **Portada rápida** en la barra del admin:

1. Pulsa **🔍** en una carátula → abre Google Imágenes con título + plataforma.
2. En Google: clic derecho → **Copiar imagen**.
3. Vuelve al admin y **pulsa la carátula** → se pega y sube al servidor.
4. El título/resto de la tarjeta sigue abriendo la ficha completa.

Requiere HTTPS (producción o localhost). Funciona mejor en Chrome/Edge.

### Eliminar fichas incorrectas

**Ficha individual:** en la pantalla de edición, al final → **Zona peligrosa → Eliminar ficha…** (doble confirmación; hay que escribir `ELIMINAR`).

**Varias fichas:** activa **Borrado múltiple** en la barra del grid:

1. Clic en una tarjeta para seleccionar/deseleccionar.
2. **Shift+clic** en otra para seleccionar el bloque entre ambas.
3. **Toda la página** / **Limpiar** en la barra roja.
4. **Eliminar selección…** → doble confirmación (escribe `ELIMINAR`).

Máximo **200 fichas** por operación. Borra JSON + portada y regenera índices.

Los modos **Portada rápida** y **Borrado múltiple** son excluyentes (solo uno activo).

## Publicar ediciones hechas en local (flujo legacy)

Si editaste en local y quieres subir al VPS:

```powershell
cd Coverlens_WEB
npm run deploy:local-edits
```

Ese script regenera índices, hace `vps-deploy.py` y sube la API web pública.

## Notas

- El enlace al admin **no aparece** en la landing pública; usa la URL directa `/admin/login`.
- `vps-deploy.py` no sobrescribe `api/admin/config.php` ni `api/worker/config.php` en el VPS.
- Si falla **"No se pudo guardar la portada"**, ejecuta en el VPS (permisos PHP → `covers/` y `games/`):

```bash
python3 scripts/local/vps-admin/vps-fix-admin-perms.py
```

- Tras cambios en la lógica de índices, pulsa **Regenerar índices** una vez en el admin.
