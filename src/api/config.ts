/** Base URL del recurso CoverLens. Vacío = mismo origen (producción en covers.cholloweb.es). */
export const API_BASE = import.meta.env.VITE_COVERLENS_API_BASE ?? '';

export function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function absoluteCoverUrl(coverPath: string | null | undefined): string | null {
  const p = coverPath?.trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && p.startsWith('http://')) {
      return p.replace(/^http:\/\//i, 'https://');
    }
    return p;
  }
  return apiUrl(p.startsWith('/') ? p : `/${p}`);
}
