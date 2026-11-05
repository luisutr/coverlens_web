import { clearAdminToken, getAdminToken } from './adminAuth';
import { apiUrl } from './config';
import type {
  AdminBrowseResponse,
  AdminCreatePayload,
  AdminCreateResponse,
  AdminDeleteGameRef,
  AdminDeleteResponse,
  AdminEnrichPayload,
  AdminEnrichResponse,
  AdminFilters,
  AdminGameResponse,
  AdminRebuildResponse,
  AdminSavePayload,
  AdminSaveResponse,
  AdminSetPhysicalBatchResponse,
  BulkPhysicalFormat,
} from '../types/admin';

function adminAuthHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAdminToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: adminAuthHeaders(init?.headers),
  });
  if (res.status === 401) {
    clearAdminToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.assign('/admin/login');
    }
    throw new Error('Sesión admin inválida');
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `HTTP ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAdminBrowse(
  filters: AdminFilters,
  page: number,
  limit = 48,
): Promise<AdminBrowseResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('sort', filters.sort);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.missingCover) params.set('missingCover', '1');
  if (filters.missingDescription) params.set('missingDescription', '1');
  if (filters.missingBarcode) params.set('missingBarcode', '1');
  if (filters.missingPublisher) params.set('missingPublisher', '1');
  if (filters.physicalOnly) params.set('physicalOnly', '1');
  if (filters.digitalOnly) params.set('digitalOnly', '1');
  return adminFetchJson<AdminBrowseResponse>(apiUrl(`/api/admin/browse.php?${params}`));
}

export async function fetchAdminGame(
  platformSlug: string,
  slug: string,
): Promise<AdminGameResponse> {
  const params = new URLSearchParams({ platform: platformSlug, slug });
  return adminFetchJson<AdminGameResponse>(apiUrl(`/api/admin/game.php?${params}`));
}

export async function saveAdminGame(payload: AdminSavePayload): Promise<AdminSaveResponse> {
  return adminFetchJson<AdminSaveResponse>(apiUrl('/api/admin/save.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createAdminGame(payload: AdminCreatePayload): Promise<AdminCreateResponse> {
  return adminFetchJson<AdminCreateResponse>(apiUrl('/api/admin/create.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function uploadAdminCover(
  platformSlug: string,
  slug: string,
  file: File,
  rebuildIndexes = true,
): Promise<AdminSaveResponse> {
  const form = new FormData();
  form.set('platformSlug', platformSlug);
  form.set('slug', slug);
  form.set('cover', file);
  if (rebuildIndexes) form.set('rebuildIndexes', '1');
  return adminFetchJson<AdminSaveResponse>(apiUrl('/api/admin/upload-cover.php'), {
    method: 'POST',
    body: form,
  });
}

export async function rebuildAdminIndexes(): Promise<AdminRebuildResponse> {
  return adminFetchJson<AdminRebuildResponse>(apiUrl('/api/admin/rebuild.php'), {
    method: 'POST',
  });
}

export async function deleteAdminGames(
  games: AdminDeleteGameRef[],
  rebuildIndexes = true,
): Promise<AdminDeleteResponse> {
  return adminFetchJson<AdminDeleteResponse>(apiUrl('/api/admin/delete.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ games, rebuildIndexes }),
  });
}

export async function setPhysicalFormatBatch(
  games: AdminDeleteGameRef[],
  format: BulkPhysicalFormat,
  rebuildIndexes = true,
): Promise<AdminSetPhysicalBatchResponse> {
  return adminFetchJson<AdminSetPhysicalBatchResponse>(
    apiUrl('/api/admin/set-physical-batch.php'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ games, format, rebuildIndexes }),
    },
  );
}

export async function enrichAdminGame(payload: AdminEnrichPayload): Promise<AdminEnrichResponse> {
  return adminFetchJson<AdminEnrichResponse>(apiUrl('/api/admin/enrich.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
