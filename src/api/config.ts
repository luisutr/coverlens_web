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

/** Versión estable para ?v= (mtime ms, ISO, fecha). */
export function coverCacheVersion(version?: string | number | null): string {
  if (version == null || version === '') return '';
  if (typeof version === 'number' && Number.isFinite(version)) {
    return String(Math.floor(version));
  }
  const s = String(version).trim();
  if (/^\d{10,}$/.test(s)) return s;
  const digits = s.replace(/\D/g, '');
  return digits || s;
}

/** URL de portada con cache-bust; tras subir manual usa `Date.now()` como version. */
export function coverDisplayUrl(
  coverPath: string | null | undefined,
  version?: string | number | null,
): string | null {
  const base = absoluteCoverUrl(coverPath);
  if (!base) return null;
  const v =
    typeof version === 'number'
      ? String(version)
      : coverCacheVersion(version ?? null);
  if (!v) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${encodeURIComponent(v)}`;
}
