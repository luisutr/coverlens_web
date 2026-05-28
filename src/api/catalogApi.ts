import { apiUrl } from './config';
import type { BrowseResponse, CatalogFilters, GameDetail, PlatformsManifest } from '../types/catalog';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlatforms(): Promise<PlatformsManifest> {
  return fetchJson<PlatformsManifest>(apiUrl('/games/platforms.json'));
}

export async function fetchBrowse(
  filters: CatalogFilters,
  page: number,
  limit = 48,
): Promise<BrowseResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('sort', filters.sort);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.castilianText) params.set('castilianText', '1');
  if (filters.castilianVoice) params.set('castilianVoice', '1');
  return fetchJson<BrowseResponse>(apiUrl(`/api/browse.php?${params}`));
}

export async function fetchGameDetail(
  platformSlug: string,
  slug: string,
): Promise<GameDetail> {
  return fetchJson<GameDetail>(apiUrl(`/games/${platformSlug}/${slug}.json`));
}
