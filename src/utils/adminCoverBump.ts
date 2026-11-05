/** Cache-bust de portadas en esta sesión (tras subir en admin). */
const STORAGE_KEY = 'coverlens_admin_cover_bump';

function loadMap(): Record<string, number> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        out[key] = value;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveMap(map: Record<string, number>): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function adminCoverKey(platformSlug: string, slug: string): string {
  return `${platformSlug}/${slug}`;
}

/** Marca una portada como actualizada (p. ej. tras upload en ficha o grid). */
export function bumpAdminCoverCache(platformSlug: string, slug: string, version?: number): void {
  const map = loadMap();
  map[adminCoverKey(platformSlug, slug)] = version ?? Date.now();
  saveMap(map);
}

export function getAdminCoverBump(platformSlug: string, slug: string): number | null {
  return loadMap()[adminCoverKey(platformSlug, slug)] ?? null;
}

/** Aplica ?v= de sesión si hay bump más reciente que la URL del API. */
export function applyAdminCoverBump(
  coverUrl: string | null | undefined,
  platformSlug: string,
  slug: string,
): string | null {
  if (!coverUrl) return null;
  const bump = getAdminCoverBump(platformSlug, slug);
  if (!bump) return coverUrl;

  const base = coverUrl.split('?')[0];
  const existing = coverUrl.match(/[?&]v=([^&]+)/)?.[1];
  const existingNum = existing ? Number(existing.replace(/\D/g, '')) : 0;
  const bumpNum = bump;

  if (existingNum >= bumpNum) return coverUrl;
  return `${base}?v=${bump}`;
}
