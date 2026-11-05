# Coverlens_WEB

SPA pública del catálogo CoverLens + **editor admin** (`/admin`).

| | |
|--|--|
| **Stack** | Vite + React 19 + TypeScript |
| **Datos / API** | Repo hermano [`../coverlens_resource`](../coverlens_resource) |
| **Producción** | https://covers.cholloweb.es |

## Empezar

1. Abre **`../COVERLENS_PROJECT.code-workspace`** (resource + web juntos).
2. Lee [`../coverlens_resource/docs/ARQUITECTURA.md`](../coverlens_resource/docs/ARQUITECTURA.md).

## Desarrollo local (Mac)

```bash
npm run dev:api:mac   # terminal 1 — PHP :8080
npm run dev           # terminal 2 — Vite :5173
```

Admin: http://localhost:5173/admin — ver [`docs/ADMIN.md`](docs/ADMIN.md).

## Despliegue

```bash
# Desde coverlens_resource (recomendado)
../coverlens_resource/scripts/deploy-prod.sh admin-web

# Solo web
npm run build && python3 scripts/deploy-web-vps.py
```

Checklist: [`PASOS.md`](PASOS.md)
